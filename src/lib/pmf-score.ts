/**
 * PMF Score calculation, shared by POST /api/pmf/calculate, the post-connect /
 * post-sync background refresh and the daily cron. Server only.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RevenueSummary } from '@/lib/revenue-score'
import { INTEGRATIONS } from '@/lib/integrations'
import { getProviderModule, parseCredentials } from '@/lib/integrations/registry'
import { deriveMetrics, type SourcedSignalSet } from '@/lib/integrations/signals'
import { describeError, runWithSyncContext } from '@/lib/integrations/http'

// PMF Score weights (from strategy)
const WEIGHTS = {
    retention: 0.25,
    revenueGrowth: 0.20,
    nps: 0.15,
    engagement: 0.15,
    timeToValue: 0.10,
    expansion: 0.10,
    referral: 0.05,
}

export const BASIS_LABELS = {
    measured: 'Based on connected data',
    mixed: 'Partly self-reported',
    self_reported: 'Self-reported: not verified by connected data',
} as const

export type MetricKey = keyof typeof WEIGHTS
export const METRIC_KEYS = Object.keys(WEIGHTS) as MetricKey[]

export interface MetricData {
    retention?: number
    revenueGrowth?: number
    nps?: number
    engagement?: number
    timeToValue?: number
    expansion?: number
    referral?: number
}

/**
 * Pulls fresh data from every connected source (the "sync"), merges optional
 * self-reported metrics, and writes a pmf_scores row (the one the dashboard reads).
 * `admin` must be the service-role client; `userId` must come from a verified source.
 * Returns { score: null, ... } without saving when no inputs exist.
 */
