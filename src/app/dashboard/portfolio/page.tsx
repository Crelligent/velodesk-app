'use client'

import React from 'react'
import { LayoutDashboard, TrendingUp, AlertTriangle, Building, ArrowUpRight, Search, Filter } from 'lucide-react'

// Mock Data
const PORTFOLIO_STATS = [
    { label: 'Active Startups', value: '42', change: '+3 this month', icon: Building, color: 'text-[#7B61FF]', bg: 'bg-[#7B61FF]/10' },
    { label: 'Avg Portfolio PMF Score', value: '68/100', change: '+2.4 vs last month', icon: LayoutDashboard, color: 'text-[#5B8DEF]', bg: 'bg-[#5B8DEF]/10' },
    { label: 'Total MRR', value: '$1.4M', change: '+12% MoM', icon: TrendingUp, color: 'text-[#00B67A]', bg: 'bg-[#00B67A]/10' },
    { label: 'High Churn Risk', value: '4', change: 'Needs intervention', icon: AlertTriangle, color: 'text-[#FF6B35]', bg: 'bg-[#FF6B35]/10' },
]

const STARTUPS = [
    { name: 'Nexus AI', batch: 'W26', pmfScore: 84, mrr: '$45,000', momGrowth: '+18%', risk: 'Low', status: 'Healthy' },
    { name: 'Sentient', batch: 'W26', pmfScore: 72, mrr: '$12,400', momGrowth: '+5%', risk: 'Medium', status: 'Monitor' },
    { name: 'Kortex', batch: 'S25', pmfScore: 41, mrr: '$8,000', momGrowth: '-2%', risk: 'High', status: 'Intervention Required' },
    { name: 'Velocity', batch: 'W26', pmfScore: 91, mrr: '$112,000', momGrowth: '+22%', risk: 'Low', status: 'Breakout' },
    { name: 'Odin', batch: 'S25', pmfScore: 65, mrr: '$24,000', momGrowth: '+8%', risk: 'Medium', status: 'Healthy' },
]

export default function PortfolioPage() {
    return (
        <div className="p-8 pb-32 max-w-7xl mx-auto font-outfit">
            <header className="mb-8">
                <h1 className="text-3xl font-medium text-white tracking-tight mb-2">Accelerator Portfolio</h1>
                <p className="text-white/50 text-sm">Real-time aggregated telemetry for your current and past batches.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {PORTFOLIO_STATS.map((stat, i) => (
                    <div key={i} className="bg-[#090A10] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-white/50 text-xs tracking-wider uppercase mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-medium text-white mb-1">{stat.value}</h3>
                            <p className="text-white/40 text-xs">{stat.change}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Portfolio Table Area */}
            <div className="bg-[#090A10] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-medium text-white">Startup Directory</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="Search startups..." 
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#7B61FF] transition-colors w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <button className="px-4 py-2 bg-[#7B61FF] hover:bg-[#6A52E5] text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(123,97,255,0.3)]">
                            Export Report
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="py-4 px-6 text-xs font-mono tracking-widest uppercase text-white/40 font-medium">Startup</th>
                                <th className="py-4 px-6 text-xs font-mono tracking-widest uppercase text-white/40 font-medium">Batch</th>
                                <th className="py-4 px-6 text-xs font-mono tracking-widest uppercase text-white/40 font-medium">PMF Score</th>
                                <th className="py-4 px-6 text-xs font-mono tracking-widest uppercase text-white/40 font-medium">MRR</th>
                                <th className="py-4 px-6 text-xs font-mono tracking-widest uppercase text-white/40 font-medium">MoM Growth</th>
                                <th className="py-4 px-6 text-xs font-mono tracking-widest uppercase text-white/40 font-medium">Status</th>
                                <th className="py-4 px-6 text-xs font-mono tracking-widest uppercase text-white/40 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {STARTUPS.map((startup, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-white">{startup.name}</div>
                                    </td>
                                    <td className="py-4 px-6 text-white/60 text-sm">{startup.batch}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full max-w-[100px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${startup.pmfScore >= 80 ? 'bg-[#00B67A]' : startup.pmfScore >= 60 ? 'bg-[#5B8DEF]' : 'bg-[#FF6B35]'}`}
                                                    style={{ width: `${startup.pmfScore}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-white">{startup.pmfScore}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-white/80 font-mono text-sm">{startup.mrr}</td>
                                    <td className="py-4 px-6">
                                        <span className={`text-sm font-medium ${startup.momGrowth.startsWith('+') ? 'text-[#00B67A]' : 'text-[#FF6B35]'}`}>
                                            {startup.momGrowth}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                                            startup.risk === 'Low' ? 'bg-[#00B67A]/10 text-[#00B67A] border border-[#00B67A]/20' : 
                                            startup.risk === 'Medium' ? 'bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/20' : 
                                            'bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20'
                                        }`}>
                                            {startup.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
