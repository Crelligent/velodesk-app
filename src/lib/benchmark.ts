/**
 * Programme benchmark: how a founder's scores compare with other companies that joined
 * through the same partner programme (e.g. HubSpot for Startups).
 *
 * Only anonymised aggregates leave this module: count, median and quartiles, plus the
 * founder's own position. Nothing is shown until MIN_BENCHMARK_COMPANIES companies have
 * a recent score, so no single company's score can be read off the figures.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { DEMO_EMAILS } from './demo'
import { PERKS } from './perks'

export const MIN_BENCHMARK_COMPANIES = 5
/** Scores older than this are left out, so the benchmark reflects companies as they are now. */
export const BENCHMARK_WINDOW_DAYS = 90

export interface Distribution {
    companies: number
    median: number
    p25: number
    p75: number
}

export interface ScoreBenchmark {
    /** null while fewer than MIN_BENCHMARK_COMPANIES companies have a score */
    distribution: Distribution | null
    companies: number
    yours: number | null
    /** % of the other companies scoring below you (ties count half); null without your score */
    aheadOf: number | null
}

export interface ProgrammeBenchmark {
    programme: string
    programmeName: string
    pmf: ScoreBenchmark
    gtm: ScoreBenchmark
    /** Whether this founder opted in, so others see their scores in the aggregate */
    included: boolean
}

/** Linear-interpolated quantile of a sorted array (q in 0..1). */
export function quantile(sorted: number[], q: number): number {
    if (sorted.length === 0) return NaN
    const pos = (sorted.length - 1) * q
    const lo = Math.floor(pos), hi = Math.ceil(pos)
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

const r = (n: number) => Math.round(n)

/** Pure: `scores` holds one latest score per company, including the founder's own (`yours`) if any. */
export function benchmarkScores(scores: number[], yours: number | null): ScoreBenchmark {
    const sorted = [...scores].sort((a, b) => a - b)
    const companies = sorted.length
    let aheadOf: number | null = null
    if (yours !== null && companies > 1) {
        const others = [...sorted]
        others.splice(others.indexOf(yours), 1)
        const below = others.filter(s => s < yours).length
        const ties = others.filter(s => s === yours).length
        aheadOf = r(((below + ties / 2) / others.length) * 100)
    }
    const distribution = companies >= MIN_BENCHMARK_COMPANIES
        ? { companies, median: r(quantile(sorted, 0.5)), p25: r(quantile(sorted, 0.25)), p75: r(quantile(sorted, 0.75)) }
        : null
    return { distribution, companies, yours, aheadOf: distribution ? aheadOf : null }
}

/** Latest score per user from rows sorted newest first. */
export function latestPerUser(rows: Array<{ user_id: string; score: number | string }>): Map<string, number> {
    const latest = new Map<string, number>()
    for (const row of rows) if (!latest.has(row.user_id)) latest.set(row.user_id, Math.round(Number(row.score)))
    return latest
}

/**
 * Server only: `admin` must be the service-role client (it reads other members' scores
 * to build the aggregate). Returns null if the user is not in a programme.
 */
export async function getProgrammeBenchmark(admin: SupabaseClient, userId: string): Promise<ProgrammeBenchmark | null> {
    const { data: membership } = await admin
        .from('programme_members')
        .select('programme')
        .eq('user_id', userId)
        .maybeSingle()
    if (!membership) return null
    const programme = membership.programme as string

    const { data: members } = await admin
        .from('programme_members')
        .select('user_id')
        .eq('programme', programme)
        .limit(5000)
    let ids = (members ?? []).map(m => m.user_id as string)

    // Shared demo accounts never count towards a real benchmark
    const { data: demoProfiles } = await admin.from('profiles').select('id, email').in('id', ids)
    const demoIds = new Set((demoProfiles ?? []).filter(p => DEMO_EMAILS.has(String(p.email ?? '').toLowerCase())).map(p => p.id as string))
    ids = ids.filter(id => !demoIds.has(id))

    // Opt-in only: other companies count only if they chose to take part (privacy_choices.benchmark).
    // The viewer's own score is always used for their own position, never shown to others unless they opted in.
    const { data: optIns } = ids.length
        ? await admin.from('privacy_choices').select('user_id').in('user_id', ids).eq('benchmark', true)
        : { data: [] }
    const optedIn = new Set((optIns ?? []).map(r => r.user_id as string))
    const included = optedIn.has(userId)
    ids = ids.filter(id => optedIn.has(id) || id === userId)

    const since = new Date(Date.now() - BENCHMARK_WINDOW_DAYS * 86_400_000).toISOString()
    const read = async (table: 'pmf_scores' | 'gtm_scores') => {
        if (ids.length === 0) return new Map<string, number>()
        const { data } = await admin
            .from(table)
            .select('user_id, score')
            .in('user_id', ids)
            .gte('calculated_at', since)
            .order('calculated_at', { ascending: false })
            .limit(20000)
        return latestPerUser((data ?? []) as Array<{ user_id: string; score: number }>)
    }
    const [pmf, gtm] = await Promise.all([read('pmf_scores'), read('gtm_scores')])

    return {
        programme,
        programmeName: PERKS[programme]?.partner ?? programme,
        pmf: benchmarkScores([...pmf.values()], pmf.get(userId) ?? null),
        gtm: benchmarkScores([...gtm.values()], gtm.get(userId) ?? null),
        included,
    }
}
