'use client'

import React from 'react'
import { useScrollReveal, useCountUp } from '@/hooks/useScrollAnimations'

const stats = [
  { target: 17, suffix: '+', label: 'Integrations' },
  { target: 45, prefix: '<', suffix: 's', label: 'Time to Connect' },
  { target: 84, suffix: '', label: 'Avg. PMF Score' },
  { target: 0, suffix: '', label: 'Data Engineers Needed' },
]

export default function StatsStrip() {
  const { ref, isVisible } = useScrollReveal(0.2)

  const count0 = useCountUp(stats[0].target, 2000, isVisible)
  const count1 = useCountUp(stats[1].target, 2000, isVisible)
  const count2 = useCountUp(stats[2].target, 2000, isVisible)
  const count3 = useCountUp(stats[3].target, 2000, isVisible)
  const counts = [count0, count1, count2, count3]

  return (
    <section
      ref={ref}
      className="bg-[#04060D] py-20 border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-10 text-center transition-all duration-1000 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center gap-3">
              <span className="text-5xl md:text-6xl font-light bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">
                {stat.prefix ?? ''}
                {counts[i]}
                {stat.suffix}
              </span>
              <span className="text-white/40 text-sm font-mono uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
