'use client'

import React from 'react'
import { TrendingUp, Target, Rocket } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

const trajectoryData = [
    { month: 'Jan', score: 34, median: 48 },
    { month: 'Feb', score: 41, median: 49 },
    { month: 'Mar', score: 48, median: 50 },
    { month: 'Apr', score: 56, median: 51 },
    { month: 'May', score: 63, median: 51 },
    { month: 'Jun', score: 72, median: 52 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#141518] border border-white/10 p-3 rounded-lg shadow-2xl text-xs">
                <p className="text-white/60 mb-2 font-mono uppercase tracking-wider">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-white">{entry.name}:</span>
                        <span className="text-white font-medium">{entry.value}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export default function BenchmarksPage() {
    return (
        <div className="max-w-7xl mx-auto pb-24 space-y-6">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-light text-white mb-2">Cohort Benchmarks</h1>
                <p className="text-sm text-white/60 mb-4">See how your metrics stack up against 214 B2B SaaS companies in the VeloDesk network.</p>
                <div className="inline-flex items-center px-3 py-1 bg-[#7B61FF]/10 border border-[#7B61FF]/20 rounded-full text-xs text-[#7B61FF] font-medium">
                    Cohort: Series A · B2B SaaS · 214 companies
                </div>
            </div>

            {/* Percentile Strip */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                    { title: '30-Day Retention', yours: '62%', median: '52%', top25: '71%', percentile: 78, color: 'from-[#7B61FF] to-[#38BDF8]' },
                    { title: 'NPS Score', yours: '52', median: '45', top25: '62', percentile: 65, color: 'from-[#7B61FF] to-[#38BDF8]' },
                    { title: 'Revenue Growth (MoM)', yours: '14.2%', median: '11.8%', top25: '18.5%', percentile: 72, color: 'from-[#7B61FF] to-[#38BDF8]' },
                    { title: 'Activation Rate', yours: '84%', median: '68%', top25: '82%', percentile: 85, color: 'from-[#7B61FF] to-[#38BDF8]' },
                    { title: 'Time to Value', yours: '2.4 days', median: '4.1 days', top25: '2.8 days', percentile: 82, color: 'from-[#7B61FF] to-[#38BDF8]' },
                ].map((metric) => (
                    <div key={metric.title} className="p-5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">{metric.title}</div>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-2xl font-light text-white">{metric.yours}</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-3">
                            <div 
                                className={`h-full bg-gradient-to-r ${metric.color} rounded-full`} 
                                style={{ width: `${metric.percentile}%` }} 
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/30 font-mono">
                            <span>Median: {metric.median}</span>
                            <span>Top 25%: {metric.top25}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-Column Content */}
            <div className="grid grid-cols-12 gap-6 mt-8">
                
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                    
                    {/* PMF Score Trajectory */}
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl h-[350px] flex flex-col">
                        <h3 className="text-sm font-medium text-white/80 mb-6">PMF Score Trajectory</h3>
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trajectoryData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#7B61FF" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="median" stroke="rgba(255,255,255,0.2)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Cohort Median" />
                                    <Area type="monotone" dataKey="score" stroke="#7B61FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Your Score" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Score Breakdown vs Cohort */}
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col">
                        <h3 className="text-sm font-medium text-white/80 mb-6">Score Breakdown vs Cohort</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Retention', yours: 62, median: 52 },
                                { label: 'NPS', yours: 52, median: 45 },
                                { label: 'Revenue Velocity', yours: 82, median: 61 },
                                { label: 'Activation', yours: 84, median: 68 },
                            ].map((item) => (
                                <div key={item.label} className="flex flex-col gap-2">
                                    <div className="flex justify-between text-xs font-medium text-white/70">
                                        <span>{item.label}</span>
                                        <div className="flex gap-4">
                                            <span className="text-[#38BDF8]">Yours: {item.yours}%</span>
                                            <span className="text-white/40">Median: {item.median}%</span>
                                        </div>
                                    </div>
                                    <div className="relative h-2 w-full">
                                        <div className="absolute top-0 left-0 h-full bg-white/10 rounded-full" style={{ width: `${item.median}%` }} />
                                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] rounded-full opacity-80" style={{ width: `${item.yours}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                    
                    {/* Your Ranking */}
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center">
                        <h3 className="text-sm font-medium text-white/80 mb-6 self-start">Your Ranking</h3>
                        <div className="text-5xl font-light bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] mb-2">#38 of 214</div>
                        <div className="text-sm text-white/50 mb-8">Top 18% in your cohort</div>
                        
                        <div className="w-full space-y-2">
                            {[
                                { rank: 36, name: 'Anon Company', score: 74, isYou: false },
                                { rank: 37, name: 'Anon Company', score: 73, isYou: false },
                                { rank: 38, name: 'You', score: 72, isYou: true },
                                { rank: 39, name: 'Anon Company', score: 71, isYou: false },
                                { rank: 40, name: 'Anon Company', score: 70, isYou: false },
                            ].map((row) => (
                                <div key={row.rank} className={`flex items-center justify-between p-2 rounded text-sm ${row.isYou ? 'bg-[#7B61FF]/10 text-white font-medium' : 'text-white/40'}`}>
                                    <div className="flex items-center gap-4">
                                        <span className="w-6 text-right">#{row.rank}</span>
                                        <span>{row.name}</span>
                                    </div>
                                    <span className="font-mono">{row.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insights from Your Cohort */}
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col">
                        <h3 className="text-sm font-medium text-white/80 mb-6">Insights from Your Cohort</h3>
                        <div className="space-y-6">
                            {[
                                { icon: TrendingUp, text: 'Your 30-day retention of 62% puts you in the top 22%. The median for Series A B2B SaaS is just 52%.' },
                                { icon: Target, text: 'Your NPS of 52 is above the danger zone (40) but below the breakout threshold of 60. Focus on closing the gap.' },
                                { icon: Rocket, text: 'Companies in your cohort with activation rates above 80% are 3x more likely to raise a successful Series B.' },
                            ].map((insight, idx) => {
                                const Icon = insight.icon
                                return (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="p-2 rounded-lg bg-[#7B61FF]/10 shrink-0">
                                            <Icon className="w-4 h-4 text-[#7B61FF]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm text-white/80 leading-relaxed mb-2">{insight.text}</p>
                                            <span className="text-[10px] text-white/30 font-mono">Updated daily</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
