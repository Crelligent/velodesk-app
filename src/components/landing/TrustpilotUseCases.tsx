'use client'

import React from 'react'
import { Star, MessageSquare, TrendingDown, AlertTriangle } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'

export default function TrustpilotUseCases() {
    const { ref: revealRef, isVisible } = useScrollReveal(0.1)

    return (
        <section ref={revealRef} className={`pt-24 pb-48 md:pb-64 bg-[#04060D] border-t border-white/5 relative overflow-hidden transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {/* Background Logo at Bottom Right */}
            <div className="absolute bottom-4 md:bottom-12 right-4 md:right-16 w-[300px] md:w-[600px] opacity-[0.10] pointer-events-none">
                <img 
                    src="/Trustpilot_Logo_White.svg" 
                    alt="Trustpilot Background" 
                    className="w-full h-auto object-contain"
                />
            </div>
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="text-center mb-16 max-w-3xl mx-auto flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-4 h-4 text-[#00B67A] fill-current" />
                        <h3 className="text-[#00B67A] text-xs font-mono tracking-widest uppercase">Trustpilot Integration</h3>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-light text-white mb-6 tracking-tight">
                        Turn qualitative reviews into <span className="bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent italic font-medium">quantitative predictions.</span>
                    </h2>
                    <p className="text-[#808080] text-lg font-light leading-relaxed">
                        VeloDesk doesn't just read your Trustpilot reviews; our ML engine analyzes them for sentiment, extracts feature complaints, and correlates them with your retention curves to predict churn weeks before it happens.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MessageSquare className="w-24 h-24 text-[#7B61FF]" />
                        </div>
                        <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center mb-6">
                            <MessageSquare className="w-6 h-6 text-[#7B61FF]" />
                        </div>
                        <h3 className="text-white text-xl font-medium mb-3">Automated Sentiment Extraction</h3>
                        <p className="text-[#808080] font-light leading-relaxed">
                            Every review is ingested in real-time and scored for sentiment. VeloDesk automatically categorizes complaints by product area, pricing, or support.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingDown className="w-24 h-24 text-[#5B8DEF]" />
                        </div>
                        <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center mb-6">
                            <TrendingDown className="w-6 h-6 text-[#5B8DEF]" />
                        </div>
                        <h3 className="text-white text-xl font-medium mb-3">Retention Correlation</h3>
                        <p className="text-[#808080] font-light leading-relaxed">
                            We map sentiment scores directly against your active user cohorts. Watch how a 0.5 drop in average rating impacts your Week 4 retention.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AlertTriangle className="w-24 h-24 text-[#38BDF8]" />
                        </div>
                        <div className="w-12 h-12 bg-[#00B67A]/10 border border-[#00B67A]/20 rounded-xl flex items-center justify-center mb-6">
                            <AlertTriangle className="w-6 h-6 text-[#00B67A]" />
                        </div>
                        <h3 className="text-white text-xl font-medium mb-3">Early Warning System</h3>
                        <p className="text-[#808080] font-light leading-relaxed">
                            Get alerted to churn spikes before they hit your MRR. Sentiment drops consistently precede usage drops by 14 to 30 days.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    )
}
