'use client'

import React from 'react'
import { FileLock, Link as LinkIcon, ShieldCheck } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'

export default function DataroomFeature() {
    const { ref: revealRef, isVisible } = useScrollReveal(0.1)

    return (
        <section ref={revealRef} className={`py-24 bg-[#04060D] border-t border-white/5 overflow-hidden transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Mockup Visual */}
                    <div className="relative order-2 lg:order-1">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#38BDF8]/20 to-[#7B61FF]/20 blur-3xl rounded-full opacity-30" />
                        
                        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Browser Chrome */}
                            <div className="bg-[#111] px-4 py-3 border-b border-white/5 flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                </div>
                                <div className="bg-white/5 rounded px-3 py-1 text-[10px] text-white/40 font-mono w-full max-w-sm flex items-center gap-2">
                                    <FileLock className="w-3 h-3" />
                                    velodesk.com/room/a9b8c7-nexus-ai
                                </div>
                            </div>
                            
                            {/* Dataroom Content */}
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <div className="text-white font-medium text-lg">Nexus AI - Series A</div>
                                        <div className="text-xs text-white/40">Expires in 14 days</div>
                                    </div>
                                    <div className="px-3 py-1 rounded bg-[#00B67A]/10 text-[#00B67A] text-[10px] font-mono border border-[#00B67A]/20 uppercase">
                                        Verified
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {['PMF Score History (Trailing 12 Mo)', 'Cohort Retention Tables', 'Feature Usage Distribution', 'Verified Revenue Integrations'].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                            <span className="text-white/80 text-sm">{item}</span>
                                            <ShieldCheck className="w-4 h-4 text-[#00B67A]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="order-1 lg:order-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="px-3 py-1 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-full flex items-center gap-2">
                                <LinkIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
                                <span className="text-[#38BDF8] text-xs font-medium tracking-wide uppercase">Investor Data Room</span>
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-light text-white mb-6 tracking-tight leading-tight">
                            Close your round faster with <span className="bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent italic font-medium">undeniable proof.</span>
                        </h2>
                        <p className="text-[#808080] text-lg font-light leading-relaxed mb-8">
                            Stop exporting CSVs to Excel and sending static screenshots to investors. Generate a secure, read-only link that proves your Product-Market Fit with cryptographically verified data pulled directly from your integrations.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-2 shrink-0" />
                                <p className="text-[#808080] font-light"><strong className="text-white font-medium">Source of Truth:</strong> Investors know the data is real because it flows directly via API from Stripe, Mixpanel, and Trustpilot, bypassing manual entry.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-2 shrink-0" />
                                <p className="text-[#808080] font-light"><strong className="text-white font-medium">Auto-Redaction:</strong> Share aggregate metrics and PMF scores while automatically hiding PII and sensitive customer-level revenue.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-2 shrink-0" />
                                <p className="text-[#808080] font-light"><strong className="text-white font-medium">Audit Logs:</strong> Get notified exactly when a partner at a VC firm views your metrics or downloads the report.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
