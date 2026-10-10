/**
 * Pipedrive: deals won per month (growth signal). CRM source.
 * Credentials: { apiToken } (sent in the x-api-token header, never in the URL)
 */
import { daysAgo, describeError, pctChange, requestJson, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'crm' as const

const BASE = 'https://api.pipedrive.com/v1'
const PAGE = 500
const MAX_PAGES = 20

interface DealsPage {
    data?: Array<{ won_time?: string | null }> | null
    additional_data?: { pagination?: { more_items_in_collection?: boolean; next_start?: number } }
}

const opts = (c: Credentials): RequestOptions => ({ headers: { 'x-api-token': c.apiToken ?? '', Accept: 'application/json' } })

/** "2026-09-30 14:03:11" (UTC) -> epoch ms */
const parseWonTime = (t: string) => Date.parse(`${t.replace(' ', 'T')}Z`)

/** GET https://api.pipedrive.com/v1/users/me */
export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        await requestJson('Pipedrive', `${BASE}/users/me`, { ...opts(c), retries: 1 })
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

/**
 * GET https://api.pipedrive.com/v1/deals?status=won&sort=won_time DESC&start&limit=500
 * (paginated by additional_data.pagination.next_start; stops once deals are older than 60 days)
 */
export async function sync(c: Credentials): Promise<SignalSet> {
    const now = Date.now()
    const d30 = daysAgo(30, now).getTime()
    const d60 = daysAgo(60, now).getTime()
    let last30 = 0
    let prev30 = 0
    let start = 0

    for (let page = 0; page < MAX_PAGES; page++) {
        const params = new URLSearchParams({ status: 'won', sort: 'won_time DESC', start: String(start), limit: String(PAGE) })
        const res = await requestJson<DealsPage>('Pipedrive', `${BASE}/deals?${params}`, opts(c))
        let olderThanWindow = 0
        for (const deal of res.data ?? []) {
            if (!deal.won_time) continue
            const t = parseWonTime(deal.won_time)
            if (t >= d30) last30++
            else if (t >= d60) prev30++
            else olderThanWindow++
        }
        const p = res.additional_data?.pagination
        // sorted newest first: once a page is entirely older than 60 days we can stop
        if (!p?.more_items_in_collection || olderThanWindow === (res.data ?? []).length) break
        start = p.next_start ?? start + PAGE
    }

    return {
        growth: { newCustomersPerMonth: last30, pipelineGrowth: pctChange(last30, prev30), newLeadsPerMonth: null },
    }
}
