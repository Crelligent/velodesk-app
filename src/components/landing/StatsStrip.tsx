'use client'

import React from 'react'
import { Clock, Code2, Plug, Wallet } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'
import { LIVE_COUNT } from './liveIntegrations'

type Stat = { value: string; label: string; icon: typeof Plug }

// Every value here is a product fact. Count comes from the integrations catalog (tools that sync today).
const stats: Stat[] = [
  { value: `${LIVE_COUNT}`, label: 'Tools you can connect today', icon: Plug },
  { value: '14 days', label: 'Free trial, no card needed', icon: Clock },
  { value: '₦ or $', label: 'Naira or USD billing', icon: Wallet },
  { value: 'No code', label: 'Needed to connect', icon: Code2 },
]

export default function StatsStrip() {
  const { ref, isVisible } = useScrollReveal(0.2)

  return (
    <section ref={ref} aria-label="Velodesk at a glance" className="bg-[#04060D] py-16 md:py-20 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <dl
          className={`grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-10 text-center transition-all duration-700 ease-out motion-reduce:transition-none ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex flex-col-reverse items-center gap-3">
                <dt className="text-white/70 text-xs md:text-sm font-dm-mono uppercase tracking-widest max-w-[14ch] md:max-w-none leading-snug">
                  {stat.label}
                </dt>
                <dd className="flex flex-col items-center gap-3">
                  <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#7B61FF]/20 to-[#38BDF8]/10">
                    <Icon className="h-5 w-5 text-[#8FA8F5]" />
                  </span>
                  <span className="text-4xl md:text-6xl font-light bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent whitespace-nowrap">
                    {stat.value}
                  </span>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
