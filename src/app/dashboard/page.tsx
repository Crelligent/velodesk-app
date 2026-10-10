import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plug, RefreshCw } from 'lucide-react'

// This page used to render hard-coded figures (PMF Score 84, MRR ₦142.5M/$142,500, NRR, CAC,
// users, economics, TAM, competitors and a mock signal feed) to every user. Those were removed:
// only data read from the user's own rows is shown. MRR / retention cards and the signal feed
// should come back once there is a real data source for them (e.g. pmf_scores.inputs.revenue).

type BreakdownValue = number | { score: number | null; source?: string | null } | null

// Shape of a pmf_scores row (same data the /api/pmf/calculate response is built from).
interface ScoreRow {
    score: number
    breakdown: Record<string, BreakdownValue> | null
    calculated_at: string
    self_reported?: boolean | null
    inputs?: {
        inputsUsed?: string[]
        selfReported?: string[]
        basis?: 'measured' | 'mixed' | 'self_reported'
    } | null
}

function includesSelfReported(row: ScoreRow): boolean {
    if (row.self_reported) return true
    if (row.inputs?.basis && row.inputs.basis !== 'measured') return true
    if ((row.inputs?.selfReported?.length ?? 0) > 0) return true
    return Object.values(row.breakdown ?? {}).some(
        v => typeof v === 'object' && v !== null && v.source === 'self_reported'
    )
}

const metricLabels: Record<string, string> = {
    retention: 'Retention',
    revenueGrowth: 'Revenue growth',
    nps: 'NPS',
    engagement: 'Engagement',
    timeToValue: 'Time to value',
    expansion: 'Expansion',
    referral: 'Referral',
}

function breakdownScore(value: BreakdownValue): number | null {
    if (typeof value === 'number') return value
    if (value && typeof value === 'object' && typeof value.score === 'number') return value.score
    return null
}

function scoreLabel(score: number): string {
    // Mirrors getScoreLabel in src/app/api/pmf/calculate/route.ts
    if (score >= 80) return 'Strong PMF'
    if (score >= 60) return 'Emerging PMF'
    if (score >= 40) return 'Searching'
    return 'Pre-PMF'
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let latestScore: ScoreRow | null = null
    let connectedCount = 0

    if (user) {
        const [{ data: scoreRows }, { count }] = await Promise.all([
            supabase
                .from('pmf_scores')
                .select('*')
                .eq('user_id', user.id)
                .order('calculated_at', { ascending: false })
                .limit(1),
            supabase
                .from('integration_tokens')
                .select('provider', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'connected'),
        ])
        const row = scoreRows?.[0]
        if (row && typeof row.score === 'number') latestScore = row as ScoreRow
        connectedCount = count ?? 0
    }

    if (!latestScore) {
        const hasSources = connectedCount > 0
        return (
            <div className="max-w-5xl mx-auto pb-24 bg-[#04060D] min-h-screen">
                <div className="p-8 md:p-12 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-xl text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                        {hasSources
                            ? <RefreshCw size={20} className="text-[#38BDF8]" aria-hidden="true" />
                            : <Plug size={20} className="text-[#7B61FF]" aria-hidden="true" />}
                    </div>
                    <h1 className="text-2xl font-light text-white mb-3">
                        {hasSources ? 'Your PMF Score is on its way' : 'Connect a data source to get your PMF Score'}
                    </h1>
                    <p className="text-sm text-[#8A8A8A] max-w-md leading-relaxed mb-8">
                        {hasSources
                            ? `You have ${connectedCount} data source${connectedCount > 1 ? 's' : ''} connected. Your score appears here once your data has synced and been scored.`
                            : 'Your score is calculated from your real payment and product data. Connect Paystack or Stripe to get started.'}
                    </p>
                    <Link
                        href="/dashboard/integrations"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060D]"
                    >
                        {hasSources ? 'Manage data sources' : 'Connect a data source'}
                    </Link>
                </div>
            </div>
        )
    }

    const breakdownEntries = Object.entries(latestScore.breakdown ?? {})
        .map(([key, value]) => [key, breakdownScore(value)] as const)
    // Same definitions as signalsUsed / signalsTotal in the calculate response
    const signalsTotal = breakdownEntries.length
    const signalsUsed = latestScore.inputs?.inputsUsed?.length
        ?? breakdownEntries.filter(([, v]) => v !== null).length
    const selfReported = includesSelfReported(latestScore)

    return (
        <div className="max-w-5xl mx-auto pb-24 bg-[#04060D] min-h-screen">
            {/* PMF Score — latest row from pmf_scores */}
            <div className="flex flex-col md:flex-row gap-6 p-5 mb-4 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-xl">
                <div className="flex flex-col items-center justify-center md:pr-8 md:border-r border-white/5 min-w-[140px]">
                    <h1 className="text-[10px] uppercase tracking-widest text-[#8A8A8A] mb-1">PMF Score</h1>
                    <div className="text-4xl font-light tracking-tighter tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#38BDF8]">
                        {Math.round(latestScore.score)}
                    </div>
                    <div className="text-[11px] text-gray-300 mt-1">{scoreLabel(latestScore.score)}</div>
                    {signalsTotal > 0 && (
                        <div className="text-[10px] text-[#8A8A8A] mt-1">
                            Based on {signalsUsed} of {signalsTotal} signals
                        </div>
                    )}
                    {selfReported && (
                        <div className="text-[10px] text-amber-300 mt-2 px-2 py-0.5 border border-amber-300/30 rounded">
                            Includes self-reported data
                        </div>
                    )}
                    <div className="text-[10px] text-[#8A8A8A] mt-2">
                        Updated {new Date(latestScore.calculated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                </div>
                <dl className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 content-center">
                    {breakdownEntries.map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-[11px]">
                            <dt className="text-[#8A8A8A] w-28">{metricLabels[key] ?? key}</dt>
                            <dd className="flex items-center gap-3 flex-1">
                                <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden" aria-hidden="true">
                                    {value !== null && (
                                        <div
                                            className="h-full bg-gradient-to-r from-[#7B61FF]/80 to-[#38BDF8]/80 rounded-full"
                                            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                                        />
                                    )}
                                </div>
                                <span className="text-gray-300 tabular-nums w-14 text-right">
                                    {value !== null ? Math.round(value) : 'No data'}
                                </span>
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                <p className="text-sm text-[#8A8A8A]">
                    Metrics marked &ldquo;No data&rdquo; aren&apos;t in your score yet. Connect more sources to include them.
                </p>
                <Link
                    href="/dashboard/integrations"
                    className="shrink-0 inline-flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060D]"
                >
                    Manage data sources
                </Link>
            </div>
        </div>
    )
}
