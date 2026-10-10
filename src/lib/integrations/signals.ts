/**
 * Provider-agnostic signals and the rules that turn them into the 7 PMF metrics.
 * Pure functions (no I/O) so they can be unit tested.
 *
 * Every field is `null` when the provider could not measure it: never a default.
 */
import { interpolate, scoreMrr, type RevenueSummary } from '../revenue-score'

export interface SignalSet {
    revenue?: {
        mrr: number | null // major units of `currency`
        currency: string | null
        mrrByCurrency: Record<string, number> | null
        churnRate: number | null // % of subscriptions lost in the last 30 days
        expansionMrr: number | null // major units of `currency`, last 30 days
        subscriptions?: number | null // churn base: active + churned in the window
    }
    retention?: {
        month1: number | null // % of a cohort still active ~1 month after start
        month3: number | null
        month6: number | null
        cohortSize?: number | null // users in the month-1 cohort
    }
    engagement?: {
        dau: number | null // average daily actives, last 28 days
        wau: number | null
        mau: number | null
        stickiness: number | null // DAU / MAU, 0..1
    }
    satisfaction?: {
        nps: number | null // -100..100
        csat: number | null // % positive ratings, 0..100
        responses: number | null // NPS responses or CSAT ratings counted
    }
    growth?: {
        newCustomersPerMonth: number | null // deals/opportunities won, last 30 days
        pipelineGrowth: number | null // % change vs the previous 30 days
        newLeadsPerMonth: number | null
    }
    demand?: {
        postsLast30d: number | null
        votesLast30d: number | null
    }
    notes?: string[]
}

export type SourceKind = 'billing' | 'analytics' | 'crm' | 'support' | 'survey' | 'feedback'

export interface SourcedSignalSet {
    provider: string
    /** Display name for messages, e.g. "Typeform" */
    name?: string
    kind: SourceKind
    signals: SignalSet
}

export type Credentials = Record<string, string>

/**
 * `input: true` = the founder can fix the value (format, wrong field); safe to show.
 * Anything else is shown to the founder only as a generic "couldn't verify" message.
 */
export type ValidationResult = { ok: true } | { ok: false; error: string; input?: boolean }

/** Contract every provider module implements (see ./registry.ts). */
export interface ProviderModule {
    kind: SourceKind
    validate(credentials: Credentials): Promise<ValidationResult>
    sync(credentials: Credentials, context?: { config?: Record<string, unknown> | null }): Promise<SignalSet>
}

// ---------------------------------------------------------------------------
// Scoring rules (0-100). Bands are [input, score] pairs, linearly interpolated.
// ---------------------------------------------------------------------------

/** DAU/MAU: 10% ≈ 40, 20% (good SaaS) = 60, 40%+ = 85, 50% = 100 */
export const STICKINESS_BANDS: Array<[number, number]> = [[0, 0], [0.1, 40], [0.2, 60], [0.4, 85], [0.5, 100]]
/** Month-over-month growth in won deals/opportunities (%) when no billing source exists */
export const PIPELINE_GROWTH_BANDS: Array<[number, number]> = [[-50, 0], [0, 30], [10, 60], [25, 85], [50, 100]]
/** Expansion MRR as % of MRR per month */
export const EXPANSION_BANDS: Array<[number, number]> = [[0, 0], [1, 30], [2, 50], [5, 100]]

/** Minimum sample sizes below which a signal is ignored (not scored) */
export const MIN_SAMPLES = {
    npsResponses: 30,
    csatRatings: 30,
    billingSubscriptions: 10,
    retentionCohort: 20,
} as const

export type PmfMetric =
    | 'retention' | 'revenueGrowth' | 'nps' | 'engagement' | 'timeToValue' | 'expansion' | 'referral'

const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)) * 10) / 10

/**
 * Source precedence per metric (first kind with a value wins; within a kind,
 * the order sources were passed in).
 */
export const PRECEDENCE: Record<'retention' | 'engagement' | 'nps', SourceKind[]> = {
    // product cohorts are the direct measure; billing churn is the fallback
    retention: ['analytics', 'billing'],
    // analytics over CRM
    engagement: ['analytics', 'crm'],
    // a real NPS survey over support CSAT
    nps: ['survey', 'support'],
}

function byKind(sets: SourcedSignalSet[], kinds: SourceKind[]): SourcedSignalSet[] {
    return kinds.flatMap(kind => sets.filter(s => s.kind === kind))
}

export interface DerivedMetrics {
    metrics: Partial<Record<PmfMetric, number>>
    sources: Partial<Record<PmfMetric, string>>
    revenue: RevenueSummary | null
    /** provider -> why its signal was ignored (e.g. "Typeform: 12 responses, need 30") */
    ignored: Record<string, string>
    /** metrics that come from a founder-run survey (shown as "founder-run survey") */
    selfReported: PmfMetric[]
}

