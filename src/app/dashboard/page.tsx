import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plug, RefreshCw, TrendingUp, TrendingDown, Lightbulb, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { DEMO_EMAILS } from '@/lib/demo'
import { INTEGRATIONS } from '@/lib/integrations'
import { DEMO_KPIS, DEMO_RETENTION, DEMO_SIGNALS, DEMO_ACTIONS, DEMO_GTM } from '@/lib/demo-overview'
import { GtmPanel, type GtmPanelData } from '@/components/dashboard/GtmPanel'

// This page used to render hard-coded figures (PMF Score 84, MRR ₦142.5M/$142,500, NRR, CAC,
// users, economics, TAM, competitors and a mock signal feed) to every user. Those were removed:
// only data read from the user's own rows is shown. MRR / retention cards and the signal feed
// should come back once there is a real data source for them (e.g. pmf_scores.inputs.revenue).

type BreakdownValue = number | { score: number | null; source?: string | null } | null

// Shape of a pmf_scores row (same data the /api/pmf/calculate response is built from).
interface ScoreRow {
    score: number
    insights?: unknown
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


function Sparkline({ values, good }: { values: number[]; good: boolean }) {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 24}`).join(' ')
    return (
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-8" aria-hidden="true">
            <polyline points={pts} fill="none" stroke={good ? '#34D399' : '#FBBF24'} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    )
}

function ScoreTrend({ rows }: { rows: { score: number; calculated_at: string }[] }) {
    const w = 600, h = 160, pad = 28
    const xs = (i: number) => pad + (i / Math.max(1, rows.length - 1)) * (w - pad * 2)
    const ys = (v: number) => h - pad - (v / 100) * (h - pad * 2)
    const line = rows.map((r, i) => `${xs(i)},${ys(r.score)}`).join(' ')
    const area = `${xs(0)},${h - pad} ${line} ${xs(rows.length - 1)},${h - pad}`
    const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40" role="img" aria-label={`PMF Score over time: ${rows.map(r => r.score).join(', ')}`}>
            <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7B61FF" stopOpacity="0" />
                </linearGradient>
            </defs>
            {[40, 60, 80].map(g => (
                <g key={g}>
                    <line x1={pad} x2={w - pad} y1={ys(g)} y2={ys(g)} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                    <text x={w - pad + 4} y={ys(g) + 3} fontSize="9" fill="#606060">{g}</text>
                </g>
            ))}
            <polygon points={area} fill="url(#trendFill)" />
            <polyline points={line} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinejoin="round" />
            {rows.map((r, i) => (
                <g key={r.calculated_at}>
                    <circle cx={xs(i)} cy={ys(r.score)} r="4" fill="#04060D" stroke="#38BDF8" strokeWidth="2" />
                    <text x={xs(i)} y={ys(r.score) - 10} fontSize="11" fill="#E5E7EB" textAnchor="middle">{r.score}</text>
                    <text x={xs(i)} y={h - 8} fontSize="9" fill="#808080" textAnchor="middle">{fmt(r.calculated_at)}</text>
                </g>
            ))}
        </svg>
    )
}

function syncedAgo(iso: string | null): string {
    if (!iso) return 'Waiting for first sync'
    const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
    if (mins < 60) return `Synced ${mins} min ago`
    const hours = Math.round(mins / 60)
    if (hours < 48) return `Synced ${hours} h ago`
    return `Synced ${Math.round(hours / 24)} days ago`
}

const card = 'bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-xl'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let latestScore: ScoreRow | null = null
    let history: { score: number; calculated_at: string }[] = []
    let sources: { provider: string; last_sync_at: string | null }[] = []
    let connectedCount = 0
    let gtm: GtmPanelData | null = null
    const isDemo = DEMO_EMAILS.has((user?.email || '').toLowerCase())

    if (user) {
        const [{ data: scoreRows }, { data: tokenRows }, { data: gtmRows }] = await Promise.all([
            supabase
                .from('pmf_scores')
                .select('*')
                .eq('user_id', user.id)
                .order('calculated_at', { ascending: false })
                .limit(6),
            supabase
                .from('integration_tokens')
                .select('provider, last_sync_at')
                .eq('user_id', user.id)
                .eq('status', 'connected'),
            supabase
                .from('gtm_scores')
                .select('score, components, calculated_at')
                .eq('user_id', user.id)
                .order('calculated_at', { ascending: false })
                .limit(2),
        ])
        if (isDemo) {
            const h = DEMO_GTM.history
            gtm = { score: DEMO_GTM.score, change: h[h.length - 1] - h[h.length - 2], calculatedAt: null, components: DEMO_GTM.components }
        } else if (gtmRows && gtmRows.length > 0) {
            const [latest, prev] = gtmRows
            gtm = {
                score: Number(latest.score),
                change: prev ? Math.round(Number(latest.score)) - Math.round(Number(prev.score)) : null,
                calculatedAt: latest.calculated_at as string,
                components: (latest.components ?? {}) as GtmPanelData['components'],
            }
        }
        const row = scoreRows?.[0]
        if (row && typeof row.score === 'number') latestScore = row as ScoreRow
        history = (scoreRows ?? [])
            .filter(r => typeof r.score === 'number')
            .map(r => ({ score: Math.round(r.score as number), calculated_at: r.calculated_at as string }))
            .reverse()
        sources = (tokenRows ?? []) as { provider: string; last_sync_at: string | null }[]
        connectedCount = sources.length
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
    const insights = Array.isArray(latestScore.insights)
        ? (latestScore.insights as unknown[]).filter((i): i is string => typeof i === 'string')
        : []
    const previous = history.length > 1 ? history[history.length - 2].score : null
    const change = previous !== null ? Math.round(latestScore.score) - previous : null

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
                    {change !== null && change !== 0 && (
                        <div className={`text-[10px] mt-1 ${change > 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                            {change > 0 ? '+' : ''}{change} since last score
                        </div>
                    )}
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

            <GtmPanel data={gtm} sample={isDemo} />

            {isDemo && (
                <section aria-labelledby="kpi-heading" className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <h2 id="kpi-heading" className="text-[10px] uppercase tracking-widest text-[#8A8A8A]">Business metrics</h2>
                        <span className="text-[10px] text-[#8A8A8A] px-2 py-0.5 border border-white/10 rounded">Sample data</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {DEMO_KPIS.map(k => (
                            <div key={k.label} className={`${card} p-4`}>
                                <div className="text-[11px] text-[#8A8A8A]">{k.label}</div>
                                <div className="flex items-end justify-between gap-3 mt-1">
                                    <div className="text-2xl font-light text-white tabular-nums">{k.value}</div>
                                    <div className={`flex items-center gap-1 text-[11px] ${k.good ? 'text-emerald-400' : 'text-amber-300'}`}>
                                        {k.trend === 'up' ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
                                        {k.delta}
                                    </div>
                                </div>
                                <div className="mt-2"><Sparkline values={k.spark} good={k.good} /></div>
                                <div className="text-[10px] text-[#606060] mt-1">{k.hint}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {history.length > 1 && (
                    <section aria-labelledby="trend-heading" className={`${card} p-5 lg:col-span-2`}>
                        <h2 id="trend-heading" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] mb-2">PMF Score over time</h2>
                        <ScoreTrend rows={history} />
                    </section>
                )}
                {insights.length > 0 && (
                    <section aria-labelledby="insights-heading" className={`${card} p-5 ${history.length > 1 ? '' : 'lg:col-span-3'}`}>
                        <h2 id="insights-heading" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] mb-3">What&apos;s driving your score</h2>
                        <ul className="space-y-3">
                            {insights.map(text => (
                                <li key={text} className="flex gap-2 text-[12px] text-gray-300 leading-relaxed">
                                    <Lightbulb size={14} className="text-[#7B61FF] shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>

            {isDemo && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <section aria-labelledby="cohort-heading" className={`${card} p-5`}>
                        <div className="flex items-center gap-3 mb-3">
                            <h2 id="cohort-heading" className="text-[10px] uppercase tracking-widest text-[#8A8A8A]">{DEMO_RETENTION.label}</h2>
                        </div>
                        <div className="space-y-2">
                            {DEMO_RETENTION.cohorts.map(c => (
                                <div key={c.month} className="flex items-center gap-3 text-[11px]">
                                    <span className="w-8 text-[#8A8A8A]">{c.month}</span>
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden" aria-hidden="true">
                                        <div className="h-full bg-gradient-to-r from-[#7B61FF]/80 to-[#38BDF8]/80 rounded-full" style={{ width: `${c.value}%` }} />
                                    </div>
                                    <span className="w-9 text-right text-gray-300 tabular-nums">{c.value}%</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-[#606060] mt-3">Sample data. Each newer cohort keeps more users.</p>
                    </section>
                    <section aria-labelledby="signals-heading" className={`${card} p-5 lg:col-span-2`}>
                        <div className="flex items-center gap-3 mb-3">
                            <h2 id="signals-heading" className="text-[10px] uppercase tracking-widest text-[#8A8A8A]">Signal feed</h2>
                            <span className="text-[10px] text-[#8A8A8A] px-2 py-0.5 border border-white/10 rounded">Sample data</span>
                        </div>
                        <ul className="divide-y divide-white/5">
                            {DEMO_SIGNALS.map(sig => (
                                <li key={sig.title} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                                    {sig.tone === 'positive'
                                        ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                                        : <AlertTriangle size={16} className="text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />}
                                    <div className="flex-1">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <span className="text-[13px] text-white/90">{sig.title}</span>
                                            <span className="text-[10px] text-[#606060] shrink-0">{sig.when}</span>
                                        </div>
                                        <p className="text-[11px] text-[#8A8A8A] mt-0.5 leading-relaxed">{sig.detail}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {isDemo && (
                    <section aria-labelledby="actions-heading" className={`${card} p-5 lg:col-span-2`}>
                        <h2 id="actions-heading" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] mb-3">Recommended next steps</h2>
                        <ol className="space-y-3">
                            {DEMO_ACTIONS.map((a, i) => (
                                <li key={a} className="flex gap-3 text-[12px] text-gray-300 leading-relaxed">
                                    <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                                    <span>{a}</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}
                {sources.length > 0 && (
                    <section aria-labelledby="sources-heading" className={`${card} p-5 ${isDemo ? '' : 'lg:col-span-3'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 id="sources-heading" className="text-[10px] uppercase tracking-widest text-[#8A8A8A]">Connected sources</h2>
                            <span className="text-[10px] text-emerald-400">{sources.length} live</span>
                        </div>
                        <ul className="space-y-2">
                            {sources.map(src => {
                                const meta = INTEGRATIONS.find(i => i.id === src.provider)
                                return (
                                    <li key={src.provider} className="flex items-center justify-between text-[12px]">
                                        <span className="flex items-center gap-2 text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                                            {meta?.name ?? src.provider}
                                        </span>
                                        <span className="text-[10px] text-[#606060]">{syncedAgo(src.last_sync_at)}</span>
                                    </li>
                                )
                            })}
                        </ul>
                        <Link href="/dashboard/integrations" className="mt-4 inline-flex items-center gap-1 text-[11px] text-[#38BDF8] hover:text-white transition">
                            Manage sources <ArrowRight size={12} aria-hidden="true" />
                        </Link>
                    </section>
                )}
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
