'use client'
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import {
  Sparkles,
  MessageSquareText,
  Search,
  Quote,
  ShieldCheck,
  Radar,
  Lightbulb,
  FileText,
  FlaskConical,
  Eye,
  UserCheck,
  CheckCircle2,
  ArrowUp,
} from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'
import { PRIMARY_CTA } from './ctaStyles'

/**
 * Status labels shown on the homepage. Keep these honest:
 * set ASSISTANT_STATUS to 'Live' once Velodesk AI is switched on in production,
 * and only move an agent capability out of "Coming next" when it ships.
 */
const ASSISTANT_STATUS: 'Live' | 'Rolling out' = 'Rolling out'
const AGENTS_STATUS = 'Coming next'

const ASSISTANT = [
  { icon: MessageSquareText, title: 'Ask in plain English', text: '"Why did my score drop?" "Which signal should I fix first?"' },
  { icon: Search, title: 'It looks things up itself', text: 'It checks your score history, signals and connected tools before it answers.' },
  { icon: Quote, title: 'Shows its sources', text: 'Every number in an answer says where it came from. No made-up figures.' },
  { icon: ShieldCheck, title: 'Read-only', text: 'It can read your Velodesk data. It cannot change it or touch your tools.' },
]

const AGENTS = [
  { icon: Radar, title: 'Watches your signals', text: 'Checks your score every day and tells you when something moves.' },
  { icon: Lightbulb, title: 'Explains what changed', text: 'Looks across payments, usage and support to find the likely cause.' },
  { icon: FileText, title: 'Drafts your investor update', text: 'Writes the monthly update from your real numbers, for you to edit and send.' },
  { icon: FlaskConical, title: 'Suggests and tracks experiments', text: 'Proposes one fix, then reports whether it moved the score.' },
]

const RULES = [
  { icon: Eye, text: 'Read-only access to your data' },
  { icon: UserCheck, text: 'Nothing is sent without your approval' },
  { icon: CheckCircle2, text: 'Every claim shows the data behind it' },
]

function StatusPill({ label, tone }: { label: string; tone: 'live' | 'soon' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-dm-mono text-[10px] uppercase tracking-wider ${
        tone === 'live' ? 'border-[#34D399]/30 bg-[#34D399]/10 text-[#6EE7B7]' : 'border-white/15 bg-white/5 text-white/70'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone === 'live' ? 'bg-[#34D399]' : 'bg-white/40'}`} aria-hidden="true" />
      {label}
    </span>
  )
}

export default function VelodeskAI() {
  const { ref, isVisible } = useScrollReveal(0.1)

  return (
    <section
      id="velodesk-ai"
      ref={ref}
      aria-labelledby="velodesk-ai-heading"
      className={`relative overflow-hidden border-t border-white/5 bg-[#04060D] py-24 text-white transition-all duration-1000 motion-reduce:transition-none ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-24 h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-[#7B61FF]/10 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7B61FF]/30 bg-[#7B61FF]/10 px-3 py-1 font-dm-mono text-[11px] uppercase tracking-widest text-[#C4B5FD]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Velodesk AI
          </span>
          <h2 id="velodesk-ai-heading" className="mb-6 text-4xl font-medium leading-[1.1] tracking-tight md:text-6xl">
            An analyst that already{' '}
            <span className="bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text font-instrument font-normal italic text-transparent">
              knows your numbers.
            </span>
          </h2>
          <p className="text-lg font-light leading-relaxed text-white/70">
            Ask about your PMF Score in plain English. Velodesk AI looks up your own data, explains it, and shows where every number came from. Built on Claude by Anthropic.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
          {/* Sample conversation */}
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7B61FF]/25 to-[#38BDF8]/20 opacity-40 blur-3xl" />
            <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0C14] shadow-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7B61FF] to-[#38BDF8]">
                    <img src="/icon.png" alt="" className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium">Velodesk AI</span>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-dm-mono text-[10px] uppercase tracking-wider text-white/75">
                  Sample conversation
                </span>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#6A4FF0]/90 px-4 py-2.5 text-[13px] leading-relaxed text-white">
                  Why did my PMF Score drop this month?
                </div>

                <div className="space-y-1.5 font-dm-mono text-[11px] text-white/55">
                  {['Checked your PMF Score history', 'Compared your seven signals', 'Checked your connected tools'].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399]" aria-hidden="true" />
                      {s}
                    </div>
                  ))}
                </div>

                <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] leading-relaxed text-white/85">
                  <p>
                    Your score went from <strong className="font-medium text-white">71 to 68</strong>. Most of that came from{' '}
                    <strong className="font-medium text-white">Retention, down 8 points</strong>. Revenue growth held steady.
                  </p>
                  <p className="mt-2">
                    Referral has no data yet, so it isn&apos;t in your score. Connecting a source for it would make the score more complete.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {['PMF Score history', 'Mixpanel', 'Paystack'].map((s) => (
                      <span key={s} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-dm-mono text-[10px] text-white/65">
                        Source: {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <span className="flex-1 text-[12px] text-white/40">Ask about your score…</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10" aria-hidden="true">
                    <ArrowUp className="h-3.5 w-3.5 text-white/70" />
                  </span>
                </div>
              </div>
              <figcaption className="sr-only">
                A sample conversation: a founder asks why their score dropped, Velodesk AI checks their data and answers with sources.
              </figcaption>
            </figure>
          </div>

          {/* What it does */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#090A10] p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-light">Ask Velodesk AI</h3>
                <StatusPill label={ASSISTANT_STATUS} tone={ASSISTANT_STATUS === 'Live' ? 'live' : 'soon'} />
              </div>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ASSISTANT.map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#A5B4FC]" strokeWidth={1.75} aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-white">{f.title}</div>
                      <p className="text-[13px] font-light leading-relaxed text-white/65">{f.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#7B61FF]/30 bg-gradient-to-br from-[#7B61FF]/[0.08] to-transparent p-5 sm:p-6">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-light">Agentic AI: it works while you build</h3>
                <StatusPill label={AGENTS_STATUS} tone="soon" />
              </div>
              <p className="mb-4 text-[13px] font-light leading-relaxed text-white/65">
                Agents don&apos;t wait to be asked. They keep an eye on your numbers, dig into changes and prepare the work. You stay in charge of anything that leaves Velodesk.
              </p>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {AGENTS.map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#A5B4FC]" strokeWidth={1.75} aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-white">{f.title}</div>
                      <p className="text-[13px] font-light leading-relaxed text-white/65">{f.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Guardrails */}
        <ul className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-8">
          {RULES.map((r) => (
            <li key={r.text} className="flex items-center gap-2 text-sm text-white/70">
              <r.icon className="h-4 w-4 text-[#34D399]" strokeWidth={1.75} aria-hidden="true" />
              {r.text}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link href="/signup" className={`${PRIMARY_CTA} px-7 py-3 text-sm`}>
            Start free trial
          </Link>
        </div>
      </div>
    </section>
  )
}
