import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { sendMail } from '@/lib/mailer'
import { cardLabel, lineDescription, sellerFromEnv, splitTax, vatRateFromEnv, type Invoice } from '@/lib/invoices/model'
import { paymentFailedEmail, receiptEmail, upcomingChargeEmail } from '@/lib/invoices/emails'
import { invoiceAttachments } from '@/lib/invoices/issue'

/**
 * POST /api/billing/invoices/test (internal: Authorization: Bearer <CRON_SECRET>)
 * Body: { "to": "uche@crelligent.com", "type": "receipt" | "failed" | "upcoming" | "trial", "currency": "NGN" | "USD" }
 * Sends a SAMPLE receipt (with both PDFs), payment-failed, renewal heads-up or trial-ending
 * email. Writes nothing to the DB.
 */
function authorized(request: Request) {
    const secret = (process.env.CRON_SECRET || '').trim()
    const given = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
    if (!secret || !given) return false
    const a = Buffer.from(secret)
    const b = Buffer.from(given)
    return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
    if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    const to = typeof body.to === 'string' ? body.to.trim() : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ error: 'Valid "to" required' }, { status: 400 })
    const currency = body.currency === 'USD' ? 'USD' : 'NGN'
    const amount = currency === 'NGN' ? 5_000_000 : 4_900

    if (body.type === 'upcoming' || body.type === 'trial') {
        const content = upcomingChargeEmail({
            name: 'Test Founder',
            planName: 'Velodesk Startup plan',
            amountMinor: amount,
            currency,
            chargeDate: new Date(Date.now() + 3 * 86_400_000).toISOString(),
            trialEnding: body.type === 'trial',
        })
        const result = await sendMail({ to, ...content, subject: `[TEST] ${content.subject}` })
        return NextResponse.json(result, { status: result.sent ? 200 : 502 })
    }

    if (body.type === 'failed') {
        const content = paymentFailedEmail({
            name: 'Test Founder',
            planName: 'Velodesk Startup plan',
            amountMinor: amount,
            currency,
            paymentMethod: 'Visa •••• 4081',
            accessUntil: new Date(Date.now() + 3 * 86_400_000).toISOString(),
        })
        const result = await sendMail({ to, ...content, subject: `[TEST] ${content.subject}` })
        return NextResponse.json(result, { status: result.sent ? 200 : 502 })
    }

    const seller = sellerFromEnv()
    const t = splitTax(amount, currency, seller, vatRateFromEnv())
    const now = new Date()
    const sample: Invoice = {
        id: 'test',
        number: `VD-${now.getFullYear()}-TEST`,
        receipt_number: `VDR-${now.getFullYear()}-TEST`,
        status: 'paid',
        provider: 'paystack',
        provider_reference: 'TEST-REFERENCE',
        currency,
        subtotal: t.subtotal,
        tax: t.tax,
        total: t.total,
        tax_rate: t.taxRate,
        tax_label: t.taxLabel,
        plan: 'startup',
        description: lineDescription('startup', 'monthly'),
        period_start: now.toISOString(),
        period_end: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
        issued_at: now.toISOString(),
        paid_at: now.toISOString(),
        payment_method: cardLabel('visa', '4081'),
        customer: { name: 'Test Founder', email: to, company: 'Test Startup Ltd', address: 'Lagos, Nigeria', taxId: null },
        seller,
    }
    const content = receiptEmail(sample)
    const result = await sendMail({ to, ...content, subject: `[TEST] ${content.subject}`, attachments: await invoiceAttachments(sample) })
    return NextResponse.json(result, { status: result.sent ? 200 : 502 })
}
