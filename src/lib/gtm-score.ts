/**
 * Go-to-Market Score: is the selling working? A 0-100 score from CRM data,
 * shown beside the PMF Score (is the product working?).
 *
 * Pure functions (no I/O) so they can be unit tested. Like the PMF Score, a
 * component without enough data is EXCLUDED, never filled with a default, and
 * the weights are renormalised over what is available.
 */
import { interpolate } from './revenue-score'
import { PIPELINE_GROWTH_BANDS, type SourcedSignalSet } from './integrations/signals'

export const GTM_WEIGHTS = {
    winRate: 0.30,
    pipelineGrowth: 0.25,
    leadConversion: 0.25,
    dealSpeed: 0.20,
} as const

export type GtmComponent = keyof typeof GTM_WEIGHTS
export const GTM_COMPONENTS = Object.keys(GTM_WEIGHTS) as GtmComponent[]

export const GTM_LABELS: Record<GtmComponent, string> = {
    winRate: 'Win rate',
    pipelineGrowth: 'Pipeline growth',
    leadConversion: 'Lead to customer',
    dealSpeed: 'Deal speed',
}

/** Won / (won + lost), last 90 days, % */
export const WIN_RATE_BANDS: Array<[number, number]> = [[0, 0], [10, 30], [20, 55], [30, 80], [45, 100]]
/** Median days from deal created to won (shorter is better) */
export const DEAL_SPEED_BANDS: Array<[number, number]> = [[7, 100], [30, 80], [60, 60], [90, 40], [180, 10], [365, 0]]
/** % of contacts created 31-120 days ago that are now customers */
export const LEAD_CONVERSION_BANDS: Array<[number, number]> = [[0, 0], [1, 25], [3, 55], [5, 75], [10, 100]]

export const GTM_MIN_SAMPLES = {
    closedDeals: 10, // win rate
    wonDeals: 5, // deal speed
    dealsCreated: 10, // pipeline growth (last 30 + previous 30)
    leadCohort: 30, // lead to customer
} as const

/** A GTM Score needs at least this many components; fewer says too little about the funnel. */
export const GTM_MIN_COMPONENTS = 2

export interface GtmComponentDetail {
    score: number | null
    weight: number
    /** Raw figure behind the score, for display: %, days or % change */
    value: number | null
    unit: '%' | 'days' | '% change'
    source: string | null
}

export interface GtmResult {
    score: number | null
    components: Record<GtmComponent, GtmComponentDetail>
    inputsUsed: GtmComponent[]
    missing: GtmComponent[]
    /** provider -> why a component was left out */
    ignored: Record<string, string>
}

const round1 = (n: number) => Math.round(n * 10) / 10
const clamp = (n: number) => round1(Math.min(100, Math.max(0, n)))

export function gtmScoreLabel(score: number): string {
    if (score >= 80) return 'Scaling'
    if (score >= 60) return 'Repeatable'
    if (score >= 40) return 'Building'
    return 'Early'
}

/** Combines CRM SignalSets into the Go-to-Market Score. The first CRM with a usable figure wins per component. */
export function deriveGtm(sets: SourcedSignalSet[]): GtmResult {
    const crm = sets.filter(s => s.kind === 'crm' && s.signals.sales)
    const ignored: Record<string, string> = {}
    const ignore = (s: SourcedSignalSet, reason: string) => {
        const msg = `${s.name ?? s.provider}: ${reason}`
        ignored[s.provider] = ignored[s.provider] ? `${ignored[s.provider]}; ${msg}` : msg
    }
    const components = Object.fromEntries(GTM_COMPONENTS.map(k => [k, {
        score: null, weight: GTM_WEIGHTS[k], value: null,
        unit: k === 'dealSpeed' ? 'days' : k === 'pipelineGrowth' ? '% change' : '%',
        source: null,
    }])) as unknown as Record<GtmComponent, GtmComponentDetail>
    const set = (k: GtmComponent, score: number, value: number, source: string) => {
        if (components[k].score !== null) return
        components[k].score = clamp(score)
        components[k].value = round1(value)
        components[k].source = source
    }

    for (const s of crm) {
        const sl = s.signals.sales!

        // Win rate
        if (typeof sl.wonDeals90d === 'number' && typeof sl.lostDeals90d === 'number') {
            const closed = sl.wonDeals90d + sl.lostDeals90d
            if (closed >= GTM_MIN_SAMPLES.closedDeals) {
                const rate = (sl.wonDeals90d / closed) * 100
                set('winRate', interpolate(WIN_RATE_BANDS, rate), rate, s.provider)
            } else ignore(s, `${closed} closed deals in 90 days, need ${GTM_MIN_SAMPLES.closedDeals} for win rate`)
        }

        // Deal speed
        if (typeof sl.medianDaysToClose === 'number') {
            if ((sl.daysToCloseSample ?? 0) >= GTM_MIN_SAMPLES.wonDeals) {
                set('dealSpeed', interpolate(DEAL_SPEED_BANDS, sl.medianDaysToClose), sl.medianDaysToClose, s.provider)
            } else ignore(s, `${sl.daysToCloseSample ?? 0} won deals, need ${GTM_MIN_SAMPLES.wonDeals} for deal speed`)
        }

        // Pipeline growth: new deals created, last 30 days vs the 30 before
        if (typeof sl.dealsCreatedLast30 === 'number' && typeof sl.dealsCreatedPrev30 === 'number') {
            const total = sl.dealsCreatedLast30 + sl.dealsCreatedPrev30
            if (total >= GTM_MIN_SAMPLES.dealsCreated && sl.dealsCreatedPrev30 > 0) {
                const growth = ((sl.dealsCreatedLast30 - sl.dealsCreatedPrev30) / sl.dealsCreatedPrev30) * 100
                set('pipelineGrowth', interpolate(PIPELINE_GROWTH_BANDS, growth), growth, s.provider)
            } else ignore(s, `${total} new deals in 60 days, need ${GTM_MIN_SAMPLES.dealsCreated} for pipeline growth`)
        }

        // Lead to customer
        if (typeof sl.leadCohort === 'number' && typeof sl.leadCohortCustomers === 'number') {
            if (sl.leadCohort >= GTM_MIN_SAMPLES.leadCohort) {
                const rate = (sl.leadCohortCustomers / sl.leadCohort) * 100
                set('leadConversion', interpolate(LEAD_CONVERSION_BANDS, rate), rate, s.provider)
            } else ignore(s, `${sl.leadCohort} leads in the cohort, need ${GTM_MIN_SAMPLES.leadCohort} for lead to customer`)
        }
    }

    const inputsUsed = GTM_COMPONENTS.filter(k => components[k].score !== null)
    const missing = GTM_COMPONENTS.filter(k => components[k].score === null)
    let score: number | null = null
    if (inputsUsed.length >= GTM_MIN_COMPONENTS) {
        const total = inputsUsed.reduce((sum, k) => sum + GTM_WEIGHTS[k], 0)
        const weighted = inputsUsed.reduce((sum, k) => sum + components[k].score! * GTM_WEIGHTS[k], 0)
        score = Math.round(Math.min(100, Math.max(0, weighted / total)))
    }
    return { score, components, inputsUsed, missing, ignored }
}
