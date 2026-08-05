'use client'

import { useState } from 'react'
import { Activity, TrendingUp, AlertTriangle, Building2, ChevronRight, Search, Filter } from 'lucide-react'

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

                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-[0.03] blur-3xl rounded-full" />
                    <div className="flex items-center gap-3 text-[#606060] mb-4 relative z-10">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[0.7rem] uppercase tracking-[0.15em]">Critical Alerts</span>
                    </div>
                    <div className="text-4xl font-outfit font-light mb-1 relative z-10">2</div>
                    <div className="text-sm text-red-400 relative z-10">
                        Negative signals detected
                    </div>
                </div>
            </div>

            {/* Portfolio Table */}
            <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                    <h2 className="text-lg font-outfit font-medium text-white/90">Portfolio Performance</h2>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 text-[#606060] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                placeholder="Search companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#606060] transition-colors w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.05)] rounded-lg text-sm text-[#808080] transition-colors">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
                                <th className="py-4 px-6 text-[0.65rem] uppercase tracking-[0.15em] text-[#606060] font-medium">Company</th>
                                <th className="py-4 px-6 text-[0.65rem] uppercase tracking-[0.15em] text-[#606060] font-medium">Stage</th>
                                <th className="py-4 px-6 text-[0.65rem] uppercase tracking-[0.15em] text-[#606060] font-medium">PMF Score</th>
                                <th className="py-4 px-6 text-[0.65rem] uppercase tracking-[0.15em] text-[#606060] font-medium">Status</th>
                                <th className="py-4 px-6 text-[0.65rem] uppercase tracking-[0.15em] text-[#606060] font-medium">Signal Trend</th>
                                <th className="py-4 px-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                            {filteredCompanies.map((company) => (
                                <tr key={company.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group cursor-pointer">
                                    <td className="py-4 px-6">
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
                                    <td className="py-4 px-6 text-sm text-[#808080] capitalize">
                                        {company.stage}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-outfit font-light">{company.pmfScore}</span>
                                            <span className="text-xs text-[#606060]">/ 35</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[0.65rem] uppercase tracking-wider font-medium border ${
                                            company.status === 'Strong' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            company.status === 'Developing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            company.status === 'Weak Signal' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {company.signal === 'positive' && <Activity className="w-4 h-4 text-emerald-500" />}
                                            {company.signal === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                            {company.signal === 'negative' && <Activity className="w-4 h-4 text-red-500" />}
                                            <span className="text-xs text-[#606060]">{company.lastUpdated}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <ChevronRight className="w-4 h-4 text-[#404040] group-hover:text-white transition-colors ml-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredCompanies.length === 0 && (
                        <div className="p-12 text-center text-[#606060] text-sm">
                            No companies match your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
