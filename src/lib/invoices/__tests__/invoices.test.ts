/**
 * Invoices & receipts tests. Plain node:assert, no framework, fake Supabase client.
 * Run: npx tsx src/lib/invoices/__tests__/invoices.test.ts
 */
import assert from 'node:assert/strict'
import { cardLabel, formatMoney, lineDescription, sellerFromEnv, splitTax } from '../model'
import { receiptEmail, paymentFailedEmail, upcomingChargeEmail } from '../emails'
import { dueReminders, type ReminderCandidate } from '../reminders'
import { renderInvoicePdf } from '../pdf'
import { issueAndEmailInvoice, issueInvoice, notifyPaymentFailed, type ChargeInput } from '../issue'
import { __setTransporterForTests } from '../../mailer'

let passed = 0
async function test(name: string, fn: () => void | Promise<void>) {
    await fn()
    passed++
    console.log(`ok - ${name}`)
}

// ---------------------------------------------------------------------------
// Minimal in-memory Supabase fake (only the chains issue.ts uses)
// ---------------------------------------------------------------------------
type Row = Record<string, any>
function fakeDb(tables: Record<string, Row[]>) {
    let seq = 0
    const from = (table: string) => {
        const rows = (tables[table] ??= [])
        let op: 'select' | 'insert' | 'update' = 'select'
        let payload: Row | null = null
        let returning = false
        const filters: ((r: Row) => boolean)[] = []
        const q: any = {
            select() { if (op !== 'select') returning = true; return q },
            insert(v: Row) { op = 'insert'; payload = v; return q },
            update(v: Row) { op = 'update'; payload = v; return q },
            eq(k: string, v: unknown) { filters.push(r => r[k] === v); return q },
            is(k: string, v: unknown) { filters.push(r => (r[k] ?? null) === v); return q },
            run() {
                if (op === 'insert') {
                    const dup = rows.find(r => r.provider === payload!.provider && r.provider_reference === payload!.provider_reference)
                    if (table === 'invoices' && dup) return { data: null, error: { code: '23505' } }
                    seq++
                    const row = { id: `00000000-0000-0000-0000-${String(seq).padStart(12, '0')}`, number: `VD-2026-${String(seq).padStart(5, '0')}`, receipt_number: `VDR-2026-${String(seq).padStart(5, '0')}`, issued_at: '2026-10-24T09:00:05Z', emailed_at: null, ...payload }
                    rows.push(row)
                    return { data: [row], error: null }
                }
                const matched = rows.filter(r => filters.every(f => f(r)))
                if (op === 'update') matched.forEach(r => Object.assign(r, payload))
                return { data: matched, error: null }
            },
            maybeSingle() { const { data, error } = q.run(); return Promise.resolve({ data: data?.[0] ?? null, error }) },
            single() { const { data, error } = q.run(); return Promise.resolve(error ? { data: null, error } : { data: data?.[0] ?? null, error: data?.[0] ? null : { code: 'PGRST116' } }) },
            then(res: any, rej: any) { return Promise.resolve(q.run()).then(res, rej) },
        }
        return q
    }
    return { from, auth: { admin: { getUserById: async () => ({ data: { user: { email: 'fallback@example.com' } } }) } }, tables } as any
}

const sent: { to: string; subject: string; attachments?: { filename: string }[] }[] = []
let failSmtp = false
function useFakeSmtp() {
    Object.assign(process.env, { SMTP_HOST: 'smtp.test', SMTP_USER: 'u', SMTP_PASS: 'p' })
    __setTransporterForTests({
        sendMail: (async (m: any) => {
            if (failSmtp) throw Object.assign(new Error('nope'), { responseCode: 535 })
            sent.push(m)
            return { messageId: 'x' }
        }) as any,
    })
}

const charge: ChargeInput = {
    userId: 'u1', provider: 'paystack', reference: 'T100', amountMinor: 5_000_000, currency: 'NGN',
    paidAt: '2026-10-24T09:00:00Z', plan: 'startup', interval: 'monthly',
    periodStart: '2026-10-24T09:00:00Z', periodEnd: '2026-11-23T09:00:00Z', paymentMethod: 'Visa •••• 4081',
}
const profiles = () => [{ id: 'u1', email: 'ada@kudipay.ng', full_name: 'Adaeze Okafor', company_name: 'KudiPay Ltd', billing_address: 'Lekki, Lagos', tax_id: null }]

