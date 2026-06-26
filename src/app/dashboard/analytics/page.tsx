'use client'

import React from 'react'
import { Sparkles, Info } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar,
    ScatterChart, Scatter, ZAxis,
    LineChart, Line, ComposedChart, Legend, ReferenceLine
} from 'recharts'

// --- MOCK DATA ---
const COLORS = ['#7B61FF', '#38BDF8', '#FF6B35', '#00B67A']

// Section 0: Overview & Telemetry (Original Charts)
const trajectoryData = [
    { month: 'Jan', score: 45, benchmark: 50 },
    { month: 'Feb', score: 52, benchmark: 51 },
    { month: 'Mar', score: 58, benchmark: 52 },
    { month: 'Apr', score: 65, benchmark: 54 },
    { month: 'May', score: 72, benchmark: 55 },
    { month: 'Jun', score: 84, benchmark: 56 },
]

const segmentationData = [
    { name: 'Enterprise', value: 45 },
    { name: 'Mid-Market', value: 35 },
    { name: 'SMB', value: 20 },
]

const churnData = [
    { reason: 'Pricing', count: 120 },
    { reason: 'Missing Feature', count: 98 },
    { reason: 'Hard to Use', count: 45 },
    { reason: 'Buggy', count: 30 },
]

// Section 1: Unit Economics
const ltvCacData = [
    { month: 'Jan', ltv: 1200, cac: 500, ratio: 2.4 },
    { month: 'Feb', ltv: 1250, cac: 480, ratio: 2.6 },
    { month: 'Mar', ltv: 1400, cac: 450, ratio: 3.1 },
    { month: 'Apr', ltv: 1550, cac: 440, ratio: 3.5 },
    { month: 'May', ltv: 1800, cac: 420, ratio: 4.2 },
    { month: 'Jun', ltv: 2100, cac: 400, ratio: 5.2 },
]

const quickRatioData = [
    { month: 'Jan', ratio: 2.5 },
    { month: 'Feb', ratio: 3.4 },
    { month: 'Mar', ratio: 4.1 },
    { month: 'Apr', ratio: 3.8 },
    { month: 'May', ratio: 5.2 },
    { month: 'Jun', ratio: 6.7 },
]

const magicNumberData = [
    { quarter: 'Q1 2025', magicNumber: 0.6 },
    { quarter: 'Q2 2025', magicNumber: 0.8 },
    { quarter: 'Q3 2025', magicNumber: 0.9 },
    { quarter: 'Q4 2025', magicNumber: 1.2 },
    { quarter: 'Q1 2026', magicNumber: 1.5 },
    { quarter: 'Q2 2026', magicNumber: 1.8 },
]

// Section 2: Engagement
const ttvData = [
    { hours: '< 1 hr', users: 450 },
    { hours: '1-6 hrs', users: 320 },
    { hours: '6-24 hrs', users: 150 },
    { hours: '1-3 days', users: 80 },
    { hours: '3+ days', users: 40 },
]

const featureMatrixData = [
    { x: 85, y: 92, z: 500, name: 'Automated Reports' },
    { x: 75, y: 88, z: 400, name: 'Slack Integration' },
    { x: 20, y: 85, z: 200, name: 'Custom Webhooks' },
    { x: 15, y: 90, z: 150, name: 'SSO' },
    { x: 65, y: 40, z: 300, name: 'CSV Export' },
    { x: 10, y: 20, z: 100, name: 'Dark Mode' },
]

const dauMauData = [
    { name: 'Power (16+ days)', value: 45 },
    { name: 'Core (5-15 days)', value: 35 },
    { name: 'Casual (1-4 days)', value: 20 },
]

// Section 3: Revenue Quality
const retentionSpreadData = [
    { month: 'Jan', nrr: 102, grr: 95 },
    { month: 'Feb', nrr: 105, grr: 94 },
    { month: 'Mar', nrr: 110, grr: 94 },
    { month: 'Apr', nrr: 116, grr: 93 },
    { month: 'May', nrr: 122, grr: 93 },
    { month: 'Jun', nrr: 131, grr: 92 },
]


// --- CUSTOM COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#141518] border border-white/10 p-3 rounded-lg shadow-2xl text-xs z-50 relative">
                <p className="text-white/60 mb-2 font-mono uppercase tracking-wider">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                        <span className="text-white capitalize">{entry.name}:</span>
                        <span className="text-white font-medium">{entry.value}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

const FeatureMatrixTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#141518] border border-white/10 p-3 rounded-lg shadow-2xl text-xs z-50 relative">
                <p className="text-white font-medium mb-2">{data.name}</p>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/60">Adoption:</span>
                    <span className="text-white">{data.x}%</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/60">Retention:</span>
                    <span className="text-white">{data.y}%</span>
                </div>
            </div>
        )
    }
    return null
}