export async function calculateAndSavePmfScore(
    admin: SupabaseClient,
    userId: string,
    manualMetrics: MetricData = {},
    options: { background?: boolean } = {}
) {
    // Fetch data from connected integrations (tokens are service-role only)
    const integrated = await fetchIntegratedMetrics(userId, admin, options.background ?? false)

    // Merge integrated and manual metrics. Measured (synced) data always wins;
    // manual input only fills gaps and is flagged 'self_reported'.
    // Missing metrics stay undefined: they are EXCLUDED, never filled with a default.
    const metrics: MetricData = {}
    const sources: Partial<Record<MetricKey, string>> = {}
    for (const key of METRIC_KEYS) {
        const manual = manualMetrics[key]
        if (integrated.metrics[key] !== undefined) {
            metrics[key] = integrated.metrics[key]
            sources[key] = integrated.sources[key]
        } else if (typeof manual === 'number' && Number.isFinite(manual)) {
            metrics[key] = Math.min(100, Math.max(0, manual))
            sources[key] = 'self_reported'
        }
    }
    const inputsUsed = METRIC_KEYS.filter(k => metrics[k] !== undefined)
    const missing = METRIC_KEYS.filter(k => metrics[k] === undefined)
    const selfReported = inputsUsed.filter(k => sources[k] === 'self_reported')
    const basis: 'measured' | 'mixed' | 'self_reported' =
        selfReported.length === 0 ? 'measured'
            : selfReported.length === inputsUsed.length ? 'self_reported' : 'mixed'

    if (inputsUsed.length === 0) {
        // Nothing real to score: don't invent a number or save a row
        return {
            score: null,
            message: 'Not enough data: connect an integration or enter metrics manually',
            inputsUsed,
            missing,
            signalsUsed: 0,
            signalsTotal: METRIC_KEYS.length,
        }
    }

    // Calculate weighted PMF score over the available inputs only
    const score = calculatePMFScore(metrics)
    const scoreLabel = getScoreLabel(score)

    // Generate AI insights
    const insights = generateInsights(metrics, score)

    // Build breakdown object (same keys as before; missing inputs have score: null)
    const usedWeight = inputsUsed.reduce((sum, k) => sum + WEIGHTS[k], 0)
    const breakdown = Object.fromEntries(METRIC_KEYS.map(k => [k, {
        score: metrics[k] ?? null,
        weight: WEIGHTS[k],
        effectiveWeight: metrics[k] !== undefined ? Math.round((WEIGHTS[k] / usedWeight) * 1000) / 1000 : 0,
        source: sources[k] ?? null,
        // manual input, or a founder-run survey (e.g. Typeform NPS): show as self-reported
        selfReported: sources[k] === 'self_reported' || integrated.surveyMetrics.includes(k),
    }]))

    const inputs = { inputsUsed, missing, sources, selfReported, basis, revenue: integrated.revenue, sourceErrors: integrated.sourceErrors }

    // Save to database
    const { data: savedScore, error } = await admin
        .from('pmf_scores')
        .insert({
            user_id: userId,
            score,
            breakdown,
            insights,
            inputs,
            calculated_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (error) throw error

    // Throttle marker for background rescoring (see refreshPmfScore)
    await admin.from('profiles').update({ last_scored_at: new Date().toISOString() }).eq('id', userId)

    return {
        id: savedScore.id,
        score,
        scoreLabel,
        breakdown,
        insights,
        calculatedAt: savedScore.calculated_at,
        // Added fields (backward compatible)
        inputsUsed,
        missing,
        signalsUsed: inputsUsed.length,
        signalsTotal: METRIC_KEYS.length,
        sources,
        revenue: integrated.revenue,
        sourceErrors: integrated.sourceErrors, // connected sources that failed this run
        selfReported,
        basis, // 'self_reported' = no connected data behind this score
        basisLabel: BASIS_LABELS[basis],
    }
}

/** Background rescoring runs at most once per user per this window (save/sync/callback triggers). */
export const RESCORE_THROTTLE_MS = 15 * 60 * 1000

/**
 * Atomically claims the rescoring slot: sets profiles.last_scored_at = now only if it
 * is empty or older than the throttle window. Returns false if another run was too recent.
 */
async function claimRescoreSlot(admin: SupabaseClient, userId: string): Promise<boolean> {
    const now = new Date()
    const cutoff = new Date(now.getTime() - RESCORE_THROTTLE_MS).toISOString()
    const { data, error } = await admin
        .from('profiles')
        .update({ last_scored_at: now.toISOString() })
        .eq('id', userId)
        .or(`last_scored_at.is.null,last_scored_at.lt.${cutoff}`)
        .select('id')
    if (error) throw error
    if (data && data.length > 0) return true

    // No profile row at all -> nothing to throttle against; allow the run
    const { data: profile } = await admin.from('profiles').select('id').eq('id', userId).maybeSingle()
    return !profile
}

/**
 * Background refresh after connect/sync (throttled) and from the daily cron (force):
 * recalculates with fresh provider data, carrying forward the user's last
 * self-reported inputs. Never throws.
 */
export async function refreshPmfScore(
    admin: SupabaseClient,
    userId: string,
    options: { force?: boolean } = {}
): Promise<void> {
    try {
        if (!options.force && !(await claimRescoreSlot(admin, userId))) {
            console.log(`PMF refresh skipped for user ${userId}: last scored under 15 minutes ago`)
            return
        }

        const { data: last } = await admin
            .from('pmf_scores')
            .select('breakdown')
            .eq('user_id', userId)
            .order('calculated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        const manual: MetricData = {}
        const breakdown = (last?.breakdown ?? {}) as Record<string, { score?: unknown; source?: unknown }>
        for (const key of METRIC_KEYS) {
            const entry = breakdown[key]
            if (entry?.source === 'self_reported' && typeof entry.score === 'number') manual[key] = entry.score
        }

        await calculateAndSavePmfScore(admin, userId, manual, { background: true })
    } catch (error) {
        console.error(`PMF refresh failed for user ${userId}:`, describeError(error))
    }
}

/** Weighted average over the AVAILABLE metrics; weights are renormalised to sum to 1. */
function calculatePMFScore(metrics: MetricData): number {
    let weighted = 0
    let totalWeight = 0
    for (const key of METRIC_KEYS) {
        const value = metrics[key]
        if (value === undefined) continue
        weighted += value * WEIGHTS[key]
        totalWeight += WEIGHTS[key]
    }
    if (totalWeight === 0) return 0
    return Math.round(Math.min(100, Math.max(0, weighted / totalWeight)))
}

export function getScoreLabel(score: number): string {
    if (score >= 80) return 'Strong PMF'
    if (score >= 60) return 'Emerging PMF'
    if (score >= 40) return 'Searching'
    return 'Pre-PMF'
}

function generateInsights(metrics: MetricData, score: number): string[] {
    const insights: string[] = []

    // Find strongest metric
    const metricScores = (Object.entries(metrics) as [keyof MetricData, number | undefined][])
        .filter((e): e is [keyof MetricData, number] => typeof e[1] === 'number')
    const sorted = metricScores.sort((a, b) => (b[1] || 0) - (a[1] || 0))
    const strongest = sorted[0]
    const weakest = sorted[sorted.length - 1]

    if (strongest && strongest[1] >= 70) {
        insights.push(`Strong ${formatMetricName(strongest[0])} (${strongest[1]}) is driving your PMF score`)
    }

    if (weakest && weakest[1] < 50) {
        insights.push(`Focus on improving ${formatMetricName(weakest[0])} (${weakest[1]}) for the biggest impact`)
    }

    // Score-specific insights
    if (score >= 80) {
        insights.push('Your PMF metrics indicate you\'re ready for aggressive growth investment')
    } else if (score >= 60) {
        insights.push('Emerging PMF suggests continued iteration before major scaling')
    } else if (score >= 40) {
        insights.push('Focus on finding repeatable customer segments before expanding')
    } else {
        insights.push('Prioritize customer discovery and problem-solution fit')
    }

    // Retention-specific
    if (metrics.retention && metrics.retention >= 75) {
        insights.push('High retention indicates strong product value delivery')
    }

    // Growth-specific
    if (metrics.revenueGrowth && metrics.revenueGrowth >= 70) {
        insights.push('Strong revenue growth momentum - consider expansion opportunities')
    }

    return insights.slice(0, 4)
}

function formatMetricName(key: string): string {
    const names: Record<string, string> = {
        retention: 'Retention Rate',
        revenueGrowth: 'Revenue Growth',
        nps: 'NPS Score',
        engagement: 'Engagement',
        timeToValue: 'Time-to-Value',
        expansion: 'Expansion Revenue',
        referral: 'Referral Rate',
    }
    return names[key] || key
}

interface IntegratedMetrics {
    metrics: Partial<MetricData>
    sources: Partial<Record<MetricKey, string>>
    revenue: RevenueSummary | null
    /** Connected sources that failed to sync, or whose sample was too small (excluded, not defaulted) */
    sourceErrors: Record<string, string>
    /** Metrics that came from a founder-run survey */
    surveyMetrics: MetricKey[]
}

/** Overall budget for syncing all sources; aborts every in-flight provider request. */
const SYNC_TIMEOUT_MS = 90_000

/** Rejects as soon as `signal` aborts, so a stuck SDK call can't hold the run open. */
function untilAborted<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            if (signal.aborted) reject(new Error('timed out'))
            signal.addEventListener('abort', () => reject(new Error('timed out')), { once: true })
        }),
    ])
}

