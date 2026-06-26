'use client'

import React from 'react'
import { Rocket, TrendingUp, Target } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'

const personas = [
  {
    icon: Rocket,
    title: 'For Founders',
    headline: 'Know your score before your board asks.',
    description:
      'Real-time PMF visibility so you never walk into a board meeting unprepared. Track your score daily, understand what moves the needle, and communicate progress with confidence.',
    delay: 0,
  },
  {
    icon: TrendingUp,
    title: 'For Investors',
    headline: 'Due diligence in one click.',
    description:
      'Standardized PMF metrics across your entire portfolio. Compare companies objectively, spot early warnings before they become problems, and back founders with data—not hunches.',
    delay: 120,
  },
  {
    icon: Target,
    title: 'For Product Leaders',
    headline: 'Stop guessing what\'s working.',
    description:
      'Feature-level signal that tells you exactly which capabilities drive retention and which ones users ignore. Prioritize your roadmap with mathematical precision.',
    delay: 240,
  },
]

function PersonaCard({
  icon: Icon,
  title,
  headline,
  description,
  delay,
}: (typeof personas)[number]) {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <div
      ref={ref}
      className={`rounded-2xl bg-white/[0.02] border border-white/5 p-8 flex flex-col gap-5 transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7B61FF]/20 to-[#38BDF8]/10 border border-white/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#5B8DEF]" />
      </div>

      <span className="text-xs font-mono tracking-widest uppercase text-white/30">
        {title}
      </span>

      <h3 className="text-xl font-semibold text-white leading-snug">
        {headline}
      </h3>

      <p className="text-white/50 text-sm leading-relaxed font-light">
        {description}
      </p>
    </div>
  )
}

export default function PersonaTabs() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)

  return (
    <section className="bg-[#04060D] py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-1000 ease-out ${
            headerVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
            Built for the people who need it most.
          </h2>
          <p className="mt-4 text-lg italic font-serif bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">
            Every role. One source of truth.
          </p>
        </div>

        {/* Persona cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <PersonaCard key={persona.title} {...persona} />
          ))}
        </div>
      </div>
    </section>
  )
}
