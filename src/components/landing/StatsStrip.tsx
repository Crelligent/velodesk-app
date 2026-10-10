'use client'

import React from 'react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'
import { INTEGRATIONS } from '@/lib/integrations'

const SCORING_SOURCES = INTEGRATIONS.filter((i) => i.feedsScore).length

// Stats that can't be verified yet are hidden. Set to true only once each one is backed by data.
const SHOW_UNVERIFIED_CLAIMS = false

type Stat = { value: string; label: string; unverified?: boolean }

// Values render statically (no count-up), so they never show "0" before animating or without JS.
const stats: Stat[] = [
  // Derived from the integrations source of truth: only providers that feed the score count.
  { value: `${SCORING_SOURCES}`, label: 'Live data sources (Paystack, Stripe)' },
  { value: '14 days', label: 'Free trial' },
  { value: '₦ or $', label: 'Naira or USD billing' },
  { value: 'No code', label: 'Needed to connect' },
  // UNVERIFIED: no measurement backs these.
  { value: '<45s', label: 'Time to Connect', unverified: true },
  { value: '84', label: 'Avg. PMF Score', unverified: true },
]

export default function StatsStrip() {
  const { ref, isVisible } = useScrollReveal(0.2)
  const visibleStats = stats.filter((s) => SHOW_UNVERIFIED_CLAIMS || !s.unverified)

  return (
    <section
      ref={ref}
      className="bg-[#04060D] py-20 border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto px-6">
        <dl
          className={`grid grid-cols-2 md:grid-cols-4 gap-10 text-center transition-all duration-1000 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          {visibleStats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse items-center gap-3">
              <dt className="text-[#8A8A8A] text-sm font-mono uppercase tracking-widest">
                {stat.label}
              </dt>
              <dd className="text-5xl md:text-6xl font-light bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
