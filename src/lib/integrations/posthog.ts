/**
 * PostHog: engagement (DAU/WAU/MAU) + month-1 retention via HogQL. Analytics source.
 * Credentials: { personalApiKey, projectId, host? } (key needs the "Query Read" scope)
 * Only PostHog Cloud hosts are accepted (self-hosted instances are not supported).
 * Limits: 240 req/min, 3 concurrent queries, 10s execution per query; 429 when the
 * hourly read budget is exhausted.
 */
import { currentSyncContext, describeError, requestJson, ProviderError } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'analytics' as const

/** PostHog Cloud API hosts (US/EU app and ingestion-style hostnames) */
export const POSTHOG_HOSTS = ['us.posthog.com', 'eu.posthog.com', 'us.i.posthog.com', 'eu.i.posthog.com']

/** Allow-list check: https, default port, no path tricks; returns the origin to call. */
export function postHogOrigin(rawHost: string | undefined): string {
    const raw = (rawHost || 'https://us.posthog.com').trim()
    let url: URL
    try {
        url = new URL(raw.includes('://') ? raw : `https://${raw}`)
    } catch {
        throw new ProviderError('PostHog', 0, 'PostHog host is not a valid URL')
    }
    if (url.protocol !== 'https:' || url.port !== '' || url.username || url.password ||
        !POSTHOG_HOSTS.includes(url.hostname.toLowerCase())) {
        throw new ProviderError('PostHog', 0, `PostHog host must be one of ${POSTHOG_HOSTS.join(', ')}`)
    }
    return `https://${url.hostname.toLowerCase()}`
}

/** POST {host}/api/projects/{projectId}/query/ with { query: { kind: 'HogQLQuery', query } } */
async function hogql(c: Credentials, query: string, name: string): Promise<unknown[][]> {
    const res = await requestJson<{ results?: unknown[][] }>(
        'PostHog',
        `${postHogOrigin(c.host)}/api/projects/${encodeURIComponent(c.projectId ?? '')}/query/`,
        {
            method: 'POST',
            headers: { Authorization: `Bearer ${c.personalApiKey ?? ''}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: { kind: 'HogQLQuery', query }, name: `velodesk: ${name}` }),
            timeoutMs: 45_000,
            // background runs (after() / cron): one attempt per query to protect the read budget
            ...(currentSyncContext().background ? { retries: 0 } : {}),
        }
    )
    return res.results ?? []
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : v != null && Number.isFinite(Number(v)) ? Number(v) : null)

export async function validate(c: Credentials): Promise<ValidationResult> {
    if (!/^\d+$/.test(c.projectId ?? '')) return { ok: false, error: 'PostHog project ID should be a number', input: true }
    try {
        postHogOrigin(c.host)
    } catch (error) {
        return { ok: false, error: describeError(error), input: true }
    }
    try {
        await hogql(c, 'SELECT 1', 'validate')
        return { ok: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

const DAU_QUERY = `
SELECT avg(c) FROM (
  SELECT toDate(timestamp) AS d, count(DISTINCT person_id) AS c
  FROM events
  WHERE timestamp >= toStartOfDay(now()) - INTERVAL 28 DAY AND timestamp < toStartOfDay(now())
  GROUP BY d
)`

const WAU_MAU_QUERY = `
SELECT
  count(DISTINCT if(timestamp >= now() - INTERVAL 7 DAY, person_id, NULL)) AS wau,
  count(DISTINCT person_id) AS mau
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY`

// Cohort: people first seen 60-90 days ago (within a 180-day look-back);
// retained = active again 30-60 days after their first event.
const RETENTION_QUERY = `
SELECT count() AS cohort, sum(returned) AS retained FROM (
  SELECT e.person_id AS pid,
         max(if(e.timestamp >= f.first_seen + INTERVAL 30 DAY AND e.timestamp < f.first_seen + INTERVAL 60 DAY, 1, 0)) AS returned
  FROM events AS e
  INNER JOIN (
    SELECT person_id, min(timestamp) AS first_seen
    FROM events
    WHERE timestamp >= now() - INTERVAL 180 DAY
    GROUP BY person_id
    HAVING first_seen >= now() - INTERVAL 90 DAY AND first_seen < now() - INTERVAL 60 DAY
  ) AS f ON e.person_id = f.person_id
  WHERE e.timestamp >= now() - INTERVAL 90 DAY
  GROUP BY e.person_id
)`

export async function sync(c: Credentials): Promise<SignalSet> {
    // Sequential: PostHog allows only 3 concurrent queries per project
    const dauRows = await hogql(c, DAU_QUERY, 'dau')
    const countRows = await hogql(c, WAU_MAU_QUERY, 'wau_mau')
    let retentionRows: unknown[][] = []
    const notes: string[] = []
    try {
        retentionRows = await hogql(c, RETENTION_QUERY, 'retention_m1')
    } catch (error) {
        notes.push(`PostHog retention query failed: ${describeError(error)}`)
    }

    const dau = num(dauRows[0]?.[0])
    const wau = num(countRows[0]?.[0])
    const mau = num(countRows[0]?.[1])
    const cohort = num(retentionRows[0]?.[0])
    const retained = num(retentionRows[0]?.[1])

    return {
        engagement: {
            dau: dau === null ? null : Math.round(dau),
            wau,
            mau,
            stickiness: dau !== null && mau ? Math.round((dau / mau) * 1000) / 1000 : null,
        },
        retention: {
            month1: cohort && retained !== null ? Math.round((retained / cohort) * 1000) / 10 : null,
            month3: null,
            month6: null,
            cohortSize: cohort,
        },
        notes: notes.length ? notes : undefined,
    }
}
