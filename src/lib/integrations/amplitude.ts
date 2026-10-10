/**
 * Amplitude: retention + engagement (DAU/MAU). Analytics source.
 * Credentials: { apiKey, secretKey, region? } (region us|eu)
 * Dashboard REST API: up to 5 concurrent requests; cost-based hourly limits (429 when exceeded).
 */
import { basicAuth, describeError, requestJson, ymdCompact, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'analytics' as const

const base = (c: Credentials) =>
    (c.region || 'us').toLowerCase() === 'eu' ? 'https://analytics.eu.amplitude.com' : 'https://amplitude.com'

const opts = (c: Credentials): RequestOptions => ({
    headers: { Authorization: basicAuth(c.apiKey ?? '', c.secretKey ?? ''), Accept: 'application/json' },
})

interface UsersResponse { data?: { series?: number[][]; xValues?: string[] } }
interface RetentionCell { count?: number; outof?: number; incomplete?: boolean }
interface RetentionResponse { data?: unknown }

/** GET {base}/api/2/users?m=active&i={1|30}&start=YYYYMMDD&end=YYYYMMDD (active user counts) */
async function activeUsers(c: Credentials, start: Date, end: Date, interval: 1 | 30): Promise<number[]> {
    const params = new URLSearchParams({ m: 'active', i: String(interval), start: ymdCompact(start), end: ymdCompact(end) })
    const res = await requestJson<UsersResponse>('Amplitude', `${base(c)}/api/2/users?${params}`, opts(c))
    return (res.data?.series?.[0] ?? []).filter((n): n is number => typeof n === 'number')
}

/** Finds the `combined` retention array wherever the response nests it. */
function combinedCells(body: RetentionResponse): RetentionCell[] | null {
    const data = body.data as Record<string, unknown> | undefined
    const series = data?.series
    const first = Array.isArray(series) ? series[0] : series
    const combined = (first as { combined?: unknown } | undefined)?.combined
    return Array.isArray(combined) ? (combined as RetentionCell[]) : null
}

/**
 * GET {base}/api/2/retention?se={"event_type":"_new"}&re={"event_type":"_active"}&i=30&start&end
 * (Retention analysis: new users returning N months later). combined[k] = {count, outof}.
 */
async function monthlyRetention(c: Credentials, start: Date, end: Date): Promise<RetentionCell[] | null> {
    const params = new URLSearchParams({
        se: JSON.stringify({ event_type: '_new' }),
        re: JSON.stringify({ event_type: '_active' }),
        i: '30',
        start: ymdCompact(start),
        end: ymdCompact(end),
    })
    return combinedCells(await requestJson<RetentionResponse>('Amplitude', `${base(c)}/api/2/retention?${params}`, opts(c)))
}

export function cellPct(cells: RetentionCell[] | null, k: number): number | null {
    const cell = cells?.[k]
    if (!cell || !cell.outof || typeof cell.count !== 'number' || cell.incomplete) return null
    return Math.round((cell.count / cell.outof) * 1000) / 10
}

export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        const y = new Date(Date.now() - 86_400_000)
        await activeUsers(c, y, y, 1)
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

export async function sync(c: Credentials): Promise<SignalSet> {
    const now = new Date()
    // Previous full calendar month: DAU = mean daily actives, MAU = that month's actives
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0))
    const [daily, monthly, cells] = await Promise.all([
        activeUsers(c, monthStart, monthEnd, 1),
        activeUsers(c, monthStart, monthEnd, 30),
        monthlyRetention(c, new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 7, 1)), monthEnd),
    ])

    const dau = daily.length ? Math.round(daily.reduce((a, b) => a + b, 0) / daily.length) : null
    const mau = monthly.length ? monthly[monthly.length - 1] : null
    return {
        engagement: {
            dau,
            wau: null,
            mau,
            stickiness: dau !== null && mau ? Math.round((dau / mau) * 1000) / 1000 : null,
        },
        retention: {
            month1: cellPct(cells, 1),
            month3: cellPct(cells, 3),
            month6: cellPct(cells, 6),
            cohortSize: typeof cells?.[1]?.outof === 'number' ? cells[1].outof : null,
        },
    }
}
