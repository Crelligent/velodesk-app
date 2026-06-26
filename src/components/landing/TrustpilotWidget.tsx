'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollAnimations'

const reviews = [
    {
        name: "Sarah Jenkins",
        title: "Founder, SaaS Metrics API",
        review: "VeloDesk completely removed the guesswork from our board meetings. We now know our exact PMF score daily instead of scrambling at month-end.",
        date: "2 days ago"
    },
    {
        name: "Marcus Lin",
        title: "VP Product, Nexus AI",
        review: "The sentiment vs. retention correlation feature is insane. It warned us about a churn spike 3 weeks before our MRR actually dropped.",
        date: "1 week ago"
    },
    {
        name: "David Orlov",
        title: "CEO, Horizon",
        review: "We used the VeloDesk Investor Data Room link directly in our Series A deck. The investors loved the transparency. Game changer.",
        date: "2 weeks ago"
    }
]

export default function TrustpilotWidget() {
    const { ref: revealRef, isVisible } = useScrollReveal(0.1)

    return (
        <section ref={revealRef} className={`py-24 bg-[#04060D] border-t border-white/5 overflow-hidden transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Header */}
                <div className="flex flex-col items-center mb-16 text-center">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex text-[#00B67A]">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="w-6 h-6 fill-current" />
                            ))}
                        </div>
                        <span className="text-white text-xl font-medium">Trustpilot</span>
                    </div>
                    <div className="text-white/60 font-light text-lg">
                        Rated <span className="text-white font-medium">4.9/5</span> by over 200 B2B SaaS Founders
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((review, i) => (
                        <div 
                            key={i} 
                            className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors"
                        >
                            <div className="flex text-[#00B67A] mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-white/80 text-sm leading-relaxed mb-6 font-light">
                                "{review.review}"
                            </p>
                            <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                <div>
                                    <div className="text-white text-sm font-medium">{review.name}</div>
                                    <div className="text-white/40 text-xs mt-0.5">{review.title}</div>
                                </div>
                                <div className="text-white/30 text-[10px] font-mono">
                                    {review.date}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
