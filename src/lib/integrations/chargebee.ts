/**
 * Chargebee: MRR + 30-day churn. Billing source.
 * Credentials: { site, apiKey } (site = the "acme" in acme.chargebee.com; a read-only key is enough)
 * Auth: HTTP Basic with the API key as username. 429 on rate limit (handled by requestJson).
 */
import { basicAuth, daysAgo, describeError, requestJson, unixSeconds, type RequestOptions } from './http'
import { addTo, headlineCurrency, roundMap, toMajor } from './money'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'billing' as const

const MAX_PAGES = 100 // 10k subscriptions per status

interface ChargebeeList {
    list?: Array<{ subscription?: { mrr?: number; currency_code?: string; status?: string } }>
    next_offset?: string
}

function base(c: Credentials): string {
    const site = (c.site ?? '').trim().toLowerCase().replace(/\.chargebee\.com.*$/, '')
    if (!/^[a-z0-9][a-z0-9-]*$/.test(site)) throw new Error('invalid site')
    return `https://${site}.chargebee.com/api/v2`
}

const opts = (c: Credentials): RequestOptions => ({ headers: { Authorization: basicAuth(c.apiKey ?? '') } })

/** GET https://{site}.chargebee.com/api/v2/subscriptions?limit=100&offset=…&<filters> (List subscriptions) */
async function listSubscriptions(c: Credentials, filters: Record<string, string>) {
    const subs: NonNullable<ChargebeeList['list']>[number]['subscription'][] = []
    let offset: string | undefined
    let truncated = true
    for (let page = 0; page < MAX_PAGES; page++) {
        const params = new URLSearchParams({ limit: '100', ...filters, ...(offset ? { offset } : {}) })
        const res = await requestJson<ChargebeeList>('Chargebee', `${base(c)}/subscriptions?${params}`, opts(c))
        for (const row of res.list ?? []) subs.push(row.subscription)
        offset = res.next_offset
        if (!offset) { truncated = false; break }
    }
    return { subs, truncated }
}

export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        base(c)
    } catch {
        return { ok: false, error: 'Chargebee site should be the subdomain, e.g. "acme" for acme.chargebee.com', input: true }
    }
    try {
        await requestJson('Chargebee', `${base(c)}/subscriptions?limit=1`, { ...opts(c), retries: 1 })
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

export async function sync(c: Credentials): Promise<SignalSet> {
    const active = await listSubscriptions(c, { 'status[is]': 'active' })
    const cancelled = await listSubscriptions(c, {
        'status[is]': 'cancelled',
        'cancelled_at[after]': String(unixSeconds(daysAgo(30))),
    })

    // `mrr` is Chargebee's own per-subscription MRR (minor units); absent if MRR isn't computed for the site
    const mrrByCurrency: Record<string, number> = {}
    let withMrr = 0
    for (const s of active.subs) {
        if (s && typeof s.mrr === 'number' && s.currency_code) {
            addTo(mrrByCurrency, s.currency_code, toMajor(s.mrr, s.currency_code))
            withMrr++
        }
    }
    const haveMrr = active.subs.length === 0 || withMrr > 0
    const rounded = roundMap(mrrByCurrency)
    const currency = headlineCurrency(rounded, 'USD')

    const churnBase = active.subs.length + cancelled.subs.length
    const notes: string[] = []
    if (!haveMrr) notes.push('Chargebee: subscriptions have no mrr field; MRR not measured')
    if (active.truncated || cancelled.truncated) notes.push('Chargebee: record cap reached; figures may be partial')

    return {
        revenue: {
            mrr: haveMrr ? rounded[currency] ?? 0 : null,
            currency: haveMrr ? currency : null,
            mrrByCurrency: haveMrr ? (Object.keys(rounded).length ? rounded : { USD: 0 }) : null,
            churnRate: churnBase > 0 ? Math.round((cancelled.subs.length / churnBase) * 1000) / 10 : null,
            subscriptions: churnBase,
            expansionMrr: null, // needs subscription-change events (not read)
        },
        notes: notes.length ? notes : undefined,
    }
}