async function main() {
    // ---- model ----
    await test('VAT only with a TIN and only on NGN; total always equals the charge', () => {
        const noTin = splitTax(5_000_000, 'NGN', { tin: null })
        assert.deepEqual(noTin, { subtotal: 5_000_000, tax: 0, total: 5_000_000, taxRate: 0, taxLabel: null })
        const vat = splitTax(5_000_000, 'NGN', { tin: '123' })
        assert.equal(vat.total, 5_000_000)
        assert.equal(vat.subtotal + vat.tax, vat.total)
        assert.equal(vat.tax, 348_837) // 50,000 * 7.5/107.5 = 3,488.37
        assert.equal(vat.taxLabel, 'VAT 7.5%')
        const usd = splitTax(4_900, 'USD', { tin: '123' })
        assert.equal(usd.tax, 0)
    })
    await test('rounding never breaks subtotal + tax = total', () => {
        for (let t = 0; t < 20_000; t += 37) {
            const s = splitTax(t, 'NGN', { tin: 'x' })
            assert.equal(s.subtotal + s.tax, t)
        }
    })
    await test('formatting', () => {
        assert.equal(formatMoney(5_000_000, 'NGN'), '₦50,000.00')
        assert.equal(formatMoney(5_000_000, 'NGN', { code: true }), 'NGN 50,000.00')
        assert.equal(formatMoney(4_900, 'usd'), '$49.00')
        assert.equal(cardLabel('visa', '4081'), 'Visa •••• 4081')
        assert.equal(cardLabel(null, null), null)
        assert.equal(lineDescription('founder', null), 'Velodesk Founder plan (monthly subscription)')
    })
    await test('seller env: defaults, quotes trimmed, \\n line breaks', () => {
        const s = sellerFromEnv({ BILLING_COMPANY_ADDRESS: '"Lagos\\nNigeria"', BILLING_TIN: ' 1234 ' })
        assert.equal(s.name, 'Crelligent & Company Ltd')
        assert.equal(s.address, 'Lagos\nNigeria')
        assert.equal(s.tin, '1234')
    })

    // ---- rendering ----
    const seller = sellerFromEnv({})
    const inv = { id: 'i', number: 'VD-2026-00001', receipt_number: 'VDR-2026-00001', status: 'paid' as const, provider: 'paystack' as const, provider_reference: 'T1', currency: 'NGN' as const, subtotal: 5_000_000, tax: 0, total: 5_000_000, tax_rate: 0, tax_label: null, plan: 'startup', description: lineDescription('startup', 'monthly'), period_start: charge.periodStart!, period_end: charge.periodEnd!, issued_at: charge.paidAt, paid_at: charge.paidAt, payment_method: 'Visa •••• 4081', customer: { name: '<script>x</script> 李', email: 'a@b.c', company: null }, seller }
    await test('receipt email escapes customer input and has a text part', () => {
        const e = receiptEmail(inv, { appUrl: 'https://velodesk.crelligent.com' })
        assert.ok(!e.html.includes('<script>x'))
        assert.ok(e.html.includes('₦50,000.00'))
        assert.ok(e.text.includes('Total paid: ₦50,000.00'))
        assert.ok(e.html.includes('https://velodesk.crelligent.com/billing'))
        assert.equal(e.subject, 'Your Velodesk receipt VDR-2026-00001')
    })
    await test('payment failed email', () => {
        const e = paymentFailedEmail({ name: 'Ada O', planName: 'Velodesk Startup plan', amountMinor: 5_000_000, currency: 'NGN', paymentMethod: null, accessUntil: '2026-10-27T09:00:00Z' })
        assert.ok(e.html.includes('27 Oct 2026'))
        assert.ok(e.text.includes('Hi Ada,'))
    })
    await test('PDFs render, including characters Helvetica cannot encode', async () => {
        for (const kind of ['invoice', 'receipt'] as const) {
            const pdf = await renderInvoicePdf(inv, kind)
            assert.equal(Buffer.from(pdf.slice(0, 5)).toString(), '%PDF-')
        }
    })

    await test('upcoming charge email: renewal vs trial wording', () => {
        const r = upcomingChargeEmail({ name: 'Ada O', planName: 'Velodesk Startup plan', amountMinor: 5_000_000, currency: 'NGN', chargeDate: '2026-11-23T09:00:00Z', trialEnding: false })
        assert.equal(r.subject, 'Your Velodesk plan renews on 23 Nov 2026 (₦50,000.00)')
        const t = upcomingChargeEmail({ name: null, planName: 'Velodesk Startup plan', amountMinor: null, currency: null, chargeDate: '2026-11-23T09:00:00Z', trialEnding: true })
        assert.equal(t.subject, 'Your Velodesk free trial ends on 23 Nov 2026')
        assert.ok(t.text.includes('Hi there,'))
        assert.ok(r.html.includes('crelligent-logo.png') && !r.html.includes('VELODESK'))
    })
    await test('reminders: who is due, once per charge date', () => {
        const now = new Date('2026-11-20T08:00:00Z')
        const base: ReminderCandidate = { user_id: 'a', plan: 'startup', status: 'active', provider: 'paystack', currency: 'NGN', plan_amount: 5_000_000, trial_ends_at: null, current_period_end: '2026-11-23T07:00:00Z', upcoming_charge_notified_for: null }
        const rows: ReminderCandidate[] = [
            base,                                                                          // due (in 3 days)
            { ...base, user_id: 'b', current_period_end: '2026-11-24T09:00:00Z' },         // 4 days out: not yet
            { ...base, user_id: 'c', upcoming_charge_notified_for: '2026-11-23T07:00:00+00:00' }, // already sent
            { ...base, user_id: 'd', status: 'non_renewing' },                             // cancelled
            { ...base, user_id: 'e', status: 'past_due' },
            { ...base, user_id: 'f', provider: null, status: 'trialing', trial_ends_at: '2026-11-22T00:00:00Z' }, // card-less trial
            { ...base, user_id: 'g', status: 'trialing', trial_ends_at: '2026-11-22T00:00:00Z', current_period_end: null }, // card trial: due
            { ...base, user_id: 'h', current_period_end: '2026-11-19T00:00:00Z' },         // in the past
            { ...base, user_id: 'i', upcoming_charge_notified_for: '2026-10-23T07:00:00Z' }, // reminded for LAST period: due again
        ]
        const due = dueReminders(rows, now, 3)
        assert.deepEqual(due.map(d => d.row.user_id), ['a', 'g', 'i'])
        assert.equal(due[1].trialEnding, true)
    })

    // ---- issuing ----
    useFakeSmtp()
    await test('issue: snapshots customer, emails receipt + 2 PDFs once', async () => {
        const db = fakeDb({ profiles: profiles(), invoices: [] })
        sent.length = 0
        const a = await issueAndEmailInvoice(db, charge)
        assert.equal(a.customer.company, 'KudiPay Ltd')
        assert.equal(a.total, 5_000_000)
        assert.equal(sent.length, 1)
        assert.equal(sent[0].to, 'ada@kudipay.ng')
        assert.equal((sent[0] as any).from, '"Velodesk by Crelligent" <billing@crelligent.com>')
        assert.deepEqual(sent[0].attachments?.map(x => x.filename), ['Velodesk-Receipt-VDR-2026-00001.pdf', 'Velodesk-Invoice-VD-2026-00001.pdf'])
        assert.ok(db.tables.invoices[0].emailed_at)
        // callback + webhook + retries: same reference -> same invoice, no second email
        const b = await issueAndEmailInvoice(db, charge)
        await issueAndEmailInvoice(db, charge)
        assert.equal(b.id, a.id)
        assert.equal(db.tables.invoices.length, 1)
        assert.equal(sent.length, 1)
    })
    await test('issue: insert race (unique violation) returns the existing invoice', async () => {
        const db = fakeDb({ profiles: profiles(), invoices: [] })
        const first = await issueInvoice(db, charge)
        // simulate: our pre-check missed it, insert hits the unique index
        const origFrom = db.from
        let calls = 0
        db.from = (t: string) => {
            const q = origFrom(t)
            if (t === 'invoices' && calls++ === 0) q.maybeSingle = () => Promise.resolve({ data: null, error: null })
            return q
        }
        const again = await issueInvoice(db, charge)
        assert.equal(again.id, first.id)
    })
    await test('issue: SMTP failure releases the claim and records the error', async () => {
        const db = fakeDb({ profiles: profiles(), invoices: [] })
        failSmtp = true
        await issueAndEmailInvoice(db, { ...charge, reference: 'T200' })
        failSmtp = false
        const row = db.tables.invoices[0]
        assert.equal(row.emailed_at, null)
        assert.equal(row.email_error, 'smtp_error_535')
        sent.length = 0
        await issueAndEmailInvoice(db, { ...charge, reference: 'T200' }) // retry sends it
        assert.equal(sent.length, 1)
    })
    await test('issue: rejects unsupported currency', async () => {
        const db = fakeDb({ profiles: profiles(), invoices: [] })
        await assert.rejects(issueInvoice(db, { ...charge, currency: 'GHS' }))
    })
    await test('payment failed: one email per episode', async () => {
        const db = fakeDb({ profiles: profiles(), subscriptions: [{ user_id: 'u1', plan: 'startup', currency: 'NGN', plan_amount: 5_000_000, past_due_since: '2026-10-24T09:00:00Z', payment_failed_notified_at: null }] })
        sent.length = 0
        assert.equal(await notifyPaymentFailed(db, 'u1'), true)
        assert.equal(await notifyPaymentFailed(db, 'u1'), false) // Paystack retries the charge: no second email
        assert.equal(sent.length, 1)
        assert.ok(sent[0].subject.includes("didn't go through"))
        assert.ok((sent[0] as any).html.includes('27 Oct 2026')) // 3-day grace
    })

    console.log(`\n${passed} passed`)
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
