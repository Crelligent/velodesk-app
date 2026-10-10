/**
 * Zendesk: CSAT from satisfaction ratings. Support source.
 * Credentials: { subdomain, email, apiToken } (HTTP Basic "{email}/token:{apiToken}")
 */
import { basicAuth, daysAgo, describeError, requestJson, unixSeconds, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'support' as const

const MAX_PAGES = 30 // x100 = 3,000 ratings

function base(c: Credentials): string {
    const sub = (c.subdomain ?? '').trim().toLowerCase().replace(/\.zendesk\.com.*$/, '').replace(/^https?:\/\//, '')
    if (!/^[a-z0-9][a-z0-9-]*$/.test(sub)) throw new Error('invalid subdomain')
    return `https://${sub}.zendesk.com/api/v2`
}

const opts = (c: Credentials): RequestOptions => ({
    headers: { Authorization: basicAuth(`${c.email ?? ''}/token`, c.apiToken ?? ''), Accept: 'application/json' },
})

interface RatingsPage {
    satisfaction_ratings?: Array<{ score?: string }>
    meta?: { has_more?: boolean }
    links?: { next?: string | null }
}

/** GET https://{subdomain}.zendesk.com/api/v2/users/me.json (anonymous user = bad credentials) */
export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        base(c)
    } catch {
        return { ok: false, error: 'Zendesk subdomain should be the "acme" in acme.zendesk.com', input: true }
    }
    try {
        const res = await requestJson<{ user?: { id?: number | null } }>('Zendesk', `${base(c)}/users/me.json`, { ...opts(c), retries: 1 })
        return res.user?.id ? { ok: true } : { ok: false, error: 'Zendesk did not accept this email + API token' }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

/**
 * GET https://{subdomain}.zendesk.com/api/v2/satisfaction_ratings.json?score=received&start_time&page[size]=100
 * (cursor pagination via links.next). CSAT = good / (good + bad), last 90 days.
 */
export async function sync(c: Credentials): Promise<SignalSet> {
    const params = new URLSearchParams({ score: 'received', start_time: String(unixSeconds(daysAgo(90))), 'page[size]': '100' })
    let url: string | undefined = `${base(c)}/satisfaction_ratings.json?${params}`
    let good = 0
    let bad = 0

    for (let page = 0; url && page < MAX_PAGES; page++) {
        const res: RatingsPage = await requestJson<RatingsPage>('Zendesk', url, opts(c))
        for (const r of res.satisfaction_ratings ?? []) {
            if (r.score?.startsWith('good')) good++
            else if (r.score?.startsWith('bad')) bad++
        }
        const next = res.links?.next ?? undefined
        url = res.meta?.has_more && next?.startsWith(base(c)) ? next : undefined
    }

    const rated = good + bad
    return { satisfaction: { nps: null, csat: rated > 0 ? Math.round((good / rated) * 1000) / 10 : null, responses: rated } }
}
