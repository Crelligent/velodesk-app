/**
 * Mixpanel: retention signal. Analytics source.
 * Credentials: { projectId, username, secret, region? } (service account; region us|eu|in)
 *
 * Engagement (DAU/MAU) is NOT read: the Query API has no "any event" unique-user
 * count without naming an event or a saved Insights report, so it stays null.
 */
import { basicAuth, describeError, requestJson, ymd, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'analytics' as const

const HOSTS: Record<string, string> = {
    us: 'https://mixpanel.com',
    eu: 'https://eu.mixpanel.com',
    in: 'https://in.mixpanel.com',
}

type RetentionResponse = Record<string, { counts?: number[]; first?: number }>

function base(c: Credentials) {
    return HOSTS[(c.region || 'us').toLowerCase()] ?? HOSTS.us
}

function opts(c: Credentials): RequestOptions {
    // Query API allows 60 queries/hour and 5 concurrent: keep retries low
    return { headers: { Authorization: basicAuth(c.username ?? '', c.secret ?? ''), Accept: 'application/json' }, retries: 2 }
}

/**
 * GET https://{mixpanel.com|eu.mixpanel.com|in.mixpanel.com}/api/query/retention
 *   ?project_id&from_date&to_date&retention_type=compounded&unit=month&interval_count
 * (Query API "Retention"; compounded = users active in a month who are active again N months later)
 */
async function retention(c: Credentials, from: string, to: string, unit: 'day' | 'month', intervalCount: number) {
    const params = new URLSearchParams({
        project_id: c.projectId ?? '',
        from_date: from,
        to_date: to,
        retention_type: 'compounded',
        unit,
        interval_count: String(intervalCount),
    })
    return requestJson<RetentionResponse>('Mixpanel', `${base(c)}/api/query/retention?${params}`, opts(c))
}

export async function validate(c: Credentials): Promise<ValidationResult> {
    if (!/^\d+$/.test(c.projectId ?? '')) return { ok: false, error: 'Mixpanel project ID should be a number', input: true }
    try {
        const day = ymd(new Date(Date.now() - 86_400_000))
        await retention(c, day, day, 'day', 1)
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

/** Weighted retention for interval k over cohorts whose k-th month has fully elapsed. */
export function retentionAt(data: RetentionResponse, k: number, now = new Date()): number | null {
    return retentionStats(data, k, now).pct
}

export function retentionStats(data: RetentionResponse, k: number, now = new Date()): { pct: number | null; cohort: number } {
    let retained = 0
    let cohort = 0
    for (const [date, row] of Object.entries(data)) {
        const start = new Date(`${date}T00:00:00Z`)
        if (Number.isNaN(start.getTime())) continue
        const complete = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + k + 1, 1))
        if (complete > now || !row.counts || row.counts.length <= k || !row.first) continue
        retained += row.counts[k]
        cohort += row.first
    }
    return { pct: cohort > 0 ? Math.round((retained / cohort) * 1000) / 10 : null, cohort }
}

export async function sync(c: Credentials): Promise<SignalSet> {
    const now = new Date()
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 7, 1))
    const data = await retention(c, ymd(from), ymd(now), 'month', 7)
    return {
        retention: {
            month1: retentionAt(data, 1, now),
            month3: retentionAt(data, 3, now),
            month6: retentionAt(data, 6, now),
            cohortSize: retentionStats(data, 1, now).cohort,
        },
        engagement: { dau: null, wau: null, mau: null, stickiness: null },
    }
}