const ChartCard = ({ title, description, children, className = "" }: { title: string, description?: string, children: React.ReactNode, className?: string }) => (
    <div className={`p-6 bg-[#090A10] border border-white/5 rounded-2xl flex flex-col shadow-xl ${className}`}>
        <div className="mb-6">
            <h3 className="text-sm font-medium text-white tracking-wide mb-1 flex items-center gap-2">
                {title} <Info className="w-3.5 h-3.5 text-white/20" />
            </h3>
            {description && <p className="text-xs text-white/40">{description}</p>}
        </div>
        <div className="flex-1 w-full relative">
            {children}
        </div>
    </div>
)

export default function AnalyticsPage() {
    return (
        <div className="max-w-7xl mx-auto pb-24 space-y-12">
            
            {/* Header & AI Banner */}
            <div>
                <h1 className="text-3xl font-light mb-6 text-white tracking-tight">Advanced Analytics Data Room</h1>
                
                <div className="p-5 bg-gradient-to-r from-[#7B61FF]/10 to-transparent border border-[#7B61FF]/20 rounded-xl flex items-start gap-4 shadow-lg mb-8">
                    <Sparkles className="w-5 h-5 text-[#7B61FF] mt-0.5 shrink-0" />
                    <div>
                        <div className="text-sm font-medium text-white mb-1.5">VeloDesk AI Recommendation: Reallocate Ad Spend</div>
                        <div className="text-sm text-white/60 leading-relaxed max-w-4xl">
                            Your Blended CAC has dropped 12% via LinkedIn campaigns over the last 14 days, while Meta CAC is rising. Shift $5k budget to LinkedIn to instantly boost your LTV:CAC ratio and push your PMF Score by +2 points.
                        </div>
                    </div>
                </div>

                {/* Metric Cards (Original) */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { title: 'Active Users', value: '12.4k', change: '+12%', positive: true },
                        { title: 'Session Time', value: '4m 32s', change: '+8%', positive: true },
                        { title: 'Adoption', value: '68%', change: '+5%', positive: true },
                        { title: 'Churn Rate', value: '3.2%', change: '-0.5%', positive: true },
                        { title: 'Avg LTV', value: '$847', change: '+15%', positive: true },
                        { title: 'Avg CAC', value: '$125', change: '+8%', positive: false },
                    ].map((metric) => (
                        <div key={metric.title} className="p-4 bg-[#090A10] border border-white/5 rounded-xl flex flex-col shadow-xl">
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-mono">{metric.title}</div>
                            <div className="text-xl font-light mb-1 text-white">{metric.value}</div>
                            <div className={`text-[11px] font-medium ${metric.positive ? 'text-[#00B67A]' : 'text-[#FF6B35]'}`}>
                                {metric.positive ? '↑' : '↓'} {metric.change}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION 0: PRODUCT TELEMETRY (Original Charts) */}
            <div className="space-y-6">
                <div className="border-b border-white/10 pb-2">
                    <h2 className="text-xl font-medium text-white">Overview & Telemetry</h2>
                    <p className="text-sm text-white/40">High-level trajectory and core user base metrics.</p>
                </div>
                
                {/* PMF Score Trajectory */}
                <ChartCard title="PMF Score Trajectory vs Benchmark" className="h-[350px]">
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
                            <Area type="monotone" dataKey="benchmark" stroke="rgba(255,255,255,0.2)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Industry Avg" />
                            <Area type="monotone" dataKey="score" stroke="#7B61FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Your Score" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active User Segmentation */}
                    <ChartCard title="Active User Segmentation" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={segmentationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {segmentationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <div className="text-2xl font-light text-white">12.4k</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest">Total Users</div>
                        </div>
                    </ChartCard>

                    {/* Primary Churn Drivers */}
                    <ChartCard title="Primary Churn Drivers" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={churnData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis dataKey="reason" type="category" stroke="rgba(255,255,255,0.6)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="count" fill="#38BDF8" radius={[0, 4, 4, 0]} barSize={20} name="Dropped Users" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>

            {/* SECTION 1: UNIT ECONOMICS */}
            <div className="space-y-6 pt-6">
                <div className="border-b border-white/10 pb-2">
                    <h2 className="text-xl font-medium text-white">1. Unit Economics & Efficiency</h2>
                    <p className="text-sm text-white/40">Metrics that prove your growth is highly profitable and scalable.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LTV:CAC Ratio Over Time */}
                    <ChartCard 
                        title="LTV to CAC Ratio" 
                        description="The holy grail. Area is shaded green when ratio exceeds 3:1."
                        className="h-[350px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={ltvCacData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                
                                <Area yAxisId="left" type="monotone" dataKey="ltv" stroke="#00B67A" strokeWidth={2} fill="#00B67A" fillOpacity={0.1} name="LTV" />
                                <Line yAxisId="left" type="monotone" dataKey="cac" stroke="#FF6B35" strokeWidth={2} dot={{ r: 3 }} name="CAC" />
                                <Line yAxisId="right" type="monotone" dataKey="ratio" stroke="#38BDF8" strokeWidth={2} strokeDasharray="5 5" name="Ratio (x)" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <div className="grid grid-rows-2 gap-6">
                        {/* Quick Ratio */}
                        <ChartCard 
                            title="SaaS Quick Ratio" 
                            description="(New MRR + Expansion) / (Churn + Downgrade). >4 is excellent."
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={quickRatioData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                    <ReferenceLine y={4} stroke="#00B67A" strokeDasharray="3 3" />
                                    <Bar dataKey="ratio" fill="#7B61FF" radius={[4, 4, 0, 0]} barSize={30} name="Quick Ratio" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Magic Number */}
                        <ChartCard 
                            title="Sales Efficiency (Magic Number)" 
                            description="ARR generated per $1 spent on S&M. >1.0 is highly efficient."
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={magicNumberData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="quarter" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                    <ReferenceLine y={1.0} stroke="#00B67A" strokeDasharray="3 3" />
                                    <Line type="stepAfter" dataKey="magicNumber" stroke="#38BDF8" strokeWidth={3} dot={{ r: 4, fill: '#0C0E1A', strokeWidth: 2 }} name="Magic Number" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </div>
            </div>

            {/* SECTION 2: ENGAGEMENT */}
            <div className="space-y-6 pt-6">
                <div className="border-b border-white/10 pb-2">
                    <h2 className="text-xl font-medium text-white">2. Deep Engagement & "Aha!" Metrics</h2>
                    <p className="text-sm text-white/40">Metrics that prove users find immediate, sticky value in your product.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Time to Value */}
                    <ChartCard 
                        title="Time-to-Value (TTV) Histogram" 
                        description="Time from signup to first 'Aha' moment."
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ttvData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis dataKey="hours" type="category" stroke="rgba(255,255,255,0.6)" fontSize={11} tickLine={false} axisLine={false} width={60} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="users" fill="#00B67A" radius={[0, 4, 4, 0]} barSize={24} name="Users" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Feature Matrix */}
                    <ChartCard 
                        title="Feature Matrix (Adoption vs Retention)" 
                        description="X-Axis: Adoption %. Y-Axis: Retention %."
                        className="h-[300px] lg:col-span-2"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="x" name="Adoption" unit="%" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <YAxis type="number" dataKey="y" name="Retention" unit="%" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <ZAxis type="number" dataKey="z" range={[100, 800]} name="Volume" />
                                <RechartsTooltip content={<FeatureMatrixTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
                                
                                {/* Quadrant Dividers */}
                                <ReferenceLine x={50} stroke="rgba(255,255,255,0.1)" />
                                <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" />
                                
                                <Scatter name="Features" data={featureMatrixData} fill="#7B61FF" fillOpacity={0.7} />
                            </ScatterChart>
                        </ResponsiveContainer>
                        {/* Matrix Labels */}
                        <div className="absolute top-16 left-16 text-[10px] font-mono text-white/20 uppercase">Hidden Gems</div>
                        <div className="absolute top-16 right-16 text-[10px] font-mono text-[#00B67A]/40 uppercase">Aha! Moments</div>
                        <div className="absolute bottom-8 left-16 text-[10px] font-mono text-white/20 uppercase">Dead Weight</div>
                        <div className="absolute bottom-8 right-16 text-[10px] font-mono text-white/20 uppercase">Table Stakes</div>
                    </ChartCard>
                </div>
            </div>

            {/* SECTION 3: REVENUE QUALITY */}
            <div className="space-y-6 pt-6">
                <div className="border-b border-white/10 pb-2">
                    <h2 className="text-xl font-medium text-white">3. Revenue Quality</h2>
                    <p className="text-sm text-white/40">Metrics that prove "Land and Expand" mechanics.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* NRR vs GRR Spread */}
                    <ChartCard 
                        title="NRR vs GRR Spread" 
                        description="The growing gap represents massive organic seat expansion."
                        className="h-[350px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={retentionSpreadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} domain={[80, 140]} tickFormatter={(val) => `${val}%`} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                
                                <ReferenceLine y={100} stroke="rgba(255,255,255,0.2)" strokeDasharray="5 5" />
                                
                                <Area type="monotone" dataKey="nrr" stroke="#38BDF8" strokeWidth={3} fill="#38BDF8" fillOpacity={0.1} name="Net Revenue Ret." />
                                <Area type="monotone" dataKey="grr" stroke="#FF6B35" strokeWidth={2} fill="transparent" name="Gross Revenue Ret." />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* DAU/MAU Depth */}
                    <ChartCard 
                        title="Active User Depth" 
                        description="Breakdown of active users by log-in frequency."
                        className="h-[350px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dauMauData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {dauMauData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+10px)] text-center pointer-events-none">
                            <div className="text-3xl font-light text-white">45%</div>
                            <div className="text-[10px] text-[#7B61FF] uppercase tracking-widest mt-1">Power Users</div>
                        </div>
                    </ChartCard>
                </div>
            </div>

        </div>
    )
}
