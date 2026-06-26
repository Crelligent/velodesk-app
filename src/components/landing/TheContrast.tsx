'use client'

import { CheckCircle2 } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'
import WavyBackground from './WavyBackground'

export default function TheContrast() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollReveal(0.1)
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal(0.2)
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal(0.2)

  const integrations = [
    { name: 'Stripe', icon: '💳', delay: '0s' },
    { name: 'Mixpanel', icon: '📊', delay: '0.8s' },
    { name: 'HubSpot', icon: '🔶', delay: '1.6s' },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#050505] text-white py-32 overflow-hidden border-t border-white/5"
      style={{
        opacity: sectionVisible ? 1 : 0,
        transform: sectionVisible ? 'scale(1)' : 'scale(0.97)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Inverted wavy background */}
      <WavyBackground rotation={180} opacity={0.25} />

      {/* Subtle gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/[0.03] to-transparent pointer-events-none z-0" />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes connectStatus {
          0%, 40% { opacity: 1; }
          50% { opacity: 0; }
          60%, 100% { opacity: 0; }
        }
        @keyframes connectedStatus {
          0%, 50% { opacity: 0; transform: translateY(4px); }
          60% { opacity: 1; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes dotFlow {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(200px); opacity: 0; }
        }
        @keyframes checkPop {
          0%, 50% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .connect-dot {
          animation: dotFlow 2.5s linear infinite;
        }
        `
      }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT text slides in from left */}
          <div
            ref={leftRef}
            style={{
              opacity: leftVisible ? 1 : 0,
              transform: leftVisible ? 'translateX(0)' : 'translateX(-60px)',
              transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] mb-6">
              <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Zero configuration.</span><br />
              <span className="font-['Instrument_Serif'] italic bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">Connect your stack in 45 seconds.</span>
            </h2>
            <p className="text-lg text-white/40 font-light leading-relaxed mb-10 max-w-lg">
              We hate complex implementations as much as you do. There are no tracking scripts to install, no CSV templates to format, and no data engineering required. You literally just click &quot;Connect&quot;.
            </p>

            <ul className="space-y-4">
              {[
                "Oauth 2.0 direct connections",
                "Instant historical data backfill",
                "Automatic currency conversion",
                "Self-healing API connections"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-white/70 font-light">
                  <CheckCircle2 size={18} className="text-[#7B61FF]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — Animated Connection Flow Mockup */}
          <div
            ref={rightRef}
            className="relative"
            style={{
              opacity: rightVisible ? 1 : 0,
              transform: rightVisible ? 'translateX(0)' : 'translateX(60px)',
              transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#5B8DEF]/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Connection Flow Card */}
            <div className="relative w-full rounded-2xl bg-[#0A0C14] border border-white/10 p-6 overflow-hidden">
              
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B61FF] to-[#38BDF8] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Connect Integrations</div>
                    <div className="text-[11px] text-white/30 font-mono">velodesk.io/setup</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-white/20 px-2 py-1 rounded bg-white/5">LIVE</div>
              </div>

              {/* Integration Items */}
              <div className="space-y-3 mb-6">
                {integrations.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm text-white/90 font-medium">{item.name}</div>
                        <div className="text-[10px] text-white/25 font-mono">OAuth 2.0</div>
                      </div>
                    </div>
                    
                    {/* Animated Status */}
                    <div className="relative flex items-center">
                      {/* Connecting state */}
                      <span
                        className="text-[11px] font-mono text-[#5B8DEF] flex items-center gap-1.5 absolute right-0"
                        style={{
                          animation: `connectStatus 2.4s ease ${item.delay} forwards`,
                        }}
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5B8DEF] animate-pulse" />
                        Connecting...
                      </span>
                      {/* Connected state */}
                      <span
                        className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5"
                        style={{
                          opacity: 0,
                          animation: `connectedStatus 2.4s ease ${item.delay} forwards`,
                        }}
                      >
                        <span
                          className="inline-block"
                          style={{
                            animation: `checkPop 2.4s ease ${item.delay} forwards`,
                            transformOrigin: 'center',
                          }}
                        >
                          ✓
                        </span>
                        Connected
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-white/30">Sync Progress</span>
                  <span className="text-[11px] font-mono text-white/30">3 / 3 sources</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8]"
                    style={{
                      animation: 'progressFill 3s ease 0.5s forwards',
                      width: '0%',
                    }}
                  />
                </div>
              </div>

              {/* Data Stream Dots */}
              <div className="relative h-6 overflow-hidden rounded-lg bg-white/[0.02] border border-white/5">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <span className="text-[9px] font-mono text-white/15 tracking-wider">DATA STREAM</span>
                </div>
                {[0, 1, 2, 3, 4].map((dot) => (
                  <div
                    key={dot}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] connect-dot"
                    style={{
                      left: '80px',
                      animationDelay: `${dot * 0.5}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
