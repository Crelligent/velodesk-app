/**
 * Issuing and emailing Velodesk invoices/receipts. Server only (service-role client).
 *
 * - issueInvoice(): one invoice per provider payment reference (unique in the DB), so
 *   callback + webhook + webhook retries can all call it safely. Throws on DB errors so
 *   the webhook returns 500 and the provider retries.
 * - emailInvoice(): claims `emailed_at` atomically before sending, so a race never sends
 *   two receipts; on SMTP failure the claim is released and the error recorded.
 * - notifyPaymentFailed(): one "payment declined" email per failure episode
 *   (`payment_failed_notified_at` is cleared when a payment succeeds).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendMail } from '@/lib/mailer'
import {
    accessUntilAfterFailure,
    lineDescription,
    sellerFromEnv,
    splitTax,
    vatRateFromEnv,
    type Invoice,
    type InvoiceCurrency,
    type Party,
} from './model'
import { paymentFailedEmail, receiptEmail } from './emails'
import { pdfFilename, renderInvoicePdf } from './pdf'

export interface ChargeInput {
    userId: string
    provider: 'paystack' | 'stripe'
    /** Paystack transaction reference / Stripe invoice id (unique per provider) */
    reference: string
    amountMinor: number
    currency: string
    paidAt: string
    plan: string | null
    interval?: string | null
    periodStart?: string | null
    periodEnd?: string | null
    paymentMethod?: string | null
}

const INVOICE_COLUMNS =
    'id, number, receipt_number, status, provider, provider_reference, currency, subtotal, tax, total, tax_rate, tax_label, plan, description, period_start, period_end, issued_at, paid_at, payment_method, customer, seller, emailed_at'

type InvoiceRow = Invoice & { emailed_at: string | null; user_id?: string | null }

/** Customer snapshot from the profile (falls back to the auth email). */
async function loadCustomer(admin: SupabaseClient, userId: string): Promise<Party> {
    const { data: profile, error } = await admin
        .from('profiles')
        .select('email, full_name, company_name, billing_address, tax_id')
        .eq('id', userId)
        .maybeSingle()
    if (error) throw error
    let email: string | null = profile?.email ?? null
    if (!email) {
        const { data } = await admin.auth.admin.getUserById(userId)
        email = data?.user?.email ?? null
    }
    return {
        name: profile?.full_name?.trim() || '',
        email,
        company: profile?.company_name?.trim() || null,
        address: profile?.billing_address?.trim() || null,
        taxId: profile?.tax_id?.trim() || null,
    }
}

export async function issueInvoice(admin: SupabaseClient, charge: ChargeInput): Promise<InvoiceRow> {
    const currency = charge.currency.toUpperCase() as InvoiceCurrency
    if (currency !== 'NGN' && currency !== 'USD') throw new Error(`Unsupported invoice currency ${charge.currency}`)

    const existing = await admin
        .from('invoices')
        .select(INVOICE_COLUMNS)
        .eq('provider', charge.provider)
        .eq('provider_reference', charge.reference)
        .maybeSingle()
    if (existing.error) throw existing.error
    if (existing.data) return existing.data as InvoiceRow

    const seller = sellerFromEnv()
    const amounts = splitTax(charge.amountMinor, currency, seller, vatRateFromEnv())
    const customer = await loadCustomer(admin, charge.userId)

    const { data, error } = await admin
        .from('invoices')
        .insert({
            user_id: charge.userId,
            provider: charge.provider,
            provider_reference: charge.reference,
            status: 'paid',
            currency,
            subtotal: amounts.subtotal,
            tax: amounts.tax,
            total: amounts.total,
            tax_rate: amounts.taxRate,
            tax_label: amounts.taxLabel,
            plan: charge.plan,
            description: lineDescription(charge.plan, charge.interval),
            period_start: charge.periodStart ?? charge.paidAt,
            period_end: charge.periodEnd ?? null,
            paid_at: charge.paidAt,
            payment_method: charge.paymentMethod ?? null,
            customer,
            seller,
        })
        .select(INVOICE_COLUMNS)
        .single()

    if (error?.code === '23505') {
        // Another request issued it first
        const again = await admin
            .from('invoices')
            .select(INVOICE_COLUMNS)
            .eq('provider', charge.provider)
            .eq('provider_reference', charge.reference)
            .single()
        if (again.error) throw again.error
        return again.data as InvoiceRow
    }
    if (error) throw error
    return data as InvoiceRow
}

