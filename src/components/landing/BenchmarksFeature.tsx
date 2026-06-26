'use client'

import React from 'react'
import { BarChart3, TrendingUp, Users } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'

export default function BenchmarksFeature() {
    const { ref: revealRef, isVisible } = useScrollReveal(0.1)

    return (
        <section ref={revealRef} className={`py-24 bg-[#04060D] border-t border-white/5 overflow-hidden transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Text Content */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="px-3 py-1 bg-[#7B61FF]/10 border border-[#7B61FF]/20 rounded-full flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5 text-[#7B61FF]" />
                                <span className="text-[#7B61FF] text-xs font-medium tracking-wide uppercase">Cohort Benchmarks</span>
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-light text-white mb-6 tracking-tight leading-tight">
                            Know exactly where you stand against the <span className="bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent italic font-medium">industry standard.</span>
                        </h2>
                        <p className="text-[#808080] text-lg font-light leading-relaxed mb-8">
                            Stop guessing what a "good" retention rate is for a B2B SaaS in your vertical. VeloDesk aggregates anonymized data from thousands of startups to give you real-time benchmark percentiles.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-5 h-5 text-white/60" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Percentile Ranking</h4>
                                    <p className="text-[#808080] font-light text-sm">See immediately if your 42% Week 1 retention is top quartile or bottom decile for your specific B2B segment.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5 text-white/60" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Segment Filtering</h4>
                                    <p className="text-[#808080] font-light text-sm">Filter benchmarks by ACV, target market (SMB vs Enterprise), and vertical to ensure you're comparing apples to apples.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mockup Visual */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#7B61FF]/20 to-[#38BDF8]/20 blur-3xl rounded-full opacity-30" />
                        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <div className="text-white font-medium">B2B SaaS Benchmarks</div>
                                <div className="text-xs text-white/40 font-mono">ACV: $10k - $50k</div>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Metric 1 */}
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[#808080]">W4 Retention</span>
                                        <span className="text-white font-mono">78.4%</span>
                                    </div>
                                    <div className="relative h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] rounded-full" style={{ width: '84%' }} />
                                        <div className="absolute top-0 bottom-0 w-px bg-white/40" style={{ left: '62%' }} title="Industry Avg: 62%" />
                                    </div>
                                    <div className="text-[10px] text-[#00B67A] mt-2 font-medium tracking-wide">TOP 16% PERCENTILE</div>
                                </div>

                                {/* Metric 2 */}
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[#808080]">Activation Rate</span>
                                        <span className="text-white font-mono">31.2%</span>
                                    </div>
                                    <div className="relative h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <div className="absolute top-0 bottom-0 left-0 bg-[#F59E0B] rounded-full" style={{ width: '38%' }} />
                                        <div className="absolute top-0 bottom-0 w-px bg-white/40" style={{ left: '45%' }} title="Industry Avg: 45%" />
                                    </div>
                                    <div className="text-[10px] text-[#F59E0B] mt-2 font-medium tracking-wide">BOTTOM 38% PERCENTILE</div>
                                </div>

                                {/* Metric 3 */}
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[#808080]">Time to Value (Days)</span>
                                        <span className="text-white font-mono">14.5</span>
                                    </div>
                                    <div className="relative h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] rounded-full" style={{ width: '65%' }} />
                                        <div className="absolute top-0 bottom-0 w-px bg-white/40" style={{ left: '55%' }} title="Industry Avg: 18.2" />
                                    </div>
                                    <div className="text-[10px] text-[#00B67A] mt-2 font-medium tracking-wide">TOP 35% PERCENTILE</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
