'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useScrollReveal } from '@/hooks/useScrollAnimations'
import { SIGNALS, bandFor } from './pmfModel'

// Sample values for the illustration only. Referrals is shown as not connected (excluded, not guessed).
const SAMPLE_SCORE = 68
const SAMPLE_VALUES: Record<string, number | null> = {
  retention: 74,
  revenueGrowth: 71,
  nps: 62,
  engagement: 66,
  timeToValue: 58,
  expansion: 70,
  referral: null,
}

export default function ScoreDimensions() {
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal(0.2)
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal(0.2)
  const band = bandFor(SAMPLE_SCORE)

  const reveal = (visible: boolean, dx: number, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : `translateX(${dx}px)`,
    transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
  })

  return (
    <section aria-labelledby="report-heading" className="relative bg-[#04060D] text-white py-24 md:py-32 overflow-hidden border-t border-white/5">
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-[#7B61FF]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Sample board report */}
          <div ref={leftRef} className="order-2 lg:order-1 relative motion-reduce:!opacity-100 motion-reduce:!transform-none" style={reveal(leftVisible, -60)}>
            <div aria-hidden="true" className="absolute -inset-6 rounded-[40px] bg-gradient-to-tr from-[#7B61FF]/25 to-[#38BDF8]/15 blur-3xl" />
            <figure className="relative w-full rounded-2xl bg-white text-[#111827] p-5 sm:p-8 -rotate-1 hover:rotate-0 transition-transform duration-500 motion-reduce:rotate-0 shadow-2xl shadow-[#7B61FF]/20">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#6A4FF0] to-[#3E6BD8] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                  <div>
                    <div className="text-xs font-dm-mono font-semibold text-[#1F2937] tracking-widest uppercase">Board update</div>
                    <div className="text-xs font-dm-mono text-[#4B5563]">Your Startup · Q3</div>
                  </div>
                </div>
                <span className="rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2.5 py-0.5 font-dm-mono text-[11px] font-semibold uppercase tracking-wider text-[#3730A3]">
                  Sample
                </span>
              </div>

              <div className="mt-6 grid grid-cols-[auto_1fr] items-end gap-4 sm:gap-6">
                <div>
                  <div className="text-xs font-dm-mono font-semibold text-[#4B5563] tracking-[0.15em] uppercase">PMF Score</div>
                  <div className="font-outfit text-6xl sm:text-7xl font-light tracking-tighter leading-none text-[#4C3BD9] tabular-nums">{SAMPLE_SCORE}</div>
                  <div className="mt-2 inline-flex rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-xs font-medium text-[#4C1D95]">{band.label} PMF</div>
                </div>
                {/* 6-month trend */}
                <svg viewBox="0 0 160 60" className="h-16 w-full" role="img" aria-label="Sample score trend rising from 52 to 68 over six months">
                  <defs>
                    <linearGradient id="report-trend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6A4FF0" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6A4FF0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 48 L32 44 L64 40 L96 30 L128 26 L160 16 L160 60 L0 60 Z" fill="url(#report-trend)" />
                  <path d="M0 48 L32 44 L64 40 L96 30 L128 26 L160 16" fill="none" stroke="#5B47E0" strokeWidth="2.5" strokeLinejoin="round" />
                  <circle cx="160" cy="16" r="3.5" fill="#5B47E0" />
                </svg>
              </div>

              <ul className="mt-6 space-y-2 border-t border-[#E5E7EB] pt-5">
                {SIGNALS.map((s) => {
                  const v = SAMPLE_VALUES[s.key]
                  return (
                    <li key={s.key} className="grid grid-cols-[minmax(0,8.5rem)_1fr_2.5rem] items-center gap-3 text-xs sm:text-sm">
                      <span className={v === null ? 'text-[#6B7280]' : 'text-[#1F2937]'}>{s.label}</span>
                      <span className="h-1.5 rounded-full bg-[#EEF0F5]">
                        {v !== null ? (
                          <span className="block h-full rounded-full bg-gradient-to-r from-[#6A4FF0] to-[#3E9BD8]" style={{ width: `${v}%` }} />
                        ) : null}
                      </span>
                      <span className="text-right font-dm-mono tabular-nums text-[#374151]">{v ?? '—'}</span>
                    </li>
                  )
                })}
              </ul>
              <figcaption className="mt-4 flex items-center justify-between gap-3 text-[11px] font-dm-mono text-[#4B5563]">
                <span>Referrals not connected: excluded</span>
                <span>
                  Generated by <span className="font-semibold text-[#1F2937]">Velodesk</span>
                </span>
              </figcaption>
            </figure>
          </div>

          <div ref={rightRef} className="order-1 lg:order-2 motion-reduce:!opacity-100 motion-reduce:!transform-none" style={reveal(rightVisible, 60, 0.15)}>
            <p className="mb-4 font-dm-mono text-xs uppercase tracking-widest text-[#8FA8F5]">Board reports</p>
            <h2 id="report-heading" className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] mb-6">
              <span className="text-white">The only slide your board</span>
              <br />
              <span className="font-instrument italic font-normal bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">
                actually wants to see.
              </span>
            </h2>
            <p className="text-lg text-white/70 font-light leading-relaxed mb-10 max-w-xl">
              Export your PMF Score and the data behind it as a board-ready report: the score, its trend, and every signal
              that went into it, with missing data clearly marked.
            </p>

            <Link href="/signup" className="inline-flex items-center gap-2 font-medium text-[#A9B8FF] hover:text-white transition group">
              Start free trial
              <ArrowRight size={18} aria-hidden="true" className="transform group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