/** Renders both PDFs. */
export async function invoiceAttachments(inv: Invoice) {
    const [receipt, invoice] = await Promise.all([renderInvoicePdf(inv, 'receipt'), renderInvoicePdf(inv, 'invoice')])
    return [
        { filename: pdfFilename(inv, 'receipt'), content: receipt, contentType: 'application/pdf' },
        { filename: pdfFilename(inv, 'invoice'), content: invoice, contentType: 'application/pdf' },
    ]
}

/** Sends the receipt email once. Never throws. */
export async function emailInvoice(admin: SupabaseClient, inv: InvoiceRow): Promise<boolean> {
    const to = inv.customer?.email
    if (!to) {
        console.error(`Invoice ${inv.number}: customer has no email address`)
        return false
    }
    // Claim: only one sender wins
    const { data: claimed, error: claimError } = await admin
        .from('invoices')
        .update({ emailed_at: new Date().toISOString(), email_error: null })
        .eq('id', inv.id)
        .is('emailed_at', null)
        .select('id')
    if (claimError || !claimed?.length) return false

    try {
        const content = receiptEmail(inv)
        const result = await sendMail({ to, ...content, attachments: await invoiceAttachments(inv) })
        if (result.sent) return true
        await admin.from('invoices').update({ emailed_at: null, email_error: result.error }).eq('id', inv.id)
        console.error(`Invoice ${inv.number}: receipt email not sent (${result.error})`)
        return false
    } catch (error) {
        await admin.from('invoices').update({ emailed_at: null, email_error: 'render_failed' }).eq('id', inv.id)
        console.error(`Invoice ${inv.number}: receipt email failed`, error instanceof Error ? error.message : error)
        return false
    }
}

/** issueInvoice (throws on DB error) + emailInvoice (never throws). */
export async function issueAndEmailInvoice(admin: SupabaseClient, charge: ChargeInput): Promise<InvoiceRow> {
    const inv = await issueInvoice(admin, charge)
    if (!inv.emailed_at) await emailInvoice(admin, inv)
    return inv
}

/**
 * "Payment declined" email, once per failure episode. Call AFTER the subscription row
 * has been moved to past_due. Never throws.
 */
export async function notifyPaymentFailed(
    admin: SupabaseClient,
    userId: string,
    details: { amountMinor?: number | null; currency?: string | null; paymentMethod?: string | null } = {}
): Promise<boolean> {
    try {
        const { data: claimed, error } = await admin
            .from('subscriptions')
            .update({ payment_failed_notified_at: new Date().toISOString() })
            .eq('user_id', userId)
            .is('payment_failed_notified_at', null)
            .select('plan, currency, plan_amount, past_due_since, current_period_end')
        if (error || !claimed?.length) return false
        const sub = claimed[0]

        const customer = await loadCustomer(admin, userId)
        if (!customer.email) return false
        const content = paymentFailedEmail({
            name: customer.name,
            planName: lineDescription(sub.plan, null).replace(/\s*\(.*\)$/, ''),
            amountMinor: details.amountMinor ?? sub.plan_amount ?? null,
            currency: details.currency ?? sub.currency ?? null,
            paymentMethod: details.paymentMethod ?? null,
            accessUntil: accessUntilAfterFailure(sub),
        })
        const result = await sendMail({ to: customer.email, ...content })
        if (!result.sent) {
            await admin.from('subscriptions').update({ payment_failed_notified_at: null }).eq('user_id', userId)
            console.error(`Payment-failed email not sent for ${userId} (${result.error})`)
        }
        return result.sent
    } catch (error) {
        console.error('Payment-failed email error', error instanceof Error ? error.message : error)
        return false
    }
}
