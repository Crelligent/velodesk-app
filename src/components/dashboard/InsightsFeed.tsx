'use client'

import { CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface Insight {
    type: 'success' | 'warning' | 'info' | string
    title: string
    desc: string
}

interface InsightsFeedProps {
    insights: string[]
}

export default function InsightsFeed({ insights }: InsightsFeedProps) {
    if (!insights || insights.length === 0) {
        return (
            <div className="text-white/40 text-sm font-light italic">
                No insights available yet.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {insights.map((insight, idx) => (
                <div 
                    key={idx} 
                    className="flex items-start gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md transition hover:bg-white/[0.04]"
                    style={{ animationDelay: `${idx * 150}ms` }}
                >
                    <div className="mt-0.5 text-white/50">
                        <Info size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-white/80 text-sm font-light leading-relaxed">
                            {insight}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