/** Combines the SignalSets of all connected sources into the 7 PMF metrics. */
export function deriveMetrics(sets: SourcedSignalSet[]): DerivedMetrics {
    const metrics: DerivedMetrics['metrics'] = {}
    const sources: DerivedMetrics['sources'] = {}
    const ignored: DerivedMetrics['ignored'] = {}
    const selfReported: PmfMetric[] = []
    const set = (key: PmfMetric, value: number, source: string) => {
        metrics[key] = clamp(value)
        sources[key] = source
    }
    const ignore = (s: SourcedSignalSet, reason: string) => {
        const msg = `${s.name ?? s.provider}: ${reason}`
        ignored[s.provider] = ignored[s.provider] ? `${ignored[s.provider]}; ${msg}` : msg
    }
    /** true if n meets the minimum; otherwise records why the signal was ignored */
    const enough = (s: SourcedSignalSet, n: number | null | undefined, min: number, unit: string) => {
        if (typeof n === 'number' && n >= min) return true
        ignore(s, typeof n === 'number' ? `${n} ${unit}, need ${min}` : `${unit} count unknown, need ${min}`)
        return false
    }

    // revenueGrowth: billing over everything. All billing sources are combined
    // (currency-aware, see revenue-score.ts). CRM growth only if no billing data.
    const billing = sets.filter(s => s.kind === 'billing' && s.signals.revenue?.mrrByCurrency)
    const revenue = scoreMrr(billing.map(s => ({
        source: s.provider,
        mrrByCurrency: s.signals.revenue!.mrrByCurrency!,
    })))
    if (revenue) {
        set('revenueGrowth', revenue.score, billing.map(s => s.provider).join('+'))
    } else {
        const crm = sets.find(s => s.kind === 'crm' && typeof s.signals.growth?.pipelineGrowth === 'number')
        if (crm) set('revenueGrowth', interpolate(PIPELINE_GROWTH_BANDS, crm.signals.growth!.pipelineGrowth!), crm.provider)
    }

    // retention: analytics month-1 cohort retention (%), else billing churn
    for (const s of byKind(sets, PRECEDENCE.retention)) {
        const r = s.signals.retention
        if (s.kind === 'analytics' && typeof r?.month1 === 'number') {
            if (!enough(s, r.cohortSize, MIN_SAMPLES.retentionCohort, 'users in the month-1 cohort')) continue
            set('retention', r.month1, s.provider)
            break
        }
        const rev = s.signals.revenue
        if (s.kind === 'billing' && typeof rev?.churnRate === 'number') {
            if (!enough(s, rev.subscriptions, MIN_SAMPLES.billingSubscriptions, 'subscriptions')) continue
            // 0% monthly churn = 100, 10%+ = 0
            set('retention', 100 - rev.churnRate * 10, s.provider)
            break
        }
    }

    // engagement: DAU/MAU stickiness, analytics over CRM
    for (const s of byKind(sets, PRECEDENCE.engagement)) {
        const stickiness = s.signals.engagement?.stickiness
        if (typeof stickiness === 'number') {
            set('engagement', interpolate(STICKINESS_BANDS, stickiness), s.provider)
            break
        }
    }

    // nps: NPS (-100..100 -> 0..100) over CSAT (% positive)
    for (const s of byKind(sets, PRECEDENCE.nps)) {
        const sat = s.signals.satisfaction
        if (typeof sat?.nps === 'number') {
            if (!enough(s, sat.responses, MIN_SAMPLES.npsResponses, 'responses')) continue
            set('nps', (sat.nps + 100) / 2, s.provider)
            if (s.kind === 'survey') selfReported.push('nps')
            break
        }
        if (typeof sat?.csat === 'number') {
            if (!enough(s, sat.responses, MIN_SAMPLES.csatRatings, 'ratings')) continue
            set('nps', sat.csat, s.provider)
            break
        }
    }

    // expansion: billing expansion MRR as % of MRR (same source, same currency)
    for (const s of sets.filter(x => x.kind === 'billing')) {
        const r = s.signals.revenue
        if (r && typeof r.expansionMrr === 'number' && typeof r.mrr === 'number' && r.mrr > 0) {
            set('expansion', interpolate(EXPANSION_BANDS, (r.expansionMrr / r.mrr) * 100), s.provider)
            break
        }
    }

    // timeToValue, referral: no connected source measures these yet -> stay missing
    return { metrics, sources, revenue, ignored, selfReported }
}
