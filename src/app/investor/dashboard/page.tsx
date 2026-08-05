'use client'

import { useState } from 'react'
import { Activity, TrendingUp, AlertTriangle, Building2, ChevronRight, Search, Filter, X, Sparkles, ArrowRight } from 'lucide-react'

// Dummy data representing an Accelerator's portfolio
const portfolioCompanies = [
    {
        id: '1',
        name: 'PayFlow',
        industry: 'Fintech',
        stage: 'growth',
        pmfScore: 28,
        status: 'Strong',
        signal: 'positive',
        lastUpdated: '2 hours ago',
    },
    {
        id: '2',
        name: 'EduStream',
        industry: 'Edtech',
        stage: 'mvp',
        pmfScore: 12,
        status: 'Weak Signal',
        signal: 'warning',
        lastUpdated: '5 hours ago',
    },
    {
        id: '3',
        name: 'HealthSync',
        industry: 'Healthtech',
        stage: 'scaling',
        pmfScore: 32,
        status: 'Strong',
        signal: 'positive',
        lastUpdated: '1 day ago',
    },
    {
        id: '4',
        name: 'AgriMarket',
        industry: 'Agritech',
        stage: 'ideation',
        pmfScore: 5,
        status: 'Pre-PMF',
        signal: 'negative',
        lastUpdated: '2 days ago',
    },
    {
        id: '5',
        name: 'LogisX',
        industry: 'Logistics',
        stage: 'growth',
        pmfScore: 19,
        status: 'Developing',
        signal: 'positive',
        lastUpdated: '3 days ago',
    },
]

