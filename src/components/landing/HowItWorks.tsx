'use client'

import { Database, GitMerge, LineChart } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'
import WavyBackground from './WavyBackground'
import ConnectToolsVisual from './ConnectToolsVisual'
import SignalWeightsVisual from './SignalWeightsVisual'
import ScoreGaugeVisual from './ScoreGaugeVisual'

export default function HowItWorks() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollReveal(0.1)
  const { ref: card1Ref, isVisible: card1Visible } = useScrollReveal(0.2)
  const { ref: card2Ref, isVisible: card2Visible } = useScrollReveal(0.2)
  const { ref: card3Ref, isVisible: card3Visible } = useScrollReveal(0.2)

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative bg-[#04060D] text-white py-24 overflow-hidden border-t border-white/5"
      style={{
        opacity: sectionVisible ? 1 : 0,
        transform: sectionVisible ? 'scale(1)' : 'scale(0.97)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      
      {/* Diagonally oriented wavy lines */}
      <WavyBackground rotation={-45} opacity={0.2} scale={1.5} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7B61FF]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.1] mb-6">
            <span className="text-white">We don&apos;t just count users.</span><br />
            <span className="font-instrument italic font-normal bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">We weigh seven signals.</span>
          </h2>
          <p className="text-lg text-white/70 font-light leading-relaxed">
            Most dashboards give you raw data and leave the maths to you. Velodesk scores seven signals, from retention to referrals, using only data you&apos;ve connected.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Row 1 — Card 1: Connect (1 col) */}
          <div
            ref={card1Ref}
            className="p-8 rounded-3xl bg-[#090A10] border border-white/10 relative overflow-hidden group md:col-span-1 shadow-2xl isolate z-20 flex flex-col"
            style={{
              opacity: card1Visible ? 1 : 0,
              transform: card1Visible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0ms',
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
              <Database className="text-white/70 group-hover:text-white transition" size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-light mb-3">1. Connect your tools</h3>
            <p className="text-sm text-white/70 font-light leading-relaxed mb-6">
              We read your payments, product analytics and support data from the tools you already use. No CSV uploads, no spreadsheets.
            </p>
            {/* Tools wired into Velodesk */}
            <div className="w-full md:flex-1 rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden flex">
              <ConnectToolsVisual />
            </div>
          </div>

          {/* Row 1 — Card 2: PMF engine (2 cols) */}
          <div
            ref={card2Ref}
            className="p-8 rounded-3xl bg-[#0C0E1A] border border-[#7B61FF]/30 relative overflow-hidden group md:col-span-2 md:row-span-1 shadow-[0_0_40px_rgba(123,97,255,0.05)] isolate z-20"
            style={{
              opacity: card2Visible ? 1 : 0,
              transform: card2Visible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 120ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 120ms',
            }}
          >
            {/* Top-left glow accent */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#7B61FF]/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B61FF]/20 to-[#38BDF8]/20 flex items-center justify-center mb-6">
                <GitMerge className="text-[#7B61FF]" size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-light mb-3 text-white">2. The PMF engine</h3>
              <p className="text-sm text-white/70 font-light leading-relaxed mb-6 max-w-lg">
                Each signal has a fixed, published weight. Vanity metrics like page views don&apos;t count.
              </p>
              <SignalWeightsVisual />
            </div>
          </div>

          {/* Row 2 — Card 3: Score (full width) */}
          <div
            ref={card3Ref}
            className="p-8 rounded-3xl bg-[#090A10] border border-white/10 relative overflow-hidden group md:col-span-3 shadow-2xl isolate z-20"
            style={{
              opacity: card3Visible ? 1 : 0,
              transform: card3Visible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 240ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 240ms',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Text left */}
              <div className="md:w-1/2">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  <LineChart className="text-white/70 group-hover:text-white transition" size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-light mb-3">3. Your PMF Score</h3>
                <p className="text-sm text-white/70 font-light leading-relaxed">
                  One number from 0 to 100, with the band it falls in and the signals behind it. It updates as your connected data changes.
                </p>
              </div>
              <div className="md:w-1/2">
                <ScoreGaugeVisual />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
