'use client'

import React from 'react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'

const companies = [
  'Nexus AI',
  'Reforge',
  'Lattice',
  'Notion',
  'Amplitude',
  'Vercel',
]

export default function TrustedBy() {
  const { ref, isVisible } = useScrollReveal(0.2)

  return (
    <section
      ref={ref}
      className="bg-[#04060D] py-16 border-t border-white/5"
    >
      <div
        className={`max-w-5xl mx-auto px-6 flex flex-col items-center gap-8 transition-all duration-1000 ease-out ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        }`}
      >
        <span className="text-xs font-mono tracking-widest uppercase text-white/30">
          Trusted by founders from
        </span>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((name) => (
            <span
              key={name}
              className="text-white/25 font-medium text-lg md:text-xl select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
