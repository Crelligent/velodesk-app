import Link from 'next/link'
import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_EMAILS } from '@/lib/demo'
import { getProgrammeBenchmark, MIN_BENCHMARK_COMPANIES, type ProgrammeBenchmark, type ScoreBenchmark } from '@/lib/benchmark'
import SampleBenchmarks from './SampleBenchmarks'

export const metadata = { title: 'Benchmarks | Velodesk' }

// Shown only to shared demo accounts, labelled as sample data.
const DEMO_PROGRAMME: ProgrammeBenchmark = {
    programme: 'hubspot',
    programmeName: 'HubSpot for Startups',
    pmf: { distribution: { companies: 38, median: 54, p25: 41, p75: 66 }, companies: 38, yours: 69, aheadOf: 82 },
    gtm: { distribution: { companies: 31, median: 49, p25: 36, p75: 61 }, companies: 31, yours: 66, aheadOf: 84 },
    included: true,
}

function ScoreRange({ title, b }: { title: string; b: ScoreBenchmark }) {
    const d = b.distribution
    return (
        <div className="p-5 bg-surface-2 border border-border rounded-lg flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-wide text-text-muted">{title}</h3>
            {!d ? (
                <p className="text-sm text-text-muted">
                    {b.companies} of {MIN_BENCHMARK_COMPANIES} companies have a recent score so far. The comparison appears once {MIN_BENCHMARK_COMPANIES} do, so no single company&apos;s score can be identified.
                </p>
            ) : (
                <>
                    <div>
                        {b.yours !== null && b.aheadOf !== null ? (
                            <p className="text-2xl font-display font-light text-text">
                                Ahead of <span className="tabular-nums">{b.aheadOf}%</span>
                                <span className="block text-sm text-text-muted mt-1">of {d.companies - 1} other companies in the programme</span>
                            </p>
                        ) : (
                            <p className="text-sm text-text-muted">You don&apos;t have a recent score yet. Here&apos;s how the programme looks.</p>
                        )}
                    </div>
                    {/* Range bar: middle half of companies (25th–75th percentile), median and you */}
                    <div aria-hidden="true" className="relative h-8">
                        <div className="absolute top-3.5 left-0 right-0 h-1 bg-border-strong rounded-full" />
                        <div className="absolute top-2.5 h-3 bg-accent/30 rounded-sm" style={{ left: `${d.p25}%`, width: `${Math.max(1, d.p75 - d.p25)}%` }} />
                        <div className="absolute top-1.5 h-5 w-0.5 bg-text-muted" style={{ left: `${d.median}%` }} />
                        {b.yours !== null && <div className="absolute top-1 h-6 w-1.5 -ml-0.5 bg-accent rounded-sm" style={{ left: `${b.yours}%` }} />}
                    </div>
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div><dt className="text-xs text-text-muted">You</dt><dd className="tabular-nums text-text">{b.yours ?? '—'}</dd></div>
                        <div><dt className="text-xs text-text-muted">Median</dt><dd className="tabular-nums text-text">{d.median}</dd></div>
                        <div><dt className="text-xs text-text-muted">Middle half</dt><dd className="tabular-nums text-text">{d.p25}–{d.p75}</dd></div>
                        <div><dt className="text-xs text-text-muted">Companies</dt><dd className="tabular-nums text-text">{d.companies}</dd></div>
                    </dl>
                </>
            )}
        </div>
    )
}

function ProgrammePanel({ data, sample }: { data: ProgrammeBenchmark; sample?: boolean }) {
    return (
        <section aria-labelledby="programme-heading" className="p-5 bg-surface border border-border rounded-lg flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <Users size={16} className="text-accent" aria-hidden="true" />
                <h2 id="programme-heading" className="text-lg font-display font-light text-text">Your programme: {data.programmeName}</h2>
                {sample && <span className="text-xs text-text-muted px-2 py-0.5 border border-border-strong rounded-md">Sample data</span>}
            </div>
            <p className="text-sm text-text-muted max-w-prose">
                How your scores compare with other companies that joined Velodesk through {data.programmeName} and chose to take part, from their latest scores in the last 90 days. Only combined figures are shown; no other company is named or identifiable.
            </p>
            {!data.included && (
                <p className="text-sm text-text-muted">
                    Your own scores aren&apos;t part of the comparison other founders see. To take part, turn on the benchmark under <Link href="/dashboard/settings" className="text-accent hover:underline">Settings → Privacy</Link>.
                </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreRange title="PMF Score" b={data.pmf} />
                <ScoreRange title="Go-to-Market Score" b={data.gtm} />
            </div>
        </section>
    )
}

export default async function BenchmarksPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isDemo = DEMO_EMAILS.has((user?.email || '').toLowerCase())

    let programme: ProgrammeBenchmark | null = null
    let failed = false
    if (user && !isDemo) {
        try {
            programme = await getProgrammeBenchmark(createAdminClient(), user.id)
        } catch (error) {
            console.error('Programme benchmark failed:', error)
            failed = true
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-24 flex flex-col gap-8">
            {isDemo ? <ProgrammePanel data={DEMO_PROGRAMME} sample />
                : programme ? <ProgrammePanel data={programme} />
                    : failed ? (
                        <p className="p-5 bg-surface border border-border rounded-lg text-sm text-text-muted">
                            We couldn&apos;t load your programme benchmark just now. Refresh the page to try again.
                        </p>
                    ) : null}
            <SampleBenchmarks />
        </div>
    )
}
