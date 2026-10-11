'use client'

import Link from 'next/link'
import { Gauge, ListChecks, CircleDashed, Plug, Target, Presentation, FileSpreadsheet, Lock } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'
import IntegrationLogo from './IntegrationLogo'
import { LIVE_INTEGRATIONS } from './liveIntegrations'
import { SIGNALS, bandFor } from './pmfModel'
import { PRIMARY_CTA } from './ctaStyles'

/** Sample values only. Referral has no data, so it is left out of the score, exactly as the live dashboard does. */
const SAMPLE_SCORE = 68
const SAMPLE_VALUES: Record<string, number | null> = {
  retention: 74,
  revenueGrowth: 71,
  nps: 62,
  engagement: 66,
  timeToValue: 58,
  expansion: 64,
  referral: null,
}
const SAMPLE_SOURCES = ['paystack', 'mixpanel', 'intercom']

/** Same labels as the live dashboard (src/app/dashboard/page.tsx). */
const DASH_LABELS: Record<string, string> = {
  retention: 'Retention',
  revenueGrowth: 'Revenue growth',
  nps: 'NPS',
  engagement: 'Engagement',
  timeToValue: 'Time to value',
  expansion: 'Expansion',
  referral: 'Referral',
}

const FEATURES = [
  {
    icon: Gauge,
    title: 'Your score at a glance',
    text: 'Your PMF Score, the band it sits in and the date it last updated, at the top of the screen.',
  },
  {
    icon: ListChecks,
    title: 'The signals behind it',
    text: 'A bar for each of the seven signals, so you can see which one is pulling your score down.',
  },
  {
    icon: CircleDashed,
    title: 'Gaps shown, never guessed',
    text: 'A signal with no connected data reads "No data" and is left out of the score. Self-reported numbers get a label.',
  },
  {
    icon: Plug,
    title: 'Your data sources in one place',
    text: 'Connect a tool, check it is connected, or disconnect it, without leaving the dashboard.',
  },
]

const BENEFITS = [
  { icon: Target, title: 'Know what to fix next', text: 'Your weakest signal is the clearest place to start.' },
  { icon: Presentation, title: 'One number for investors', text: 'Explain traction with a score and the data behind it.' },
  { icon: FileSpreadsheet, title: 'No spreadsheet to maintain', text: 'Numbers come from your tools, not copy and paste.' },
]

function Marker({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#7B61FF] to-[#38BDF8] font-dm-mono text-[11px] font-medium text-white shadow-[0_0_0_4px_rgba(4,6,13,0.9)] ${className}`}
    >
      {n}
    </span>
  )
}

