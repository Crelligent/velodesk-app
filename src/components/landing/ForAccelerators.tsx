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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            </div>
        </section>
    )
}
