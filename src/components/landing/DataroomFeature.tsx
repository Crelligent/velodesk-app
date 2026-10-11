'use client'

import React from 'react'
import { Eye, Link as LinkIcon, Lock, RefreshCw } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'
import IntegrationLogo from './IntegrationLogo'
import { LIVE_INTEGRATIONS } from './liveIntegrations'

const SOURCE_IDS = ['stripe', 'paystack', 'mixpanel', 'hubspot', 'intercom']

export default function DataroomFeature() {
  const { ref: revealRef, isVisible } = useScrollReveal(0.1)
  const sources = SOURCE_IDS.map((id) => LIVE_INTEGRATIONS.find((i) => i.id === id)).filter(
    (i): i is (typeof LIVE_INTEGRATIONS)[number] => Boolean(i),
  )

  const points = [
    { icon: RefreshCw, title: 'Straight from the source', text: 'Numbers come from your connected tools through their APIs, not typed in.' },
    { icon: Eye, title: 'Read-only', text: 'Investors see your score and its signals. They cannot change anything.' },
    { icon: Lock, title: 'You decide', text: 'You choose when to share the link and who gets it.' },
  ]

  return (
    <section
      ref={revealRef}
      aria-labelledby="dataroom-heading"
      className={`py-24 bg-[#04060D] border-t border-white/5 overflow-hidden transition-all duration-1000 motion-reduce:transition-none ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Sample shared score page */}
          <div className="relative order-2 lg:order-1">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-[#38BDF8]/20 to-[#7B61FF]/20 blur-3xl rounded-full opacity-40" />

            <figure className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-[#111] px-4 py-3 border-b border-white/5 flex items-center gap-3">
                <div aria-hidden="true" className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <div className="min-w-0 bg-white/5 rounded px-3 py-1 text-[11px] text-white/70 font-dm-mono w-full max-w-sm flex items-center gap-2">
                  <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">velodesk.crelligent.com/pmf/your-startup</span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-start gap-3 mb-6">
                  <div>
                    <div className="text-white font-medium text-lg">Your Startup</div>
                    <div className="text-xs text-white/60">Read-only PMF Score link</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/80 text-[11px] font-dm-mono border border-white/10 uppercase tracking-wider">
                    Sample
                  </span>
                </div>

                <div className="grid grid-cols-[auto_1fr] items-center gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-5">
                  <div>
                    <div className="font-dm-mono text-[10px] uppercase tracking-widest text-white/60">PMF Score</div>
                    <div className="font-outfit text-5xl font-light leading-none bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] bg-clip-text text-transparent">68</div>
                    <div className="mt-1 text-xs text-[#A9B8FF]">Emerging PMF</div>
                  </div>
                  <svg viewBox="0 0 200 60" className="h-14 w-full" aria-hidden="true">
                    {[52, 55, 54, 59, 63, 61, 66, 68].map((v, i, arr) => {
                      const w = 200 / arr.length
                      const h = ((v - 40) / 40) * 56
                      return <rect key={i} x={i * w + 3} y={60 - h} width={w - 6} height={h} rx="2" fill="url(#dr-bars)" opacity={0.45 + (i / arr.length) * 0.55} />
                    })}
                    <defs>
                      <linearGradient id="dr-bars" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#7B61FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="font-dm-mono text-[10px] uppercase tracking-widest text-white/60 mb-3">Data sources</div>
                <ul className="flex flex-wrap gap-2">
                  {sources.map((s) => (
                    <li key={s.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] py-1.5 pl-1.5 pr-3">
                      <IntegrationLogo integration={s} className="h-7 w-7 !rounded-md !p-1" decorative />
                      <span className="text-sm text-white/85">{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </figure>
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="px-3 py-1 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-full flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
                <span className="text-[#7DD3FC] text-xs font-medium tracking-wide uppercase">Share with investors</span>
              </div>
            </div>
            <h2 id="dataroom-heading" className="text-3xl md:text-5xl font-light text-white mb-6 tracking-tight leading-tight">
              Show investors your traction{' '}
              <span className="font-instrument italic font-normal bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">
                with real data.
              </span>
            </h2>
            <p className="text-white/70 text-lg font-light leading-relaxed mb-8 max-w-xl">
              Stop sending spreadsheets and screenshots. Share a read-only link to your live PMF Score, with data pulled
              directly from your connected tools, not typed in.
            </p>

            <ul className="space-y-5">
              {points.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                    <Icon className="h-4 w-4 text-[#7DD3FC]" />
                  </span>
                  <p className="text-white/70 font-light">
                    <strong className="text-white font-medium">{title}:</strong> {text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
