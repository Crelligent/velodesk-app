'use client'

import { Activity, Zap, Server, Network, Terminal, Shield, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react'

export default function CommandCenterPage() {
    return (
        <div className="animate-fade-in max-w-full flex flex-col min-h-0 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="text-[0.65rem] text-[#7B61FF] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7B61FF] animate-pulse" /> Live Status: Operational
                    </div>
                    <h1 className="font-outfit text-4xl font-extralight tracking-tight mb-2">Fund Command Center</h1>
                    <p className="text-[#606060] font-light max-w-2xl">Macro-level intelligence across Fund I and Fund II. All systems synced.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/[0.02] border border-[rgba(255,255,255,0.05)] rounded-lg text-xs font-mono text-[#606060] flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-emerald-400" />
                        14 APIs CONNECTED
                    </div>
                </div>
            </div>

            {/* Top KPIs - The Capital Stack */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl p-5 relative overflow-hidden">
                    <div className="text-xs text-[#606060] uppercase tracking-widest mb-3">Dry Powder</div>
                    <div className="text-3xl font-outfit font-light text-white">$42.5M</div>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield className="w-16 h-16 text-white" />
                    </div>
                </div>
                
                <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl p-5 relative overflow-hidden">
                    <div className="text-xs text-[#606060] uppercase tracking-widest mb-3">Deployed Capital</div>
                    <div className="text-3xl font-outfit font-light text-white">$87.5M</div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase tracking-widest font-medium">
                        <ArrowUpRight className="w-3 h-3" /> 68% Deployed
                    </div>
                </div>

                <div className="bg-[#050505] border border-[#7B61FF]/20 rounded-xl p-5 relative overflow-hidden shadow-[0_0_20px_rgba(123,97,255,0.05)]">
                    <div className="text-xs text-[#7B61FF] uppercase tracking-widest mb-3">Projected IRR (AI)</div>
                    <div className="text-3xl font-outfit font-light text-white flex items-baseline gap-2">
                        34.2% <span className="text-sm text-[#606060]">Target: 25%</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase tracking-widest font-medium">
                        <ArrowUpRight className="w-3 h-3" /> +4.2% from PMF velocity
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#7B61FF] opacity-[0.05] blur-2xl rounded-full" />
                </div>
                
                <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl p-5 relative overflow-hidden">
                    <div className="text-xs text-[#606060] uppercase tracking-widest mb-3">Risk Exposure</div>
                    <div className="text-3xl font-outfit font-light text-amber-400">14%</div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-400 uppercase tracking-widest font-medium">
                        <ArrowDownRight className="w-3 h-3" /> EdTech Sector Volatility
                    </div>
                </div>
            </div>

            {/* Main War Room Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[450px]">
                
                {/* Left: Global Nervous System Map */}
                <div className="lg:col-span-2 bg-black border border-[rgba(255,255,255,0.05)] rounded-xl relative overflow-hidden flex items-center justify-center group">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7B61FF]/10 via-[#04060D] to-[#04060D] opacity-60" />
                    
                    {/* SVG Map/Network Abstract */}
                    <svg className="w-full h-full opacity-40 absolute inset-0 mix-blend-screen" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <g className="stroke-[#7B61FF]/30 stroke-[0.2] fill-none">
                            <path d="M10,50 Q30,20 50,50 T90,50" className="animate-[dash_10s_linear_infinite]" strokeDasharray="2 4" />
                            <path d="M20,80 Q40,40 60,60 T90,20" className="animate-[dash_15s_linear_infinite]" strokeDasharray="1 3" />
                            <path d="M10,20 Q40,60 50,30 T80,80" className="animate-[dash_12s_linear_infinite]" strokeDasharray="1.5 3.5" />
                        </g>
                    </svg>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border border-[#7B61FF]/40 bg-[#7B61FF]/5 flex items-center justify-center relative shadow-[0_0_50px_rgba(123,97,255,0.2)]">
                            <Globe className="w-8 h-8 text-[#7B61FF] animate-pulse" />
                            
                            {/* Abstract Nodes */}
                            <div className="absolute -top-12 -left-16 w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center text-[8px] text-emerald-400 bg-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">F1</div>
                            <div className="absolute top-4 -right-20 w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center text-[8px] text-emerald-400 bg-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">F2</div>
                            <div className="absolute -bottom-8 -left-8 w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center text-[8px] text-amber-400 bg-black shadow-[0_0_15px_rgba(245,158,11,0.2)]">E1</div>
                            <div className="absolute -bottom-12 right-4 w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center text-[8px] text-emerald-400 bg-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">H1</div>
                        </div>
                        <div className="mt-16 text-center relative z-20">
                            <h3 className="text-white/90 font-outfit font-medium text-lg tracking-wide">Global Data Sync Active</h3>
                            <p className="text-[#606060] text-xs mt-1">14 PortCos streaming securely to Velodesk Vault</p>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[9px] text-[#404040] uppercase font-mono tracking-widest">
                        <Terminal className="w-3 h-3" /> v2.4.1.stable
                    </div>
                </div>

                {/* Right: Live Terminal Feed */}
                <div className="bg-[#020202] border border-[rgba(255,255,255,0.05)] rounded-xl flex flex-col overflow-hidden">
                    <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.05)] bg-[#050505] flex items-center justify-between">
                        <h3 className="text-xs uppercase tracking-widest text-[#808080] font-medium flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> Live API Feed
                        </h3>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex-1 p-4 font-mono text-[10px] text-[#606060] overflow-y-auto custom-scrollbar flex flex-col justify-end space-y-3">
                        <div className="animate-fade-in"><span className="text-purple-400">[14:00:21]</span> [NexaHealth] INFO: Stripe MRR sync completed. (+2.4% MoM)</div>
                        <div className="animate-fade-in"><span className="text-purple-400">[14:02:11]</span> [OmniChain] WARN: Burn rate exceeded threshold. Flagging for review.</div>
                        <div className="animate-fade-in"><span className="text-purple-400">[14:05:44]</span> [LogisX] INFO: Plaid banking sync completed. Runway updated to 18m.</div>
                        <div className="animate-fade-in"><span className="text-purple-400">[14:10:02]</span> [EduStream] ERROR: HubSpot integration token expired. Alerting founder.</div>
                        <div className="animate-fade-in"><span className="text-purple-400">[14:12:35]</span> [System] INFO: Calculating aggregate PMF velocities...</div>
                        <div className="animate-fade-in"><span className="text-purple-400">[14:12:38]</span> [System] SUCCESS: Command Center dashboard state refreshed.</div>
                        <div className="animate-fade-in text-emerald-400"><span className="text-purple-400">[14:15:00]</span> [PayFlow] AWAITING INCOMING CONNECTION...</div>
                        
                        {/* Blinking cursor */}
                        <div className="w-2 h-3 bg-[#606060] animate-pulse mt-2" />
                    </div>
                </div>
            </div>
            
            {/* Inline CSS for the dashboard lines */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes dash {
                    to {
                        stroke-dashoffset: -100;
                    }
                }
            `}} />
        </div>
    )
}
