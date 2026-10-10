/**
 * Intercom: conversation CSAT (ratings) + volume. Support source.
 * Credentials: { accessToken, region? } (region us|eu|au selects the regional API host)
 */
import { daysAgo, describeError, requestJson, unixSeconds, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'support' as const

const HOSTS: Record<string, string> = {
    us: 'https://api.intercom.io',
    eu: 'https://api.eu.intercom.io',
    au: 'https://api.au.intercom.io',
}
const MAX_PAGES = 20 // x150 = 3,000 conversations

const base = (c: Credentials) => HOSTS[(c.region || 'us').toLowerCase()] ?? HOSTS.us

const opts = (c: Credentials): RequestOptions => ({
    headers: {
        Authorization: `Bearer ${c.accessToken ?? ''}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Intercom-Version': '2.11',
    },
})

interface SearchPage {
    total_count?: number
    conversations?: Array<{ conversation_rating?: { rating?: number | null } | null }>
    pages?: { next?: { starting_after?: string } | null }
}

/** GET {host}/me */
export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        await requestJson('Intercom', `${base(c)}/me`, { ...opts(c), retries: 1 })
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

/**
 * POST {host}/conversations/search  { query: { field: 'created_at', operator: '>', value }, pagination }
 * CSAT = share of rated conversations (last 90 days) rated 4 or 5 out of 5.
 */
export async function sync(c: Credentials): Promise<SignalSet> {
    let startingAfter: string | undefined
    let rated = 0
    let positive = 0
    let truncated = true

    for (let page = 0; page < MAX_PAGES; page++) {
        const res = await requestJson<SearchPage>('Intercom', `${base(c)}/conversations/search`, {
            ...opts(c),
            method: 'POST',
            body: JSON.stringify({
                query: { field: 'created_at', operator: '>', value: unixSeconds(daysAgo(90)) },
                pagination: { per_page: 150, ...(startingAfter ? { starting_after: startingAfter } : {}) },
            }),
        })
        for (const conv of res.conversations ?? []) {
            const rating = conv.conversation_rating?.rating
            if (typeof rating === 'number') {
                rated++
                if (rating >= 4) positive++
            }
        }
        startingAfter = res.pages?.next?.starting_after
        if (!startingAfter) { truncated = false; break }
    }

    return {
        satisfaction: {
            nps: null,
            csat: rated > 0 ? Math.round((positive / rated) * 1000) / 10 : null,
            responses: rated,
        },
        notes: truncated ? ['Intercom: only the most recent 3,000 conversations were sampled'] : undefined,
    }
}
