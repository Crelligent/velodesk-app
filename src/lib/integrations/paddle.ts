/**
 * Paddle Billing: MRR + 30-day churn. Billing source.
 * Credentials: { apiKey, environment? } (environment live|sandbox; key needs subscription.read)
 */
import { daysAgo, describeError, requestJson, type RequestOptions } from './http'
import { addTo, headlineCurrency, monthsPerPeriod, roundMap, toMajor } from './money'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'billing' as const

const MAX_PAGES = 50 // x200 = 10k subscriptions per status

interface Cycle { interval?: string; frequency?: number }
interface PaddleSubscription {
    status?: string
    currency_code?: string
    canceled_at?: string | null
    billing_cycle?: Cycle
    items?: Array<{ quantity?: number; price?: { unit_price?: { amount?: string; currency_code?: string }; billing_cycle?: Cycle | null } }>
}
interface PaddleList {
    data?: PaddleSubscription[]
    meta?: { pagination?: { next?: string; has_more?: boolean } }
}

const base = (c: Credentials) =>
    (c.environment || 'live').toLowerCase() === 'sandbox' ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com'

const opts = (c: Credentials): RequestOptions => ({ headers: { Authorization: `Bearer ${c.apiKey ?? ''}` } })

/** GET {base}/subscriptions?status=…&per_page=200, following meta.pagination.next (List subscriptions) */
async function listSubscriptions(c: Credentials, status: string) {
    const items: PaddleSubscription[] = []
    let url: string | undefined = `${base(c)}/subscriptions?status=${status}&per_page=200`
    for (let page = 0; url && page < MAX_PAGES; page++) {
        const res: PaddleList = await requestJson<PaddleList>('Paddle', url, opts(c))
        items.push(...(res.data ?? []))
        const next = res.meta?.pagination?.next
        // only follow pagination links on Paddle's own API host
        url = res.meta?.pagination?.has_more && next?.startsWith(base(c)) ? next : undefined
    }
    return { items, truncated: Boolean(url) }
}

/** Monthly recurring amount of one subscription, per currency (major units). */
export function subscriptionMrr(sub: PaddleSubscription, into: Record<string, number>): void {
    for (const item of sub.items ?? []) {
        // billing_cycle: null on the price = one-time charge; only fall back to the
        // subscription's cycle when the price doesn't say
        if (item.price?.billing_cycle === null) continue
        const cycle = item.price?.billing_cycle ?? sub.billing_cycle
        if (!cycle?.interval) continue
        const months = monthsPerPeriod(cycle.interval, cycle.frequency ?? 1)
        const amount = Number(item.price?.unit_price?.amount)
        const currency = item.price?.unit_price?.currency_code ?? sub.currency_code
        if (!months || !Number.isFinite(amount) || !currency) continue
        addTo(into, currency, toMajor(amount * (item.quantity ?? 1), currency) / months)
    }
}

export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        await requestJson('Paddle', `${base(c)}/subscriptions?per_page=1`, { ...opts(c), retries: 1 })
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

export async function sync(c: Credentials): Promise<SignalSet> {
    const active = await listSubscriptions(c, 'active')
    const canceled = await listSubscriptions(c, 'canceled')

    const mrrByCurrency: Record<string, number> = {}
    for (const sub of active.items) subscriptionMrr(sub, mrrByCurrency)
    const rounded = roundMap(mrrByCurrency)
    const currency = headlineCurrency(rounded, 'USD')

    const cutoff = daysAgo(30).getTime()
    const churned = canceled.items.filter(s => s.canceled_at && Date.parse(s.canceled_at) >= cutoff).length
    const churnBase = active.items.length + churned

    return {
        revenue: {
            mrr: rounded[currency] ?? 0,
            currency,
            mrrByCurrency: Object.keys(rounded).length ? rounded : { [currency]: 0 },
            churnRate: churnBase > 0 ? Math.round((churned / churnBase) * 1000) / 10 : null,
            subscriptions: churnBase,
            expansionMrr: null, // needs adjustment/transaction history (not read)
        },
        notes: active.truncated || canceled.truncated ? ['Paddle: record cap reached; figures may be partial'] : undefined,
    }
}
