'use client'

import React from 'react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'

// Hidden until the owner confirms each company below has founders who actually use Velodesk
// (and that we have permission to name them). Set to true only after confirming.
const SHOW_UNVERIFIED_CLAIMS = false

// UNVERIFIED: "Trusted by founders from" — none of these are confirmed customers.
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

  if (!SHOW_UNVERIFIED_CLAIMS) return null

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
        <span className="text-xs font-mono tracking-widest uppercase text-[#8A8A8A]">
          Trusted by founders from
        </span>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((name) => (
            <span
              key={name}
              className="text-[#8A8A8A] font-medium text-lg md:text-xl select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
