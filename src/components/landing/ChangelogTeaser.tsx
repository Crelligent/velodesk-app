'use client'

import React from 'react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'

const entries = [
  {
    date: 'June 2026',
    title: 'Mixpanel Integration v2',
    description:
      'Deep funnel analytics now flow directly into your PMF Score.',
    delay: 0,
  },
  {
    date: 'May 2026',
    title: 'Board Report Export',
    description:
      'One-click export to investor-ready PDF decks.',
    delay: 120,
  },
  {
    date: 'April 2026',
    title: 'Cohort Retention Engine',
    description:
      'Track true retention curves, not vanity metrics.',
    delay: 240,
  },
]

function ChangelogCard({
  date,
  title,
  description,
  delay,
}: (typeof entries)[number]) {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <div
      ref={ref}
      className={`rounded-xl bg-white/[0.02] border border-white/5 p-6 flex flex-col gap-4 transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="inline-block self-start text-xs font-mono tracking-wider uppercase text-white/30 bg-white/[0.04] border border-white/5 rounded-full px-3 py-1">
        {date}
      </span>

      <h3 className="text-lg font-semibold text-white leading-snug">
        {title}
      </h3>

      <p className="text-white/45 text-sm leading-relaxed font-light">
        {description}
      </p>
    </div>
  )
}

export default function ChangelogTeaser() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)

  return (
    <section className="bg-[#04060D] py-24 border-t border-white/5">
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
            What&apos;s new
          </h2>
          <p className="mt-4 text-lg italic font-serif bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">
            Latest updates
          </p>
        </div>

        {/* Changelog cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <ChangelogCard key={entry.title} {...entry} />
          ))}
        </div>
      </div>
    </section>
  )
}
