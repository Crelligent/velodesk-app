import React from 'react'
import { Activity, ShieldCheck } from 'lucide-react'

// This would normally fetch data based on the params.slug
// but for the MVP we will just show a read-only verified state.
export default function InvestorDataRoomView({ params }: { params: { slug: string } }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF6B35]/30">
            {/* Minimalist Top Nav */}
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#FF6B35] flex items-center justify-center">
                            <span className="text-black font-bold text-xs">V</span>
                        </div>
                        <span className="font-outfit font-light tracking-widest text-sm">VELODESK <span className="text-gray-600">| VERIFIED DATA ROOM</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <ShieldCheck size={14} className="text-[#4ade80]" />
                        Data cryptographically verified via Stripe & Mixpanel API
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-16">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4ade80]/10 text-[#4ade80] text-xs font-medium tracking-widest uppercase mb-6">
                        <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" /> Live Sync Active
                    </div>
                    <h1 className="text-5xl font-outfit font-extralight tracking-tight mb-4">Acme Corp</h1>
                    <p className="text-xl text-gray-400 font-light">Product-Market Fit Analysis & Due Diligence</p>
                </div>

                {/* The Score Card */}
                <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-12 text-center relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/10 blur-[120px] pointer-events-none rounded-full" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4ade80]/5 blur-[120px] pointer-events-none rounded-full" />
                    
                    <div className="text-sm uppercase tracking-widest text-gray-500 mb-6">Certified PMF Score™</div>
                    <div className="text-9xl font-outfit font-extralight tracking-tighter mb-4 tabular-nums">
                        72<span className="text-4xl text-gray-600">/100</span>
                    </div>
                    <div className="text-[#4ade80] font-medium tracking-wide">Top 12% of SaaS companies at Seed Stage</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Verified MRR</div>
                        <div className="text-3xl font-light tabular-nums">$42,500</div>
                        <div className="text-xs text-[#4ade80] mt-2 flex items-center gap-1">↑ 8.5% MoM</div>
                    </div>
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">D30 Retention</div>
                        <div className="text-3xl font-light tabular-nums">34%</div>
                        <div className="text-xs text-[#4ade80] mt-2 flex items-center gap-1">↑ 2.1% MoM</div>
                    </div>
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Blended CAC</div>
                        <div className="text-3xl font-light tabular-nums">$125</div>
                        <div className="text-xs text-[#4ade80] mt-2 flex items-center gap-1">↓ 12% MoM</div>
                    </div>
                </div>

                {/* Simulated Chart Area */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl h-80 flex flex-col items-center justify-center text-gray-500">
                    <Activity size={32} className="mb-4 opacity-50" />
                    <p>Detailed retention cohorts and engagement graphs are populated here.</p>
                </div>
            </main>
        </div>
    )
}
