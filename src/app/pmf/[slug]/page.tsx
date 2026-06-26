import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface PMFReport {
    score: number
    score_label: string
    company_name: string
    tagline?: string
    company_logo?: string
    ai_summary?: string
    benchmark_percentile?: number
    stage?: string
    industry?: string
    breakdown: {
        retention?: { score: number }
        revenueGrowth?: { score: number }
        nps?: { score: number }
        engagement?: { score: number }
        timeToValue?: { score: number }
        expansion?: { score: number }
        referral?: { score: number }
    }
    ai_insights?: string[]
    created_at: string
    viewed_count?: number
}

// Mock data for demo
const mockReport: PMFReport = {
    score: 72,
    score_label: 'Emerging PMF',
    company_name: 'TechStartup AI',
    tagline: 'AI-powered productivity for modern teams',
    ai_summary: 'TechStartup AI demonstrates strong emerging product-market fit with particularly impressive retention metrics and growing organic referral rates. The primary areas for improvement lie in time-to-value optimization and expansion revenue capture.',
    benchmark_percentile: 78,
    stage: 'Series A',
    industry: 'B2B SaaS',
    breakdown: {
        retention: { score: 82 },
        revenueGrowth: { score: 75 },
        nps: { score: 68 },
        engagement: { score: 74 },
        timeToValue: { score: 58 },
        expansion: { score: 65 },
        referral: { score: 71 }
    },
    ai_insights: [
        'Strong week-1 retention (78%) indicates solid initial value delivery',
        'NPS trending upward (+5 points in 90 days) suggests improving satisfaction',
        'Consider reducing onboarding friction to improve time-to-value score',
        'Enterprise segment shows 2.3x higher LTV - consider focus here'
    ],
    created_at: new Date().toISOString(),
    viewed_count: 127
}

function getScoreClass(score: number): string {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-gray-500'
}

function getScoreBgClass(score: number): string {
    if (score >= 80) return 'bg-green-500/10 text-green-500'
    if (score >= 60) return 'bg-blue-500/10 text-blue-500'
    if (score >= 40) return 'bg-amber-500/10 text-amber-500'
    return 'bg-gray-500/10 text-gray-500'
}

function getBarClass(score: number): string {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-red-500'
}

export default async function PublicPMFPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    // TODO: Fetch real report from Supabase
    // const supabase = await createClient()
    // const { data: report } = await supabase
    //   .from('pmf_reports')
    //   .select('*')
    //   .eq('public_slug', slug)
    //   .eq('is_public', true)
    //   .single()

    // For demo, use mock data
    const report = mockReport

    if (!report) {
        notFound()
    }

    const breakdownItems = [
        { key: 'retention', name: 'Retention Rate' },
        { key: 'revenueGrowth', name: 'Revenue Growth' },
        { key: 'nps', name: 'NPS / Satisfaction' },
        { key: 'engagement', name: 'Engagement Depth' },
        { key: 'timeToValue', name: 'Time-to-Value' },
        { key: 'expansion', name: 'Expansion Revenue' },
        { key: 'referral', name: 'Referral Rate' },
    ]

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Background glow */}
            <div className="fixed top-[-40%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-blue-500/[0.03] to-transparent pointer-events-none" />

            <div className="max-w-[900px] mx-auto px-8 py-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="text-[0.7rem] text-[#404040] uppercase tracking-[0.2em] mb-8">
                        PMF Report powered by <a href="/" className="text-[#606060] hover:text-white transition">Velodesk</a>
                    </div>
                    <h1 className="font-outfit text-[2.5rem] font-light mb-2">{report.company_name}</h1>
                    {report.tagline && (
                        <p className="text-[#606060] text-[1rem] font-light">{report.tagline}</p>
                    )}
                </div>

                {/* Score Hero */}
                <div className="flex flex-col items-center mb-16 p-16 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)] rounded-2xl">
                    <div className="text-[0.75rem] text-[#404040] uppercase tracking-[0.15em] mb-6">
                        Product-Market Fit Score
                    </div>
                    <div className={`font-outfit text-[8rem] font-extralight leading-none mb-4 ${getScoreClass(report.score)}`}>
                        {report.score}
                    </div>
                    <div className={`text-[1rem] font-normal px-6 py-2 rounded-full mb-8 ${getScoreBgClass(report.score)}`}>
                        {report.score_label}
                    </div>
                    {report.benchmark_percentile && (
                        <p className="text-[0.85rem] text-[#606060]">
                            Outperforming <strong className="text-white">{report.benchmark_percentile}%</strong> of {report.stage || 'similar'} startups in {report.industry || 'this sector'}
                        </p>
                    )}
                </div>

                {/* AI Summary */}
                {report.ai_summary && (
                    <div className="bg-gradient-to-br from-blue-500/[0.05] to-purple-500/[0.05] border border-blue-500/10 rounded-xl p-8 mb-12">
                        <div className="flex items-center gap-2 text-[0.7rem] text-blue-400 uppercase tracking-[0.1em] mb-4">
                            <span>✨</span> AI Executive Summary
                        </div>
                        <p className="text-[1.1rem] font-light leading-relaxed text-white/90">
                            {report.ai_summary}
                        </p>
                    </div>
                )}

                {/* Breakdown Grid */}
                <h2 className="font-outfit text-[1.25rem] font-light text-[#606060] mb-6">Score Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                    {breakdownItems.map((item) => {
                        const data = report.breakdown[item.key as keyof typeof report.breakdown]
                        const score = data?.score || 0
                        return (
                            <div key={item.key} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[0.85rem] text-[#606060]">{item.name}</span>
                                    <span className="text-[1.25rem] font-medium">{score}</span>
                                </div>
                                <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded overflow-hidden">
                                    <div
                                        className={`h-full rounded transition-all ${getBarClass(score)}`}
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* AI Insights */}
                {report.ai_insights && report.ai_insights.length > 0 && (
                    <>
                        <h2 className="font-outfit text-[1.25rem] font-light text-[#606060] mb-6">AI Insights</h2>
                        <ul className="mb-12">
                            {report.ai_insights.map((insight, i) => (
                                <li key={i} className="flex gap-4 py-4 border-b border-[rgba(255,255,255,0.04)]">
                                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-400">
                                        {i + 1}
                                    </div>
                                    <p className="text-[0.95rem] text-white/80 leading-relaxed">{insight}</p>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {/* Footer */}
                <div className="text-center pt-12 border-t border-[rgba(255,255,255,0.04)]">
                    <div className="inline-flex items-center gap-2 text-[0.75rem] text-[#404040] mb-4">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[0.6rem] text-black">✓</span>
                        Velodesk Verified
                    </div>
                    <p className="text-[0.75rem] text-[#404040]">
                        Generated {new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {report.viewed_count ? ` • Viewed ${report.viewed_count} times` : ''}
                    </p>
                </div>
            </div>
        </div>
    )
}
