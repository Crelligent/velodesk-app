import { AsyncLocalStorage } from 'node:async_hooks'

/**
 * HTTP helper for provider APIs. Server only.
 * - per-request timeout
 * - retries on 429 / 502 / 503 / 504, honouring Retry-After (capped), else exponential backoff
 * - redirects are refused (redirect: 'error'), so a provider can't bounce us elsewhere
 * - honours the caller's AbortSignal (see runWithSyncContext)
 * - errors never include URLs, headers or response bodies (they can contain secrets)
 */

export interface SyncContext {
    /** Aborts every provider request in this run (e.g. pmf-score's overall timeout) */
    signal?: AbortSignal
    /** Background runs (after() hooks, cron) */
    background?: boolean
}

const syncContext = new AsyncLocalStorage<SyncContext>()

/** Runs `fn` so that every requestJson() inside it uses this signal / mode. */
export function runWithSyncContext<T>(context: SyncContext, fn: () => Promise<T>): Promise<T> {
    return syncContext.run(context, fn)
}

export function currentSyncContext(): SyncContext {
    return syncContext.getStore() ?? {}
}

/** Throws if the current run was aborted (for SDK loops that don't go through requestJson). */
export function throwIfAborted(): void {
    currentSyncContext().signal?.throwIfAborted()
}

export class ProviderError extends Error {
    constructor(
        public readonly provider: string,
        public readonly status: number,
        message?: string
    ) {
        super(message ?? `${provider} API error ${status}`)
        this.name = 'ProviderError'
    }

    get isAuthError(): boolean {
        return this.status === 401 || this.status === 403
    }
}

const RETRY_STATUSES = new Set([429, 502, 503, 504])
const MAX_RETRY_WAIT_MS = 30_000

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function retryAfterMs(res: Response, attempt: number): number {
    const header = res.headers.get('retry-after')
    if (header) {
        const seconds = Number(header)
        if (Number.isFinite(seconds)) return Math.min(seconds * 1000, MAX_RETRY_WAIT_MS)
        const date = Date.parse(header)
        if (!Number.isNaN(date)) return Math.min(Math.max(0, date - Date.now()), MAX_RETRY_WAIT_MS)
    }
    return Math.min(1000 * 2 ** attempt, MAX_RETRY_WAIT_MS)
}

export interface RequestOptions extends RequestInit {
    timeoutMs?: number
    retries?: number
}

export async function requestJson<T>(provider: string, url: string, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs = 20_000, retries = 3, ...init } = options
    const runSignal = currentSyncContext().signal
    for (let attempt = 0; ; attempt++) {
        if (runSignal?.aborted) throw new ProviderError(provider, 0, `${provider} request cancelled`)
        const signal = runSignal ? AbortSignal.any([runSignal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs)
        let res: Response
        try {
            res = await fetch(url, { ...init, cache: 'no-store', redirect: 'error', signal })
        } catch (error) {
            const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
            if (attempt < retries && !runSignal?.aborted) {
                await sleep(1000 * 2 ** attempt)
                continue
            }
            throw new ProviderError(provider, 0, `${provider} API ${timedOut ? 'timed out' : 'unreachable'}`)
        }

        if (RETRY_STATUSES.has(res.status) && attempt < retries && !runSignal?.aborted) {
            await sleep(retryAfterMs(res, attempt))
            continue
        }
        if (!res.ok) throw new ProviderError(provider, res.status)
        return (await res.json()) as T
    }
}

export function basicAuth(username: string, password = ''): string {
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
}

/** Error text safe to show to the founder / write to logs. */
export function describeError(error: unknown): string {
    if (error instanceof ProviderError) {
        return error.isAuthError
            ? `${error.provider} rejected these credentials (HTTP ${error.status})`
            : error.message
    }
    return error instanceof Error ? error.name : 'Unknown error'
}

export const DAY_MS = 24 * 60 * 60 * 1000
export const daysAgo = (days: number, from = Date.now()) => new Date(from - days * DAY_MS)
export const ymd = (d: Date) => d.toISOString().slice(0, 10)
export const ymdCompact = (d: Date) => ymd(d).replace(/-/g, '')
export const unixSeconds = (d: Date) => Math.floor(d.getTime() / 1000)

/** % change from `previous` to `current`; null when there is no base to compare against. */
export function pctChange(current: number, previous: number): number | null {
    if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null
    return Math.round(((current - previous) / previous) * 1000) / 10
}
