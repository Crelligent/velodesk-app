import { Building2, ShieldCheck, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DEMO_EMAILS } from '@/lib/demo'
import { getScoreLabel } from '@/lib/pmf-score'
import { gtmScoreLabel } from '@/lib/gtm-score'
import SamplePortfolio from './SamplePortfolio'

/**
 * Investor portfolio. Demo accounts see the labelled sample portfolio. Everyone else sees
 * only companies whose founders shared their scores with this email (investor_access);
 * row-level security enforces that on investor_access, pmf_scores and gtm_scores.
 */

interface Company {
    founderId: string
    name: string
    industry: string | null
    sharedAt: string
    pmf: number | null
    pmfChange: number | null
    gtm: number | null
    gtmChange: number | null
    updatedAt: string | null
}

function latestTwo(rows: { user_id: string; score: number; calculated_at: string }[], id: string) {
    const mine = rows.filter(r => r.user_id === id)
    const [a, b] = mine
    return {
        score: a ? Math.round(Number(a.score)) : null,
        change: a && b ? Math.round(Number(a.score)) - Math.round(Number(b.score)) : null,
        at: a?.calculated_at ?? null,
    }
}

function Change({ value }: { value: number | null }) {
    if (value === null) return null
    const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus
    const tone = value > 0 ? 'text-accent' : value < 0 ? 'text-warning' : 'text-text-muted'
    return (
        <span className={`inline-flex items-center gap-1 text-xs ${tone}`}>
            <Icon size={12} aria-hidden="true" />
            {value > 0 ? '+' : ''}{value}
        </span>
    )
}

function ScoreCell({ score, change, label }: { score: number | null; change: number | null; label: (n: number) => string }) {
    if (score === null) return <span className="text-sm text-text-muted">Not enough data yet</span>
    return (
        <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-display font-light tabular-nums text-text">{score}</span>
                <Change value={change} />
            </div>
            <span className="text-xs text-text-muted">{label(score)}</span>
        </div>
    )
}

export default async function InvestorDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const email = (user?.email || '').toLowerCase()
    if (DEMO_EMAILS.has(email)) return <SamplePortfolio />

    const { data: access, error } = await supabase
        .from('investor_access')
        .select('founder_id, company_name, industry, created_at')
        .eq('investor_email', email)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    const ids = (access ?? []).map(a => a.founder_id as string)
    const [{ data: pmfRows }, { data: gtmRows }] = ids.length > 0
        ? await Promise.all([
            supabase.from('pmf_scores').select('user_id, score, calculated_at').in('user_id', ids).order('calculated_at', { ascending: false }).limit(500),
            supabase.from('gtm_scores').select('user_id, score, calculated_at').in('user_id', ids).order('calculated_at', { ascending: false }).limit(500),
        ])
        : [{ data: [] }, { data: [] }]

    const companies: Company[] = (access ?? []).map(a => {
        const p = latestTwo((pmfRows ?? []) as never[], a.founder_id)
        const g = latestTwo((gtmRows ?? []) as never[], a.founder_id)
        return {
            founderId: a.founder_id,
            name: a.company_name || 'Unnamed company',
            industry: a.industry,
            sharedAt: a.created_at,
            pmf: p.score, pmfChange: p.change,
            gtm: g.score, gtmChange: g.change,
            updatedAt: [p.at, g.at].filter(Boolean).sort().pop() ?? null,
        }
    })
    const scored = companies.filter(c => c.pmf !== null)
    const avg = (xs: number[]) => xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : null
    const avgPmf = avg(scored.map(c => c.pmf!))
    const avgGtm = avg(companies.filter(c => c.gtm !== null).map(c => c.gtm!))

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="font-display text-3xl font-extralight text-text mb-2">Portfolio</h1>
                <p className="text-sm text-text-muted max-w-prose">
                    PMF Score (is the product working?) and Go-to-Market Score (is the selling working?) for every company that has shared its scores with you, calculated from each company&apos;s own connected data.
                </p>
            </header>

            {error ? (
                <div className="p-6 bg-surface border border-border rounded-lg text-sm text-text-muted">
                    We couldn&apos;t load your portfolio just now. Refresh the page to try again.
                </div>
            ) : companies.length === 0 ? (
                <div className="p-8 bg-surface border border-border rounded-lg flex flex-col items-center text-center gap-3">
                    <ShieldCheck size={22} className="text-text-muted" aria-hidden="true" />
                    <h2 className="text-lg font-display font-light text-text">No companies have shared their scores with you yet</h2>
                    <p className="text-sm text-text-muted max-w-prose">
                        Founders share from their own Velodesk account under Investor Access, using your email address ({email}). Each company appears here as soon as they do, and they can withdraw access at any time.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Companies sharing', value: String(companies.length), icon: Building2 },
                            { label: 'Average PMF Score', value: avgPmf === null ? '—' : String(avgPmf), icon: TrendingUp },
                            { label: 'Average Go-to-Market', value: avgGtm === null ? '—' : String(avgGtm), icon: TrendingUp },
                        ].map(k => (
                            <div key={k.label} className="p-5 bg-surface border border-border rounded-lg">
                                <div className="flex items-center gap-2 text-text-muted mb-3">
                                    <k.icon size={14} aria-hidden="true" />
                                    <span className="text-xs uppercase tracking-wide">{k.label}</span>
                                </div>
                                <div className="text-3xl font-display font-light tabular-nums text-text">{k.value}</div>
                            </div>
                        ))}
                    </div>

                    <section aria-labelledby="companies-heading" className="bg-surface border border-border rounded-lg">
                        <h2 id="companies-heading" className="px-5 pt-5 pb-3 text-xs uppercase tracking-wide text-text-muted">Companies</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[560px]">
                                <thead className="sticky top-0 bg-surface">
                                    <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                                        <th scope="col" className="py-3 px-5 font-medium">Company</th>
                                        <th scope="col" className="py-3 px-5 font-medium text-right">PMF Score</th>
                                        <th scope="col" className="py-3 px-5 font-medium text-right">Go-to-Market</th>
                                        <th scope="col" className="py-3 px-5 font-medium text-right">Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {companies.map(c => (
                                        <tr key={c.founderId} className="hover:bg-surface-2 transition-colors">
                                            <td className="py-4 px-5">
                                                <div className="text-text">{c.name}</div>
                                                {c.industry && <div className="text-xs text-text-muted">{c.industry}</div>}
                                            </td>
                                            <td className="py-4 px-5 text-right"><ScoreCell score={c.pmf} change={c.pmfChange} label={getScoreLabel} /></td>
                                            <td className="py-4 px-5 text-right"><ScoreCell score={c.gtm} change={c.gtmChange} label={gtmScoreLabel} /></td>
                                            <td className="py-4 px-5 text-right text-text-muted text-xs">
                                                {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <p className="text-xs text-text-muted">
                        Scores update as each company&apos;s data syncs. A company without enough CRM data shows no Go-to-Market Score rather than an estimate.
                    </p>
                </>
            )}
        </div>
    )
}
