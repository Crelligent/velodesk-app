/**
 * Canny: feature-request demand (posts + votes). Feedback source.
 * Synced for the dashboard but NOT scored: raw post/vote volume has no defensible
 * 0-100 mapping without a per-company baseline.
 * Credentials: { apiKey } (sent in the JSON body, as Canny's API requires; never logged)
 */
import { daysAgo, describeError, requestJson } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'feedback' as const

const BASE = 'https://canny.io/api/v1'
const PAGE = 100
const MAX_PAGES = 20

const post = <T>(path: string, body: Record<string, unknown>) =>
    requestJson<T>('Canny', `${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

/** POST https://canny.io/api/v1/boards/list { apiKey } */
export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        await post('/boards/list', { apiKey: c.apiKey ?? '' })
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

/**
 * POST https://canny.io/api/v1/posts/list { apiKey, limit, skip, sort: 'newest' } -> { posts, hasMore }
 * Counts posts created in the last 30 days and the votes (score) on them.
 */
export async function sync(c: Credentials): Promise<SignalSet> {
    const cutoff = daysAgo(30).getTime()
    let posts = 0
    let votes = 0
    for (let page = 0; page < MAX_PAGES; page++) {
        const res = await post<{ posts?: Array<{ created?: string; score?: number }>; hasMore?: boolean }>(
            '/posts/list', { apiKey: c.apiKey ?? '', limit: PAGE, skip: page * PAGE, sort: 'newest' })
        let reachedOld = false
        for (const p of res.posts ?? []) {
            if (p.created && Date.parse(p.created) >= cutoff) {
                posts++
                votes += p.score ?? 0
            } else {
                reachedOld = true
            }
        }
        if (!res.hasMore || reachedOld) break
    }
    return { demand: { postsLast30d: posts, votesLast30d: votes } }
}
