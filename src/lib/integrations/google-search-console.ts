/**
 * Google Search Console: clicks and impressions from Google Search -> search demand. Marketing source.
 * Feeds the Go-to-Market Score's "Search demand" component (src/lib/gtm-score.ts).
 * Credentials: { accessToken } (Google OAuth, scope webmasters.readonly; refreshed in oauth-tokens.ts)
 *
 *   GET  https://www.googleapis.com/webmasters/v3/sites                                  sites the founder can read
 *   POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query  totals for a date range
 * Search data arrives 2-3 days late, so both 28-day windows end 3 days ago.
 * Site: config.siteUrl when set, otherwise the first verified site (domain properties first).
 */
import { requestJson, describeError, daysAgo, ymd, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'marketing' as const

const BASE = 'https://www.googleapis.com/webmasters/v3'
const LAG_DAYS = 3

const opts = (c: Credentials): RequestOptions => ({
    headers: { Authorization: `Bearer ${c.accessToken ?? ''}`, 'Content-Type': 'application/json' },
})

interface SiteList { siteEntry?: Array<{ siteUrl?: string; permissionLevel?: string }> }
interface Totals { rows?: Array<{ clicks?: number; impressions?: number }> }

/** Pure: verified sites first, domain properties (sc-domain:) before URL prefixes. */
export function pickSite(entries: SiteList['siteEntry']): string | null {
    const verified = (entries ?? []).filter(e => e.siteUrl && e.permissionLevel && e.permissionLevel !== 'siteUnverifiedUser')
    verified.sort((a, b) => Number(b.siteUrl!.startsWith('sc-domain:')) - Number(a.siteUrl!.startsWith('sc-domain:')))
    return verified[0]?.siteUrl ?? null
}

async function listSites(c: Credentials) {
    return (await requestJson<SiteList>('Google Search Console', `${BASE}/sites`, opts(c))).siteEntry
}

async function totals(c: Credentials, site: string, from: Date, to: Date) {
    const body = await requestJson<Totals>('Google Search Console', `${BASE}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
        ...opts(c),
        method: 'POST',
        body: JSON.stringify({ startDate: ymd(from), endDate: ymd(to) }),
    })
    const row = body.rows?.[0]
    return { clicks: Math.round(row?.clicks ?? 0), impressions: Math.round(row?.impressions ?? 0) }
}

export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        return pickSite(await listSites(c))
            ? { ok: true }
            : { ok: false, input: true, error: 'This Google account has no verified site in Search Console. Sign in with the account that owns your site.' }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

export async function sync(c: Credentials, context?: { config?: Record<string, unknown> | null }): Promise<SignalSet> {
    const site = typeof context?.config?.siteUrl === 'string' ? String(context.config.siteUrl) : pickSite(await listSites(c))
    if (!site) return { notes: ['Google Search Console: no verified site on this Google account'] }

    const last = await totals(c, site, daysAgo(LAG_DAYS + 27), daysAgo(LAG_DAYS))
    const prev = await totals(c, site, daysAgo(LAG_DAYS + 55), daysAgo(LAG_DAYS + 28))
    return {
        demand: {
            searchClicksLast28: last.clicks,
            searchClicksPrev28: prev.clicks,
            searchImpressionsLast28: last.impressions,
        },
        notes: [`Google Search Console: site ${site}`],
    }
}
