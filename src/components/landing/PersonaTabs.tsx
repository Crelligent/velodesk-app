'use client'

import React from 'react'
import { Rocket, TrendingUp, Target } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'

/* Small decorative graphics, one per persona. Sample shapes only, no data claims. */
function FounderGraphic() {
  return (
    <svg viewBox="0 0 220 80" className="h-20 w-full" aria-hidden="true">
      <defs>
        <linearGradient id="pg-founder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7B61FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 62 C30 60 45 52 70 50 S115 40 140 34 S190 20 220 14 L220 80 L0 80 Z" fill="url(#pg-founder)" />
      <path d="M0 62 C30 60 45 52 70 50 S115 40 140 34 S190 20 220 14" fill="none" stroke="#7B61FF" strokeWidth="2.5" />
      <circle cx="220" cy="14" r="4" fill="#38BDF8" />
      <line x1="0" y1="40" x2="220" y2="40" stroke="white" strokeOpacity="0.12" strokeDasharray="3 4" />
    </svg>
  )
}

function InvestorGraphic() {
  const rows = [
    { w: 0.78, label: 'A' },
    { w: 0.62, label: 'B' },
    { w: 0.45, label: 'C' },
  ]
  return (
    <svg viewBox="0 0 220 80" className="h-20 w-full" aria-hidden="true">
      {rows.map((r, i) => (
        <g key={r.label} transform={`translate(0 ${i * 26 + 6})`}>
          <rect x="0" y="0" width="18" height="18" rx="5" fill="white" fillOpacity="0.08" />
          <text x="9" y="13" textAnchor="middle" fontSize="10" fill="white" fillOpacity="0.7">{r.label}</text>
          <rect x="28" y="6" width="190" height="6" rx="3" fill="white" fillOpacity="0.06" />
          <rect x="28" y="6" width={190 * r.w} height="6" rx="3" fill="#5B8DEF" fillOpacity={1 - i * 0.2} />
        </g>
      ))}
    </svg>
  )
}

function ProductGraphic() {
  const bars = [0.35, 0.5, 0.42, 0.7, 0.58, 0.85, 0.66]
  return (
    <svg viewBox="0 0 220 80" className="h-20 w-full" aria-hidden="true">
      {bars.map((h, i) => (
        <rect key={i} x={i * 32 + 4} y={78 - h * 72} width="22" height={h * 72} rx="4" fill={i === 5 ? '#38BDF8' : '#7B61FF'} fillOpacity={i === 5 ? 0.95 : 0.35} />
      ))}
    </svg>
  )
}

const personas = [
  {
    icon: Rocket,
    title: 'For founders',
    headline: 'Know your score before your board asks.',
    description: 'See your PMF Score update as your data changes, understand which signals move it, and walk into board meetings prepared.',
    graphic: FounderGraphic,
    delay: 0,
  },
  {
    icon: TrendingUp,
    title: 'For investors',
    headline: 'One score, built the same way every time.',
    description: 'Founders can share a read-only link to their live score, calculated with the same seven weighted signals for every company.',
    graphic: InvestorGraphic,
    delay: 120,
  },
  {
    icon: Target,
    title: 'For product leaders',
    headline: 'See which signals are weak.',
    description: 'Retention, engagement, time to value: see where your score is held back, so you know what to work on next.',
    graphic: ProductGraphic,
    delay: 240,
  },
]

function PersonaCard({ icon: Icon, title, headline, description, graphic: Graphic, delay }: (typeof personas)[number]) {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <div
      ref={ref}
      className={`rounded-2xl bg-white/[0.02] border border-white/10 p-6 md:p-8 flex flex-col gap-5 transition-all duration-700 ease-out motion-reduce:transition-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="rounded-xl border border-white/5 bg-gradient-to-br from-[#7B61FF]/[0.08] to-[#38BDF8]/[0.03] p-4">
        <Graphic />
      </div>

      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7B61FF]/20 to-[#38BDF8]/10 border border-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#8FA8F5]" />
        </span>
        <span className="text-xs font-dm-mono tracking-widest uppercase text-white/70">{title}</span>
      </div>

      <h3 className="text-xl font-semibold text-white leading-snug">{headline}</h3>

      <p className="text-white/70 text-sm leading-relaxed font-light">{description}</p>
    </div>
  )
}

export default function PersonaTabs() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)

  return (
    <section aria-labelledby="personas-heading" className="bg-[#04060D] py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div
          ref={headerRef}
          className={`text-center mb-14 transition-all duration-1000 ease-out motion-reduce:transition-none ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 id="personas-heading" className="text-3xl md:text-4xl font-light text-white tracking-tight">
            Built for the people who need it most.
          </h2>
          <p className="mt-4 text-xl font-instrument italic bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">
            Every role. One score.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <PersonaCard key={persona.title} {...persona} />
          ))}
        </div>
      </div>
    </section>
  )
}