export default function AcceleratorDashboard() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showInterventions, setShowInterventions] = useState(false)

    const filteredCompanies = portfolioCompanies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-10">
                <div className="text-[0.65rem] text-[#7B61FF] uppercase tracking-[0.3em] mb-4">Accelerator / VC Mode</div>
                <h1 className="font-outfit text-4xl font-extralight tracking-tight mb-2">Portfolio Overview</h1>
                <p className="text-[#606060] font-light">Monitor PMF signals across your active investments in real-time.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-6">
                    <div className="flex items-center gap-3 text-[#606060] mb-4">
                        <Building2 className="w-4 h-4" />
                        <span className="text-[0.7rem] uppercase tracking-[0.15em]">Active Portfolio</span>
                    </div>
                    <div className="text-4xl font-outfit font-light mb-1">5 <span className="text-xl text-[#606060]">/ 15</span></div>
                    <div className="text-sm text-[#404040]">Companies connected</div>
                </div>

                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#7B61FF] opacity-[0.03] blur-3xl rounded-full" />
                    <div className="flex items-center gap-3 text-[#606060] mb-4 relative z-10">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[0.7rem] uppercase tracking-[0.15em]">Avg. PMF Score</span>
                    </div>
                    <div className="text-4xl font-outfit font-light mb-1 relative z-10">19.2</div>
                    <div className="text-sm text-[#22c55e] flex items-center gap-1 relative z-10">
                        +2.4 this month
                    </div>
                </div>

                <button 
                    onClick={() => setShowInterventions(true)}
                    className="bg-[rgba(255,255,255,0.02)] border border-red-500/20 hover:border-red-500/40 hover:bg-[rgba(255,255,255,0.04)] rounded-xl p-6 relative overflow-hidden text-left transition-colors cursor-pointer group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-[0.05] group-hover:opacity-[0.08] blur-3xl rounded-full transition-opacity" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-3 text-[#606060]">
                            <AlertTriangle className="w-4 h-4 text-red-500/70" />
                            <span className="text-[0.7rem] uppercase tracking-[0.15em] text-red-400/80">Critical Alerts</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300" />
                    </div>
                    <div className="text-4xl font-outfit font-light mb-1 relative z-10">2</div>
                    <div className="text-sm text-red-400 relative z-10">
                        Negative signals detected (Click to view)
                    </div>
                </button>
            </div>

            {/* Portfolio Summary */}
            <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-outfit font-medium text-white/90">Top Performers</h2>
                        <p className="text-xs text-[#606060] mt-1">Startups with highest positive PMF velocity this week</p>
                    </div>
                    
                    <a href="/investor/startups" className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.05)] rounded-lg text-sm text-[#808080] transition-colors">
                        View All Startups
                        <ChevronRight className="w-4 h-4" />
                    </a>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
                                <th className="py-3 px-6 text-[0.65rem] uppercase tracking-[0.15em] text-[#606060] font-medium w-1/3">Company</th>
                                <th className="py-3 px-6 text-[0.65rem] uppercase tracking-[0.15em] text-[#606060] font-medium">PMF Score</th>
                                <th className="py-3 px-6 text-[0.65rem] uppercase tracking-[0.15em] text-[#606060] font-medium text-right">Velocity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                            {portfolioCompanies.slice(0, 3).map((company) => (
                                <tr key={company.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group cursor-pointer">
                                    <td className="py-4 px-6 w-1/3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-xs font-medium text-white/50">
                                                {company.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white/90 text-sm mb-0.5">{company.name}</div>
                                                <div className="text-xs text-[#606060]">{company.industry}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-outfit font-light">{company.pmfScore}</span>
                                            <span className="text-xs text-[#606060]">/ 35</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-emerald-400">
                                            <Activity className="w-4 h-4" />
                                            <span className="text-sm font-medium">+2.1</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Actionable Interventions Slide-out Panel */}
            {showInterventions && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in"
                        onClick={() => setShowInterventions(false)}
                    />
                    <div className="fixed top-0 right-0 bottom-0 w-[500px] bg-[#0A0A0A] border-l border-[rgba(255,255,255,0.05)] z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-medium text-white/90">Portfolio Interventions</h2>
                                    <div className="text-xs text-[#606060]">2 Active Alerts requiring attention</div>
                                </div>
                            </div>
                            <button onClick={() => setShowInterventions(false)} className="p-2 hover:bg-white/5 rounded-full text-[#606060] hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Alert 1 */}
                            <div className="bg-[#050505] border border-red-500/20 rounded-xl overflow-hidden shadow-lg relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                                <div className="p-5 border-b border-[rgba(255,255,255,0.05)]">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-white/90 mb-1">EduStream (Edtech)</h3>
                                            <div className="text-xs text-red-400 font-medium">PMF Score dropped 12% in 30 days</div>
                                        </div>
                                        <div className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 uppercase tracking-wider font-medium">
                                            High Priority
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#808080] leading-relaxed mt-3">
                                        Customer engagement in the Enterprise tier has fallen off a cliff. Retention cohort analysis suggests onboarding friction for large accounts.
                                    </p>
                                </div>
                                
                                <div className="p-5 bg-purple-500/[0.02]">
                                    <h4 className="text-xs font-medium text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" /> AI Recommended Actions
                                    </h4>
                                    <div className="space-y-2">
                                        <button className="w-full text-left p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-colors group">
                                            <div className="text-sm text-white/90 font-medium mb-1 group-hover:text-purple-300">Schedule Pivot Strategy Call</div>
                                            <div className="text-xs text-[#606060]">Draft calendar invite to EduStream CEO</div>
                                        </button>
                                        <button className="w-full text-left p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-colors group">
                                            <div className="text-sm text-white/90 font-medium mb-1 group-hover:text-purple-300">Introduce to network expert</div>
                                            <div className="text-xs text-[#606060]">Draft email intro to Sarah Jenkins (B2B SaaS Onboarding Expert)</div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Alert 2 */}
                            <div className="bg-[#050505] border border-amber-500/20 rounded-xl overflow-hidden shadow-lg relative opacity-70">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-white/90 mb-1">AgriMarket (Agritech)</h3>
                                            <div className="text-xs text-amber-400 font-medium">Burn rate accelerating</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#808080] leading-relaxed mt-2">
                                        CAC has increased significantly in the last two quarters without a corresponding increase in LTV.
                                    </p>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