export default function DashboardFeature() {
  const { ref, isVisible } = useScrollReveal(0.1)
  const band = bandFor(SAMPLE_SCORE)
  const used = SIGNALS.filter((s) => SAMPLE_VALUES[s.key] !== null).length
  const sources = SAMPLE_SOURCES.map((id) => LIVE_INTEGRATIONS.find((i) => i.id === id)).filter(
    (i): i is (typeof LIVE_INTEGRATIONS)[number] => Boolean(i),
  )

  return (
    <section
      id="dashboard"
      ref={ref}
      aria-labelledby="dashboard-heading"
      className={`relative overflow-hidden border-t border-white/5 bg-[#04060D] py-24 text-white transition-all duration-1000 motion-reduce:transition-none ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-[#7B61FF]/10 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#38BDF8]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 font-dm-mono text-[11px] uppercase tracking-widest text-white/70">
            The dashboard
          </span>
          <h2 id="dashboard-heading" className="mb-6 text-4xl font-medium leading-[1.1] tracking-tight md:text-6xl">
            Your score,{' '}
            <span className="bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text font-instrument font-normal italic text-transparent">
              and exactly what&apos;s behind it.
            </span>
          </h2>
          <p className="text-lg font-light leading-relaxed text-white/70">
            Log in and see where you stand in seconds. Every number on the screen comes from a tool you connected.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
          {/* Sample of the real dashboard screen */}
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7B61FF]/25 to-[#38BDF8]/20 opacity-40 blur-3xl" />

            <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#090A10] shadow-2xl">
              <div className="flex items-center gap-3 border-b border-white/5 bg-[#0E1018] px-4 py-3">
                <div aria-hidden="true" className="flex shrink-0 gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
                <div className="flex w-full min-w-0 max-w-sm items-center gap-2 rounded bg-white/5 px-3 py-1 font-dm-mono text-[11px] text-white/70">
                  <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">velodesk.crelligent.com/dashboard</span>
                </div>
                <span className="ml-auto shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-dm-mono text-[10px] uppercase tracking-wider text-white/75">
                  Sample data
                </span>
              </div>

              <div className="space-y-4 p-4 sm:p-6">
                {/* Score + breakdown */}
                <div className="relative flex flex-col gap-6 rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent p-5 md:flex-row">
                  <div className="relative flex min-w-[140px] flex-col items-center justify-center border-white/5 md:border-r md:pr-8">
                    <Marker n={1} className="-left-2 -top-2 md:-left-3" />
                    <div className="mb-1 text-[10px] uppercase tracking-widest text-white/55">PMF Score</div>
                    <div className="bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] bg-clip-text text-5xl font-light tabular-nums tracking-tighter text-transparent">
                      {SAMPLE_SCORE}
                    </div>
                    <div className="mt-1 text-[12px] text-white/85">{band.label}</div>
                    <div className="mt-1 text-[10px] text-white/55">
                      Based on {used} of {SIGNALS.length} signals
                    </div>
                    <div className="mt-2 text-[10px] text-white/55">Updated 10 Oct 2026</div>
                  </div>

                  <div className="relative flex-1">
                    <Marker n={2} className="left-0 -top-7" />
                    <dl className="grid grid-cols-1 content-center gap-y-3">
                      {SIGNALS.map((s) => {
                        const v = SAMPLE_VALUES[s.key]
                        return (
                          <div key={s.key} className="relative flex items-center justify-between gap-3 text-[11px]">
                            <dt className="w-24 shrink-0 text-white/60 sm:w-28">{DASH_LABELS[s.key] ?? s.label}</dt>
                            <dd className="flex flex-1 items-center gap-3">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
                                {v !== null ? (
                                  <div className="h-full rounded-full bg-gradient-to-r from-[#7B61FF]/80 to-[#38BDF8]/80" style={{ width: `${v}%` }} />
                                ) : (
                                  <div className="h-full w-full rounded-full border border-dashed border-white/15" />
                                )}
                              </div>
                              <span className={`w-14 text-right tabular-nums ${v !== null ? 'text-white/85' : 'text-amber-200/80'}`}>
                                {v !== null ? v : 'No data'}
                              </span>
                            </dd>
                            {v === null && <Marker n={3} className="-right-1 -top-7" />}
                          </div>
                        )
                      })}
                    </dl>
                  </div>
                </div>

                {/* Data sources */}
                <div className="relative flex flex-col gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Marker n={4} className="-left-2 -top-2" />
                  <div className="flex flex-wrap items-center gap-2">
                    {sources.map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2.5 text-[11px] text-white/80">
                        <IntegrationLogo integration={s} className="h-6 w-6 !rounded-md !p-1 !shadow-none" decorative />
                        {s.name}
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" aria-hidden="true" />
                      </span>
                    ))}
                    <span className="text-[11px] text-white/50">Connected</span>
                  </div>
                  <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-[12px] text-white/90">
                    Manage data sources
                  </span>
                </div>
              </div>
              <figcaption className="sr-only">
                A sample Velodesk dashboard: PMF Score {SAMPLE_SCORE} ({band.label}), a bar for each signal, Referral marked No data, and three connected tools.
              </figcaption>
            </figure>
          </div>

          {/* What each numbered part does */}
          <ol className="space-y-3">
            {FEATURES.map((f, i) => (
              <li key={f.title} className="flex gap-4 rounded-2xl border border-white/10 bg-[#090A10] p-5 transition hover:border-[#7B61FF]/40">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7B61FF] to-[#38BDF8] font-dm-mono text-[11px] font-medium text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="mb-1 flex items-center gap-2 text-base font-medium text-white">
                    <f.icon className="h-4 w-4 text-[#A5B4FC]" strokeWidth={1.75} aria-hidden="true" />
                    {f.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-white/70">{f.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Benefits */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7B61FF]/20 to-[#38BDF8]/20">
                <b.icon className="h-5 w-5 text-[#A5B4FC]" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="mb-1 text-lg font-light text-white">{b.title}</h3>
              <p className="text-sm font-light leading-relaxed text-white/65">{b.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/signup" className={`${PRIMARY_CTA} px-7 py-3 text-sm`}>
            Start free trial
          </Link>
        </div>
      </div>
    </section>
  )
}
