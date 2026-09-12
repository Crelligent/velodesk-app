'use client'

import { useScrollReveal } from '@/hooks/useScrollAnimations'
import { LayoutDashboard, Target, TrendingUp, AlertCircle } from 'lucide-react'

export default function ForAccelerators() {
    const { ref: sectionRef, isVisible } = useScrollReveal(0.1)

    return (
        <section ref={sectionRef} className={`py-24 bg-[#04060D] border-t border-white/5 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-light text-white mb-6 tracking-tight">
                        The ultimate <span className="bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent italic font-medium">Demo Day</span> advantage.
                    </h2>
                    <p className="text-[#808080] text-lg font-light leading-relaxed">
                        Stop chasing founders for spreadsheets. Deploy VeloDesk across your entire batch to get standardized, real-time Product-Market Fit scores for every portfolio company.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-[#090A10] border border-white/5 rounded-2xl p-8 hover:border-[#7B61FF]/30 transition-colors">
                            <LayoutDashboard className="w-8 h-8 text-[#7B61FF] mb-6" />
                            <h3 className="text-white text-lg font-medium mb-3">Portfolio Overview</h3>
                            <p className="text-[#808080] text-sm font-light leading-relaxed">See every startup's metrics in one unified dashboard. No more fragmented reporting.</p>
                        </div>
                        <div className="bg-[#090A10] border border-white/5 rounded-2xl p-8 hover:border-[#5B8DEF]/30 transition-colors">
                            <Target className="w-8 h-8 text-[#5B8DEF] mb-6" />
                            <h3 className="text-white text-lg font-medium mb-3">Standardized Scoring</h3>
                            <p className="text-[#808080] text-sm font-light leading-relaxed">Compare apples to apples with a universal PMF Score derived from raw telemetry.</p>
                        </div>
                        <div className="bg-[#090A10] border border-white/5 rounded-2xl p-8 hover:border-[#38BDF8]/30 transition-colors">
                            <AlertCircle className="w-8 h-8 text-[#38BDF8] mb-6" />
                            <h3 className="text-white text-lg font-medium mb-3">Early Warning System</h3>
                            <p className="text-[#808080] text-sm font-light leading-relaxed">Spot flatlining cohorts weeks before founders report a missed revenue target.</p>
                        </div>
                        <div className="bg-[#090A10] border border-white/5 rounded-2xl p-8 hover:border-[#00B67A]/30 transition-colors">
                            <TrendingUp className="w-8 h-8 text-[#00B67A] mb-6" />
                            <h3 className="text-white text-lg font-medium mb-3">Demo Day Readiness</h3>
                            <p className="text-[#808080] text-sm font-light leading-relaxed">Export validated, ungameable traction reports directly for follow-on investors.</p>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-[#7B61FF]/20 rounded-2xl p-8 relative flex flex-col shadow-[0_0_40px_rgba(123,97,255,0.05)]">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7B61FF] to-transparent opacity-50" />
                        <h3 className="text-white text-xl font-medium mb-1">Accelerator</h3>
                        <p className="text-[#808080] text-sm mb-6">For venture portfolios</p>
                        
                        <div className="mb-8">
                            <span className="text-4xl font-semibold text-white tracking-tight">$399</span>
                            <span className="text-sm text-gray-500 font-light"> / month</span>
                        </div>
                        
                        <ul className="space-y-4 text-sm text-gray-400 flex-grow mb-8">
                            <li className="flex items-start gap-3">
                                <svg className="w-4 h-4 mt-0.5 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>15 portfolio seats</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-4 h-4 mt-0.5 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Global Portfolio Dashboard</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-4 h-4 mt-0.5 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Cross-company benchmarking</span>
                            </li>
                        </ul>
                        
                        <button className="w-full py-3 rounded-lg text-sm font-medium transition-all bg-[#7B61FF]/10 text-[#7B61FF] hover:bg-[#7B61FF]/20 border border-[#7B61FF]/20 mt-auto">
                            Apply Now
                        </button>
                    </div>
                </div>

            </div>
        </section>
    )
}
