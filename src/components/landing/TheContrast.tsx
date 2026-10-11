'use client'

import { Code2, KeyRound, MousePointerClick, ScanEye } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'
import WavyBackground from './WavyBackground'
import IntegrationsConstellation from './IntegrationsConstellation'
import { LIVE_COUNT, LIVE_INTEGRATIONS } from './liveIntegrations'

/** Integrations section: the honest version of the old "Zero configuration" block. */
export default function TheContrast() {
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal(0.2)
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal(0.2)

  const apiKeyCount = LIVE_INTEGRATIONS.filter((i) => i.authType === 'api_key').length
  const oauthNames = LIVE_INTEGRATIONS.filter((i) => i.authType === 'oauth').map((i) => i.name)

  const points = [
    { icon: KeyRound, text: `${apiKeyCount} tools connect with an API key you paste once` },
    { icon: MousePointerClick, text: `${oauthNames.join(', ') || 'Stripe'} connects in one click via OAuth` },
    { icon: Code2, text: 'No code and no tracking script on your site' },
    { icon: ScanEye, text: 'Velodesk only reads data. Disconnect any tool at any time' },
  ]

  const reveal = (visible: boolean, dx: number, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : `translateX(${dx}px)`,
    transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
  })

  return (
    <section
      id="integrations"
      aria-labelledby="integrations-heading"
      className="relative bg-[#050505] text-white py-24 md:py-32 overflow-hidden border-t border-white/5"
    >
      <WavyBackground rotation={180} opacity={0.25} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/[0.03] to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          <div ref={leftRef} style={reveal(leftVisible, -60)} className="motion-reduce:!opacity-100 motion-reduce:!transform-none">
            <p className="mb-4 font-dm-mono text-xs uppercase tracking-widest text-[#8FA8F5]">Integrations</p>
            <h2 id="integrations-heading" className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] mb-6">
              <span className="text-white">{LIVE_COUNT} tools, one score.</span>
              <br />
              <span className="font-instrument italic font-normal bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">
                No code required.
              </span>
            </h2>
            <p className="text-lg text-white/70 font-light leading-relaxed mb-10 max-w-lg">
              Connect the payment, analytics, CRM and support tools you already use. Velodesk reads their APIs, so there is
              nothing to install and no CSV to format.
            </p>

            <ul className="space-y-4">
              {points.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-white/85">
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                    <Icon size={18} className="text-[#8FA8F5]" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div ref={rightRef} style={reveal(rightVisible, 60, 0.15)} className="motion-reduce:!opacity-100 motion-reduce:!transform-none">
            <IntegrationsConstellation />
          </div>
        </div>
      </div>
    </section>
  )
}
