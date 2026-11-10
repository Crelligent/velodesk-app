/**
 * Google Analytics 4: daily, weekly and monthly active users -> engagement (DAU/MAU). Analytics source.
 * Credentials: { accessToken } (Google OAuth, scope analytics.readonly; refreshed in oauth-tokens.ts)
 *
 *   GET  https://analyticsadmin.googleapis.com/v1beta/accountSummaries    which GA4 properties the founder can read
 *   POST https://analyticsdata.googleapis.com/v1beta/{property}:batchRunReports
 *        1. activeUsers by date, last 28 complete days  -> average DAU
 *        2. activeUsers, last 7 complete days            -> WAU
 *        3. activeUsers, last 28 complete days           -> MAU
 * Property: config.propertyId when set, otherwise the first GA4 property on the account.
 */
import { requestJson, describeError, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'analytics' as const

const ADMIN = 'https://analyticsadmin.googleapis.com/v1beta'
const DATA = 'https://analyticsdata.googleapis.com/v1beta'
/** Below this many monthly active users DAU/MAU swings too much to score. */
export const MIN_MAU = 50

const opts = (c: Credentials): RequestOptions => ({
    headers: { Authorization: `Bearer ${c.accessToken ?? ''}`, 'Content-Type': 'application/json' },
})

interface AccountSummaries {
    accountSummaries?: Array<{ propertySummaries?: Array<{ property?: string; displayName?: string }> }>
    nextPageToken?: string
}
interface Report { rows?: Array<{ metricValues?: Array<{ value?: string }> }> }

export async function listProperties(c: Credentials): Promise<Array<{ property: string; displayName: string }>> {
    const body = await requestJson<AccountSummaries>('Google Analytics', `${ADMIN}/accountSummaries?pageSize=200`, opts(c))
    return (body.accountSummaries ?? []).flatMap(a => (a.propertySummaries ?? [])
        .filter(p => typeof p.property === 'string' && p.property.startsWith('properties/'))
        .map(p => ({ property: p.property!, displayName: p.displayName ?? p.property! })))
}

const sum = (r: Report | undefined) => (r?.rows ?? []).reduce((t, row) => t + Number(row.metricValues?.[0]?.value ?? 0), 0)

/** Pure: the three report results -> engagement signal. */
export function engagementFrom(dailyTotal28: number, wau: number, mau: number) {
    const dau = Math.round((dailyTotal28 / 28) * 10) / 10
    const enough = mau >= MIN_MAU
    return {
        dau: enough ? dau : null,
        wau: enough ? wau : null,
        mau: enough ? mau : null,
        stickiness: enough && mau > 0 ? Math.round((dau / mau) * 1000) / 1000 : null,
    }
}

export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        const props = await listProperties(c)
        return props.length
            ? { ok: true }
            : { ok: false, input: true, error: 'This Google account has no Google Analytics 4 property. Sign in with the account that owns your GA4 property.' }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

export async function sync(c: Credentials, context?: { config?: Record<string, unknown> | null }): Promise<SignalSet> {
    const configured = typeof context?.config?.propertyId === 'string' ? String(context.config.propertyId) : null
    const props = configured ? [] : await listProperties(c)
    const property = configured
        ? (configured.startsWith('properties/') ? configured : `properties/${configured}`)
        : props[0]?.property
    if (!property) return { notes: ['Google Analytics: no GA4 property found on this Google account'] }

    const range = (start: string) => [{ startDate: start, endDate: 'yesterday' }]
    const body = await requestJson<{ reports?: Report[] }>('Google Analytics', `${DATA}/${property}:batchRunReports`, {
        ...opts(c),
        method: 'POST',
        body: JSON.stringify({
            requests: [
                { dateRanges: range('28daysAgo'), dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }], limit: 100 },
                { dateRanges: range('7daysAgo'), metrics: [{ name: 'activeUsers' }] },
                { dateRanges: range('28daysAgo'), metrics: [{ name: 'activeUsers' }] },
            ],
        }),
    })
    const [daily, week, month] = body.reports ?? []
    const engagement = engagementFrom(sum(daily), sum(week), sum(month))
    const name = props.find(p => p.property === property)?.displayName
    const notes = [`Google Analytics: property ${name ? `"${name}"` : property}`]
    if (engagement.mau === null) notes.push(`Google Analytics: ${sum(month)} monthly active users, need ${MIN_MAU} to score engagement`)
    return { engagement, notes }
}
