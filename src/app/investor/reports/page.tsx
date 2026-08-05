'use client'

import { FileText, Sparkles, Download, FileJson, Search, ChevronRight, Calendar, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'

export default function LPReportsPage() {
    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="text-[0.65rem] text-cyan-400 uppercase tracking-[0.3em] mb-4">Fund Administration</div>
                    <h1 className="font-outfit text-4xl font-extralight tracking-tight mb-2">Automated LP Reporting</h1>
                    <p className="text-[#606060] font-light max-w-2xl">Use AI to instantly generate comprehensive quarterly updates for your Limited Partners based on live portfolio metrics.</p>
                </div>
                
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] group">
                    <Sparkles className="w-4 h-4 text-purple-600 group-hover:animate-pulse" />
                    Generate AI Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Previous Reports */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-medium text-white/80">Archived Reports</h2>
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-[#606060] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                placeholder="Search..."
                                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-full pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#606060] transition-colors w-32"
                            />
                        </div>
                    </div>

                    {[
                        { title: 'Q2 2026 Update', date: 'Jul 1, 2026', status: 'Published' },
                        { title: 'Q1 2026 Update', date: 'Apr 1, 2026', status: 'Published' },
                        { title: '2025 Annual Review', date: 'Jan 15, 2026', status: 'Published' },
                        { title: 'Q3 2025 Update', date: 'Oct 1, 2025', status: 'Published' },
                    ].map((report, i) => (
                        <div key={i} className={`p-4 rounded-xl border transition-all cursor-pointer ${i === 0 ? 'bg-white/[0.04] border-white/10' : 'bg-[#050505] border-[rgba(255,255,255,0.05)] hover:bg-white/[0.02]'}`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <FileText className={`w-4 h-4 ${i === 0 ? 'text-cyan-400' : 'text-[#606060]'}`} />
                                    <h3 className="text-sm font-medium text-white/90">{report.title}</h3>
                                </div>
                                <span className="text-[0.6rem] uppercase tracking-wider text-[#606060]">{report.status}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#606060] pl-6">
                                <Calendar className="w-3 h-3" />
                                {report.date}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Report Preview Tear Sheet */}
                <div className="lg:col-span-2">
                    <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                        
                        {/* Tear Sheet Header */}
                        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-cyan-500/10 rounded flex items-center justify-center border border-cyan-500/20">
                                    <FileText className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-medium text-white/90">Draft: Q3 2026 Portfolio Health</h2>
                                    <div className="text-xs text-[#606060] flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                        Auto-generated by Velodesk AI
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-white/5 rounded text-[#606060] hover:text-white transition-colors" title="Export JSON">
                                    <FileJson className="w-4 h-4" />
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm text-white transition-colors border border-white/5">
                                    <Download className="w-3.5 h-3.5" />
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        {/* Tear Sheet Document Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-[#0a0a0a] to-[#040404]">
                            <div className="max-w-2xl mx-auto">
                                {/* Doc Header */}
                                <div className="border-b border-white/10 pb-6 mb-8 text-center">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 mx-auto mb-4 flex items-center justify-center">
                                        <span className="font-outfit font-light tracking-widest text-white/80">ARUWA</span>
                                    </div>
                                    <h1 className="text-2xl font-outfit font-light text-white mb-2">Q3 2026 LP Update</h1>
                                    <p className="text-sm text-[#808080]">Generated October 1, 2026</p>
                                </div>

                                {/* Executive Summary */}
                                <div className="mb-8">
                                    <h3 className="text-xs uppercase tracking-widest text-cyan-400 mb-4 font-medium">Executive Summary</h3>
                                    <p className="text-sm text-[#808080] leading-relaxed mb-4">
                                        The portfolio demonstrated strong resilience in Q3 2026, driven primarily by our fintech and healthtech holdings. Aggregate Product-Market Fit (PMF) velocity increased by <span className="text-emerald-400 font-medium">+14%</span> across the active portfolio, indicating accelerating market pull and reduced customer acquisition friction.
                                    </p>
                                </div>

                                {/* Fund-Level KPIs */}
                                <div className="grid grid-cols-2 gap-4 mb-10">
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                                        <div className="text-xs text-[#606060] mb-1">Portfolio Aggregate PMF Score</div>
                                        <div className="text-2xl font-outfit font-light text-white flex items-baseline gap-2">
                                            24.8 <span className="text-sm text-[#606060]">/ 35</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                                        <div className="text-xs text-[#606060] mb-1">Top Sector (PMF Velocity)</div>
                                        <div className="text-xl font-outfit font-light text-white flex items-center gap-2">
                                            Fintech <TrendingUp className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* AI Risk Analysis */}
                                <div>
                                    <h3 className="text-xs uppercase tracking-widest text-amber-400 mb-4 font-medium flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Key Risk Areas
                                    </h3>
                                    <div className="border-l-2 border-amber-500/50 pl-4 py-1">
                                        <h4 className="text-sm font-medium text-white/90 mb-1">EduStream (EdTech)</h4>
                                        <p className="text-xs text-[#808080] leading-relaxed">
                                            AI signals indicate a <span className="text-red-400">weakening PMF score</span> driven by spiking churn in their enterprise segment over the last 30 days. Action recommended: Review pricing strategy and onboarding flow.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-12 text-center text-[10px] text-[#404040] uppercase tracking-widest">
                                    Confidential & Proprietary — Aruwa Capital Management
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
