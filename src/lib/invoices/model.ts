/**
 * Velodesk invoices & receipts: pure model (no I/O). Shared by issuing, email, PDF and UI.
 *
 * One record per successful subscription charge. It is the invoice (VD-2026-00001,
 * marked PAID) and the receipt (VDR-2026-00001) for that charge.
 *
 * VAT: plan prices are VAT-INCLUSIVE, so the invoice total always equals the amount
 * charged to the card and VAT is backed out of it. A VAT line only appears when
 * BILLING_TIN is set (Crelligent is VAT-registered) and the invoice is in NGN.
 * USD invoices (customers abroad) carry no VAT line.
 */

export type InvoiceCurrency = 'NGN' | 'USD'

export interface Party {
    name: string
    email?: string | null
    company?: string | null
    address?: string | null
    taxId?: string | null
}

export interface Seller {
    name: string
    address: string | null
    rcNumber: string | null
    tin: string | null
    email: string
    website: string
}

export interface Invoice {
    id: string
    number: string
    receipt_number: string
    status: 'paid' | 'refunded' | 'void'
    provider: 'paystack' | 'stripe'
    provider_reference: string
    currency: InvoiceCurrency
    subtotal: number
    tax: number
    total: number
    tax_rate: number
    tax_label: string | null
    plan: string | null
    description: string
    period_start: string | null
    period_end: string | null
    issued_at: string
    paid_at: string
    payment_method: string | null
    customer: Party
    seller: Seller
}

// ---------------------------------------------------------------------------
// Seller (Crelligent) details, from env so they can change without a deploy of code
// ---------------------------------------------------------------------------

const clean = (v: string | undefined) => {
    const s = (v ?? '').trim().replace(/^["']|["']$/g, '')
    return s || null
}

export function sellerFromEnv(env: Record<string, string | undefined> = process.env): Seller {
    return {
        name: clean(env.BILLING_COMPANY_NAME) ?? 'Crelligent & Company Ltd',
        // Use "\n" (two characters) in the env value for line breaks
        address: clean(env.BILLING_COMPANY_ADDRESS)?.replace(/\\n/g, '\n') ?? null,
        rcNumber: clean(env.BILLING_RC_NUMBER),
        tin: clean(env.BILLING_TIN),
        email: clean(env.BILLING_SUPPORT_EMAIL) ?? clean(env.BILLING_FROM) ?? 'billing@crelligent.com',
        website: 'crelligent.com',
    }
}

// ---------------------------------------------------------------------------
// Amounts
// ---------------------------------------------------------------------------

export interface TaxSplit {
    subtotal: number
    tax: number
    total: number
    taxRate: number
    taxLabel: string | null
}

/** Splits a VAT-inclusive charge (minor units) into subtotal + VAT. */
export function splitTax(
    totalMinor: number,
    currency: string,
    seller: Pick<Seller, 'tin'>,
    ratePercent = 7.5
): TaxSplit {
    const total = Math.max(0, Math.round(totalMinor))
    const applies = !!seller.tin && currency.toUpperCase() === 'NGN' && ratePercent > 0
    if (!applies) return { subtotal: total, tax: 0, total, taxRate: 0, taxLabel: null }
    const tax = Math.round((total * ratePercent) / (100 + ratePercent))
    return { subtotal: total - tax, tax, total, taxRate: ratePercent, taxLabel: `VAT ${ratePercent}%` }
}

export function vatRateFromEnv(env: Record<string, string | undefined> = process.env): number {
    const n = Number(clean(env.BILLING_VAT_RATE) ?? '7.5')
    return Number.isFinite(n) && n >= 0 && n < 100 ? n : 7.5
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const SYMBOL: Record<InvoiceCurrency, string> = { NGN: '₦', USD: '$' }

/** 5000000, 'NGN' -> '₦50,000.00'; { code: true } -> 'NGN 50,000.00' (PDF fonts lack ₦) */
export function formatMoney(minor: number, currency: string, opts: { code?: boolean } = {}): string {
    const cur = currency.toUpperCase() as InvoiceCurrency
    const value = (minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (opts.code || !SYMBOL[cur]) return `${cur} ${value}`
    return `${SYMBOL[cur]}${value}`
}

/** '2026-10-10T…' -> '10 Oct 2026' (Lagos time) */
export function formatDate(iso: string | null | undefined): string {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Africa/Lagos',
    })
}

export function formatPeriod(start: string | null, end: string | null): string {
    if (!start || !end) return ''
    return `${formatDate(start)} – ${formatDate(end)}`
}

const PLAN_NAMES: Record<string, string> = {
    founder: 'Founder plan',
    startup: 'Startup plan',
    accelerator: 'Accelerator plan',
    pro: 'Pro plan',
    enterprise: 'Enterprise plan',
}

/** 'founder', 'monthly' -> 'Velodesk Founder plan (monthly subscription)' */
export function lineDescription(plan: string | null | undefined, interval: string | null | undefined): string {
    const name = (plan && PLAN_NAMES[plan]) || 'subscription'
    const every = interval && interval !== 'monthly' ? interval : 'monthly'
    return `Velodesk ${name} (${every} subscription)`
}

/** 'visa', '4081' -> 'Visa •••• 4081' */
export function cardLabel(brand: string | null | undefined, last4: string | null | undefined): string | null {
    if (!last4) return brand ? titleCase(brand) : null
    return `${brand ? titleCase(brand) : 'Card'} •••• ${last4}`
}

function titleCase(s: string) {
    const t = s.trim()
    if (/^(amex|american express)$/i.test(t)) return 'Amex'
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
}

/** Access continues for 3 days after a failed charge (matches getEntitlement's grace). */
export const PAYMENT_GRACE_MS = 3 * 24 * 60 * 60 * 1000

/** When access ends if a declined card isn't updated. */
export function accessUntilAfterFailure(
    sub: { past_due_since?: string | null; current_period_end?: string | null },
    now = new Date()
): string {
    const base = sub.past_due_since ?? sub.current_period_end ?? now.toISOString()
    return new Date(new Date(base).getTime() + PAYMENT_GRACE_MS).toISOString()
}

export function customerDisplayName(c: Party): string {
    return c.company || c.name || c.email || 'Customer'
}
