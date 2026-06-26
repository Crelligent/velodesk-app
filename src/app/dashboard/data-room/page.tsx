'use client'

import React from 'react'
import { Download, Share2, FileText, PieChart, Users, Lock, CheckCircle2, Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

const revenueData = [
    { month: 'Jan', mrr: 85, projected: null },
    { month: 'Feb', mrr: 94, projected: null },
    { month: 'Mar', mrr: 105, projected: null },
    { month: 'Apr', mrr: 118, projected: null },
    { month: 'May', mrr: 130, projected: null },
    { month: 'Jun', mrr: 142.5, projected: null },
    { month: 'Jul', mrr: null, projected: 160 },
    { month: 'Aug', mrr: null, projected: 180 },
    { month: 'Sep', mrr: null, projected: 205 },
    { month: 'Oct', mrr: null, projected: 225 },
    { month: 'Nov', mrr: null, projected: 250 },
    { month: 'Dec', mrr: null, projected: 280 },
]

const metricsTableData = [
    { month: 'Jan', mrr: '$85K', users: '6,200', churn: '4.8%', nps: '32', pmfScore: '34' },
    { month: 'Feb', mrr: '$94K', users: '7,100', churn: '4.2%', nps: '36', pmfScore: '41' },
    { month: 'Mar', mrr: '$105K', users: '8,400', churn: '3.8%', nps: '40', pmfScore: '48' },
    { month: 'Apr', mrr: '$118K', users: '9,600', churn: '3.5%', nps: '44', pmfScore: '56' },
    { month: 'May', mrr: '$130K', users: '11,200', churn: '3.3%', nps: '48', pmfScore: '63' },
    { month: 'Jun', mrr: '$142.5K', users: '12,400', churn: '3.2%', nps: '52', pmfScore: '72' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#141518] border border-white/10 p-3 rounded-lg shadow-2xl text-xs">
                <p className="text-white/60 mb-2 font-mono uppercase tracking-wider">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-white capitalize">{entry.name}:</span>
                        <span className="text-white font-medium">${entry.value}K</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export default function DataRoomPage() {
    return (
        <div className="max-w-7xl mx-auto pb-24 space-y-6">
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-light text-white mb-2">Investor Data Room</h1>
                    <p className="text-sm text-white/60">Auto-generated metrics, reports, and board-ready exports — powered by your live integrations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white/80 hover:bg-white/[0.05] transition-colors">
                        <Share2 className="w-4 h-4" /> Share Data Room Link
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#7B61FF] text-white rounded-lg text-sm font-medium hover:bg-[#6A50E5] transition-colors">
                        <Download className="w-4 h-4" /> Export Board Report (PDF)
                    </button>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Current MRR', value: '$142,500', trend: '+12.4% MoM', trendColor: 'text-emerald-400' },
                    { title: 'Net Revenue Retention', value: '114%', trend: '+4.1%', trendColor: 'text-emerald-400' },
                    { title: 'Burn Multiple', value: '1.8x', trend: '-0.3x', trendColor: 'text-emerald-400' },
                    { title: 'Runway', value: '18 months', trend: 'at current burn rate', trendColor: 'text-white/40' },
                ].map((metric) => (
                    <div key={metric.title} className="p-5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{metric.title}</div>
                        <div className="text-2xl font-light text-white mb-2">{metric.value}</div>
                        <div className={`text-xs ${metric.trendColor}`}>{metric.trend}</div>
                    </div>
                ))}
            </div>

            {/* Two-Column Content */}
            <div className="grid grid-cols-12 gap-6 mt-8">
                
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                    
                    {/* Revenue Trajectory */}
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl h-[350px] flex flex-col">
                        <h3 className="text-sm font-medium text-white/80 mb-6">Revenue Trajectory (6-Month)</h3>
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#7B61FF" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="projected" stroke="rgba(255,255,255,0.2)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Projected" connectNulls />
                                    <Area type="monotone" dataKey="mrr" stroke="#7B61FF" strokeWidth={3} fillOpacity={1} fill="url(#colorMRR)" name="Actual MRR" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Key Metrics Over Time */}
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
                        <h3 className="text-sm font-medium text-white/80 mb-6">Key Metrics Over Time</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40">
                                        <th className="pb-3 font-normal">Month</th>
                                        <th className="pb-3 font-normal">MRR</th>
                                        <th className="pb-3 font-normal">Users</th>
                                        <th className="pb-3 font-normal">Churn</th>
                                        <th className="pb-3 font-normal">NPS</th>
                                        <th className="pb-3 font-normal">PMF Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metricsTableData.map((row, i) => (
                                        <tr key={row.month} className={`border-b border-white/5 text-sm ${i === metricsTableData.length - 1 ? 'border-b-0' : ''}`}>
                                            <td className="py-3 text-white/60">{row.month}</td>
                                            <td className="py-3 text-white">{row.mrr}</td>
                                            <td className="py-3 text-white/80">{row.users}</td>
                                            <td className="py-3 text-white/80">{row.churn}</td>
                                            <td className="py-3 text-white/80">{row.nps}</td>
                                            <td className="py-3 text-[#38BDF8] font-medium">{row.pmfScore}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                    
                    {/* Auto-Generated Reports */}
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col">
                        <h3 className="text-sm font-medium text-white/80 mb-6">Auto-Generated Reports</h3>
                        
                        <div className="space-y-4">
                            {[
                                { title: 'Monthly Board Report', desc: 'Comprehensive board update with all key metrics, cohort analysis, and AI recommendations.', icon: FileText, status: 'Generated 2h ago', statusColor: 'text-emerald-400', actions: ['View', 'Download PDF'] },
                                { title: 'Investor One-Pager', desc: 'A concise, investor-ready summary of your PMF metrics and trajectory.', icon: PieChart, status: 'Ready', statusColor: 'text-white/40', actions: ['View', 'Share'] },
                                { title: 'Cohort Deep Dive', desc: 'Detailed retention curves, activation funnels, and expansion revenue analysis.', icon: Users, status: 'Generating...', statusColor: 'text-[#38BDF8]', actions: ['View when ready'], isLoading: true },
                            ].map((report) => {
                                const Icon = report.icon
                                return (
                                    <div key={report.title} className="p-5 bg-[#111]/50 border border-white/5 rounded-xl flex flex-col">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="p-2 bg-white/5 rounded-lg text-white/60">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-white/90 mb-1">{report.title}</h4>
                                                <p className="text-xs text-white/50 leading-relaxed mb-3">{report.desc}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className={`flex items-center gap-1.5 text-[10px] font-mono ${report.statusColor}`}>
                                                        {report.isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                                        {!report.isLoading && <CheckCircle2 className="w-3 h-3" />}
                                                        {report.status}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {report.actions.map((action, i) => (
                                                            <button key={action} className={`text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors ${i === 0 ? 'text-white/80' : 'text-white/50'}`}>
                                                                {action}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Data Collection Summary */}
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col">
                        <h3 className="text-sm font-medium text-white/80 mb-6">Data Collection Summary</h3>
                        
                        <div className="space-y-4 mb-6 text-sm">
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <span className="text-white/60">Connected Integrations</span>
                                <div className="flex items-center gap-2 text-white">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-[#635BFF]" title="Stripe" />
                                        <div className="w-2 h-2 rounded-full bg-[#8A3FFC]" title="Mixpanel" />
                                        <div className="w-2 h-2 rounded-full bg-[#FF7A59]" title="HubSpot" />
                                        <div className="w-2 h-2 rounded-full bg-[#286EFA]" title="Intercom" />
                                    </div>
                                    <span className="font-medium ml-2">4</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <span className="text-white/60">Data Points Collected</span>
                                <span className="text-white font-medium">2.4M</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <span className="text-white/60">Last Sync</span>
                                <span className="text-emerald-400 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    2 minutes ago
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-3">
                                <span className="text-white/60">PMF Score Snapshots</span>
                                <span className="text-white font-medium">184</span>
                            </div>
                        </div>

                        <div className="flex gap-3 items-center p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-white/40">
                            <Lock className="w-4 h-4 shrink-0" />
                            <p>All data is encrypted at rest and in transit. SOC 2 Type II compliant.</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
