/**
 * Flutterwave (customer's own account): revenue + customer churn. Billing source.
 * Credentials: { secretKey } (FLWSECK-... live, FLWSECK_TEST-... test)
 *
 * Endpoints (https://api.flutterwave.com/v3, Bearer secret key, amounts in major units):
 *   GET /payment-plans                                   plan interval + currency
 *   GET /subscriptions                                   status per subscription (no cancellation date)
 *   GET /transactions?from=&to=&status=successful        payments, paginated via meta.page_info
 *
 * MRR: active subscriptions x plan interval when the account bills subscriptions;
 * otherwise the last 30 days of successful payments (most Nigerian startups bill one-off).
 * Churn: Flutterwave subscriptions carry no cancellation date, so churn is measured on
 * paying customers: those who paid 31-60 days ago and have not paid in the last 30 days.
 */
import { requestJson, ProviderError, describeError, daysAgo, ymd, type RequestOptions } from './http'
import { addTo, headlineCurrency, roundMap } from './money'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'billing' as const

const BASE = 'https://api.flutterwave.com/v3'
const MAX_PAGES = 100 // safety cap per resource

/** Monthly multiplier per Flutterwave plan interval */
export const MONTHLY_FACTOR: Record<string, number> = {
    hourly: 730,
    daily: 30.44,
    weekly: 4.345,
    monthly: 1,
    quarterly: 1 / 3,
    'every 6 months': 1 / 6,
    biannually: 1 / 6,
    yearly: 1 / 12,
    annually: 1 / 12,
}

interface FlwPage<T> {
    status: string
    message?: string
    data?: T[]
    meta?: { page_info?: { total?: number; current_page?: number; total_pages?: number } }
}

export interface FlwPlan { id: number; amount?: number; interval?: string; currency?: string }
export interface FlwSubscription { id: number; amount?: number; plan?: number; status?: string }
export interface FlwTransaction {
    amount?: number
    currency?: string
    status?: string
    created_at?: string
    customer?: { email?: string | null; id?: number | string | null } | null
    customer_email?: string | null
}

const auth = (key: string): RequestOptions => ({ headers: { Authorization: `Bearer ${key}` } })

async function fetchAll<T>(path: string, key: string): Promise<{ items: T[]; truncated: boolean }> {
    const items: T[] = []
    for (let page = 1; page <= MAX_PAGES; page++) {
        const sep = path.includes('?') ? '&' : '?'
        const body = await requestJson<FlwPage<T>>('Flutterwave', `${BASE}${path}${sep}page=${page}`, auth(key))
        if (body.status !== 'success') throw new ProviderError('Flutterwave', 200, 'Flutterwave API returned an error')
        const data = body.data ?? []
        items.push(...data)
        const totalPages = body.meta?.page_info?.total_pages
        if (data.length === 0 || totalPages === undefined || page >= totalPages) return { items, truncated: false }
    }
    return { items, truncated: true }
}

const customerKey = (tx: FlwTransaction): string | null => {
    const email = tx.customer?.email ?? tx.customer_email
    if (email) return email.trim().toLowerCase()
    const id = tx.customer?.id
    return id !== null && id !== undefined ? `id:${id}` : null
}

export interface FlutterwaveSummary {
    mrrByCurrency: Record<string, number>
    mrrFrom: 'subscriptions' | 'payments'
    churnRate: number | null
    churnBase: number
    activeSubscriptions: number
}

/** Pure: turns plans, subscriptions and the last 60 days of payments into revenue signals. */
export function summarise(
    plans: FlwPlan[],
    subscriptions: FlwSubscription[],
    transactions: FlwTransaction[],
    now = Date.now(),
): FlutterwaveSummary {
    const planById = new Map(plans.map(p => [p.id, p]))
    const subMrr: Record<string, number> = {}
    let activeSubscriptions = 0
    for (const sub of subscriptions) {
        if (sub.status !== 'active') continue
        const plan = sub.plan !== undefined ? planById.get(sub.plan) : undefined
        const amount = Number(sub.amount ?? plan?.amount ?? 0)
        if (!(amount > 0)) continue
        activeSubscriptions++
        addTo(subMrr, plan?.currency || 'NGN', amount * (MONTHLY_FACTOR[(plan?.interval ?? 'monthly').toLowerCase()] ?? 1))
    }

    const cut30 = now - 30 * 86_400_000
    const cut60 = now - 60 * 86_400_000
    const recentRevenue: Record<string, number> = {}
    const recentCustomers = new Set<string>()
    const priorCustomers = new Set<string>()
    for (const tx of transactions) {
        if (tx.status !== 'successful') continue
        const at = Date.parse(tx.created_at ?? '')
        if (Number.isNaN(at) || at < cut60) continue
        const who = customerKey(tx)
        if (at >= cut30) {
            addTo(recentRevenue, tx.currency || 'NGN', Number(tx.amount ?? 0))
            if (who) recentCustomers.add(who)
        } else if (who) {
            priorCustomers.add(who)
        }
    }

    let lost = 0
    for (const c of priorCustomers) if (!recentCustomers.has(c)) lost++
    const churnBase = priorCustomers.size
    const churnRate = churnBase > 0 ? Math.round((lost / churnBase) * 1000) / 10 : null

    const useSubs = activeSubscriptions > 0
    return {
        mrrByCurrency: roundMap(useSubs ? subMrr : recentRevenue),
        mrrFrom: useSubs ? 'subscriptions' : 'payments',
        churnRate,
        churnBase,
        activeSubscriptions,
    }
}

const KEY_RE = /^FLWSECK(_TEST)?-[A-Za-z0-9-]+$/

/** GET /transactions for today only: a cheap authenticated call */
export async function validate(c: Credentials): Promise<ValidationResult> {
    const key = (c.secretKey ?? '').trim()
    if (!KEY_RE.test(key)) {
        return { ok: false, input: true, error: 'That doesn’t look like a Flutterwave secret key. It starts with FLWSECK- (live) or FLWSECK_TEST- (test).' }
    }
    try {
        const today = ymd(new Date())
        await requestJson('Flutterwave', `${BASE}/transactions?from=${today}&to=${today}&page=1`, { ...auth(key), retries: 1 })
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

export async function sync(c: Credentials): Promise<SignalSet> {
    const key = (c.secretKey ?? '').trim()
    const from = ymd(daysAgo(60))
    const to = ymd(new Date())
    const [plans, subs, txs] = await Promise.all([
        fetchAll<FlwPlan>('/payment-plans', key),
        fetchAll<FlwSubscription>('/subscriptions', key),
        fetchAll<FlwTransaction>(`/transactions?from=${from}&to=${to}&status=successful`, key),
    ])
    const s = summarise(plans.items, subs.items, txs.items)
    const currency = headlineCurrency(s.mrrByCurrency, 'NGN')
    const notes: string[] = []
    if (s.mrrFrom === 'payments') notes.push('Flutterwave: no active subscriptions, so monthly revenue is the last 30 days of successful payments')
    notes.push('Flutterwave: churn measured on paying customers (paid 31-60 days ago, not in the last 30)')
    if (plans.truncated || subs.truncated || txs.truncated) notes.push('Flutterwave: record cap reached; figures may be partial')

    return {
        revenue: {
            mrr: s.mrrByCurrency[currency] ?? 0,
            currency,
            mrrByCurrency: Object.keys(s.mrrByCurrency).length ? s.mrrByCurrency : { [currency]: 0 },
            churnRate: s.churnRate,
            subscriptions: s.churnBase,
            expansionMrr: null,
        },
        notes,
    }
}
