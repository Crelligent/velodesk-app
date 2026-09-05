import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Activity, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Zap, CreditCard, BarChart2, CheckCircle2 } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isNG = user?.email === 'demo-ng@velodesk.com' || user?.user_metadata?.region === 'NG'
    // MOCK DATA FOR FEED
    const latestScore = {
        score: 84,
        calculated_at: new Date().toISOString(),
        breakdown: {
            retention: 88,
            engagement: 82,
            monetization: 91,
            growth: 76
        }
    }

    const signals = [
        {
            id: 'SIG-1042',
            source: 'AI',
            icon: Zap,
            iconColor: 'text-[#7B61FF]',
            title: 'Retention cliff detected at Day 45',
            description: 'Users failing to integrate Slack have a 40% higher churn risk. Consider forcing this step in onboarding.',
            metadata: 'VeloDesk AI detected',
            time: '2 min ago'
        },
        {
            id: 'SIG-1041',
            source: 'Stripe',
            icon: CreditCard,
            iconColor: 'text-indigo-400',
            title: 'Unexpected MRR expansion',
            description: ' upgraded to Enterprise, boosting MRR by ${isNG ? "₦2.4M" : "$2,400"}. Overall expansion revenue up 12% this week.',
            metadata: 'Stripe webhook',
            time: '45 min ago'
        },
        {
            id: 'SIG-1040',
            source: 'Mixpanel',
            icon: BarChart2,
            iconColor: 'text-sky-400',
            title: 'Core action completion rate dropped',
            description: 'The completion rate for "Create Dashboard" dropped by 8% following the latest deployment.',
            metadata: 'Mixpanel anomaly',
            time: '3 hours ago'
        },
        {
            id: 'SIG-1039',
            source: 'AI',
            icon: Zap,
            iconColor: 'text-[#7B61FF]',
            title: 'Reallocate Ad Spend for better CAC',
            description: 'Your Blended CAC has dropped 12% via LinkedIn campaigns over the last 14 days, while Meta CAC is rising. Shift ${isNG ? "₦5M" : "$5k"} budget to LinkedIn to instantly boost PMF Score by +2.',
            metadata: 'VeloDesk AI recommendation',
            time: '5 hours ago'
        }
    ]

    return (
        <div className="max-w-5xl mx-auto pb-24 bg-[#04060D] min-h-screen">
            {/* Top Row: PMF Score */}
            <div className="flex flex-col md:flex-row gap-6 p-5 mb-4 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-xl">
                <div className="flex flex-col items-center justify-center md:pr-8 md:border-r border-white/5 min-w-[140px]">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">PMF Score</div>
                    <div className="text-4xl font-light tracking-tighter tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] to-[#38BDF8]">
                        {latestScore.score}
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 justify-center">
                    {Object.entries(latestScore.breakdown).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-[11px] group cursor-default">
                            <span className="text-white/40 capitalize w-20">{key}</span>
                            <div className="flex items-center gap-3 flex-1">
                                <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#7B61FF]/80 to-[#38BDF8]/80 rounded-full"
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                                <span className="text-white/60 tabular-nums w-6 text-right">{value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Second Row: Telemetry Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* MRR Card */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-emerald-400" />
                            <div className="text-[10px] uppercase tracking-widest text-white/40">MRR</div>
                        </div>
                        <div className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-400">
                            <ArrowUpRight size={12} /> 12.4%
                        </div>
                    </div>
                    <div className="text-2xl font-light tracking-tight tabular-nums text-white/90">{isNG ? "₦142.5M" : "$142,500"}</div>
                </div>

                {/* NRR Card */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-blue-400" />
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Net Ret</div>
                        </div>
                        <div className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-400">
                            <ArrowUpRight size={12} /> 4.1%
                        </div>
                    </div>
                    <div className="text-2xl font-light tracking-tight tabular-nums text-white/90">114%</div>
                </div>

                {/* CAC Card */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <Activity size={14} className="text-[#7B61FF]" />
                            <div className="text-[10px] uppercase tracking-widest text-white/40">CAC</div>
                        </div>
                        <div className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#7B61FF]">
                            <ArrowDownRight size={12} /> 8.2%
                        </div>
                    </div>
                    <div className="text-2xl font-light tracking-tight tabular-nums text-white/90">{isNG ? "₦84,500" : "$845"}</div>
                </div>

                {/* Users Card */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <Users size={14} className="text-sky-400" />
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Users</div>
                        </div>
                        <div className="inline-flex items-center gap-0.5 text-[10px] font-medium text-sky-400">
                            <ArrowUpRight size={12} /> 18.2%
                        </div>
                    </div>
                    <div className="text-2xl font-light tracking-tight tabular-nums text-white/90">12,408</div>
                </div>
            </div>

            {/* Third Row: Economics & GTM */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Economics Panel */}
                <div className="lg:col-span-1 p-5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col gap-5">
                    <h3 className="text-sm font-medium text-white/90">Economics & Runway</h3>
                    
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Total Revenue vs Spend</div>
                        <div className="flex justify-between items-end">
                            <span className="text-lg text-emerald-400">{isNG ? '₦480M' : '$480k'}</span>
                            <span className="text-lg text-red-400">{isNG ? '₦620M' : '$620k'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-red-400/20 rounded-full mt-2 overflow-hidden flex">
                            <div className="h-full bg-emerald-400" style={{ width: '43%' }} />
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Burn to Profitability</div>
                        <div className="text-xl font-light text-white/90">{isNG ? '₦140M required' : '$140k required'}</div>
                        <div className="text-xs text-white/50 mt-1">Projected break-even in 8 months</div>
                    </div>

                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Margin Validation</div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <span className="text-sm text-white/80">LTV:CAC Ratio is 3.2x (Profitable)</span>
                        </div>
                    </div>
                </div>

                {/* GTM & Market Panel */}
                <div className="lg:col-span-2 p-5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col gap-6">
                    <h3 className="text-sm font-medium text-white/90">Go-to-Market Strategy</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Market Size (TAM)</div>
                            <div className="text-xl font-light text-white/90">{isNG ? '₦2.4 Trillion' : '$2.4 Billion'}</div>
                            <div className="text-xs text-white/50 mt-1">B2B SaaS in target region</div>
                        </div>
                        
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Beachhead Niche</div>
                            <div className="text-sm text-white/90">Mid-market FinTechs (50-200 employees)</div>
                            <div className="text-xs text-white/50 mt-1">High urgency for compliance automation</div>
                        </div>

                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Key Competitors</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70">Legacy OS Providers</span>
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70">In-house Dev Teams</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Channel Partners</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400">AWS Activate</span>
                                <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">HubSpot Agency</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content: Activity Feed */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-sm font-medium text-white/80">Activity Pulse</h2>
                    <div className="text-xs text-white/40 font-mono flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7B61FF] animate-pulse" />
                        Live Feed
                    </div>
                </div>

                <div className="border border-white/5 rounded-xl overflow-hidden bg-transparent">
                    {signals.map((signal, index) => {
                        const Icon = signal.icon;
                        return (
                            <div 
                                key={signal.id}
                                className={`group flex items-start gap-4 p-4 transition-colors hover:bg-white/[0.02] cursor-pointer ${
                                    index !== signals.length - 1 ? 'border-b border-white/5' : ''
                                }`}
                            >
                                <div className="mt-0.5">
                                    <Icon size={16} className={signal.iconColor} strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-white/40 group-hover:text-[#7B61FF]/60 transition-colors">
                                            {signal.id}
                                        </span>
                                        <h3 className="text-sm font-medium text-white/90 truncate">
                                            {signal.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-white/50 leading-relaxed mb-2 line-clamp-2">
                                        {signal.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-white/40 font-medium">
                                        <span>{signal.metadata}</span>
                                        <span>â€¢</span>
                                        <span>{signal.time}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