/**
 * Syncs every connected source that feeds the score and combines their SignalSets
 * (precedence rules in src/lib/integrations/signals.ts: billing > analytics for revenue,
 * analytics > CRM for engagement). `sources` records which provider each signal came from.
 */
async function fetchIntegratedMetrics(userId: string, supabase: SupabaseClient, background: boolean): Promise<IntegratedMetrics> {
    const { data: rows, error } = await supabase
        .from('integration_tokens')
        .select('provider, access_token, config')
        .eq('user_id', userId)
        .eq('status', 'connected')

    if (error || !rows || rows.length === 0) {
        return { metrics: {}, sources: {}, revenue: null, sourceErrors: {}, surveyMetrics: [] }
    }

    // Catalog order keeps precedence deterministic within a source kind
    const scored = INTEGRATIONS.filter(i => i.feedsScore)
        .map(i => ({ catalog: i, row: rows.find(r => r.provider === i.id), module: getProviderModule(i.id) }))
        .filter(x => x.row?.access_token && x.module)

    // One signal for the whole run, propagated to every provider request via the sync context
    const signal = AbortSignal.timeout(SYNC_TIMEOUT_MS)
    const settled = await runWithSyncContext({ signal, background }, () =>
        Promise.allSettled(scored.map(({ catalog, row, module }) =>
            untilAborted(module!.sync(parseCredentials(catalog.id, row!.access_token), {
                config: row!.config as Record<string, unknown> | null,
            }), signal)
        ))
    )

    const sets: SourcedSignalSet[] = []
    const sourceErrors: Record<string, string> = {}
    settled.forEach((result, i) => {
        const { catalog, module } = scored[i]
        if (result.status === 'fulfilled') {
            sets.push({ provider: catalog.id, name: catalog.name, kind: module!.kind, signals: result.value })
        } else {
            sourceErrors[catalog.id] = describeError(result.reason)
            console.error(`PMF: ${catalog.id} sync failed for user ${userId}:`, sourceErrors[catalog.id])
        }
    })

    const derived = deriveMetrics(sets)
    // Signals ignored for small samples are reported alongside sync failures
    for (const [provider, reason] of Object.entries(derived.ignored)) {
        sourceErrors[provider] = sourceErrors[provider] ? `${sourceErrors[provider]}; ${reason}` : reason
    }
    return {
        metrics: derived.metrics,
        sources: derived.sources,
        revenue: derived.revenue,
        sourceErrors,
        surveyMetrics: derived.selfReported,
    }
}
