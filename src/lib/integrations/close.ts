/**
 * Close: opportunities won per month (growth signal). CRM source.
 * Credentials: { apiKey } (HTTP Basic, key as username)
 */
import { basicAuth, daysAgo, describeError, pctChange, requestJson, ymd, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'crm' as const

const BASE = 'https://api.close.com/api/v1'

const opts = (c: Credentials): RequestOptions => ({ headers: { Authorization: basicAuth(c.apiKey ?? ''), Accept: 'application/json' } })

/**
 * GET https://api.close.com/api/v1/opportunity/?status_type=won&date_won__gte&date_won__lt&_limit=1
 * `total_results` is computed across all matching opportunities, so one page is enough.
 */
async function wonBetween(c: Credentials, from: Date, to: Date): Promise<number> {
    const params = new URLSearchParams({
        status_type: 'won',
        date_won__gte: ymd(from),
        date_won__lt: ymd(to),
        _limit: '1',
        _fields: 'id',
    })
    const res = await requestJson<{ total_results?: number }>('Close', `${BASE}/opportunity/?${params}`, opts(c))
    return res.total_results ?? 0
}

/** GET https://api.close.com/api/v1/me/ */
export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        await requestJson('Close', `${BASE}/me/`, { ...opts(c), retries: 1 })
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

export async function sync(c: Credentials): Promise<SignalSet> {
    const now = new Date(Date.now() + 86_400_000) // date_won is a date: include today
    const last30 = await wonBetween(c, daysAgo(30), now)
    const prev30 = await wonBetween(c, daysAgo(60), daysAgo(30))
    return {
        growth: { newCustomersPerMonth: last30, pipelineGrowth: pctChange(last30, prev30), newLeadsPerMonth: null },
    }
}
