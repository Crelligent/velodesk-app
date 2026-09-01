import React from 'react'
import { Activity, MapPin } from 'lucide-react'

export default function PulsePage() {
    return (
        <div className="min-h-[calc(100vh-80px)] -mt-8 -mx-8 relative overflow-y-auto overflow-x-hidden bg-[#050505] flex flex-col justify-between p-8">
            {/* Overlay Header */}
            <div className="relative z-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-medium tracking-widest uppercase mb-4">
                    <Activity size={14} className="animate-pulse" /> Live Event Stream
                </div>
                <h1 className="text-4xl font-outfit font-extralight tracking-tight text-white mb-2">
                    The Pulse
                </h1>
                <p className="text-gray-400 text-sm max-w-sm">
                    Real-time product-market fit signals streaming directly from your integration stack.
                </p>
            </div>

            {/* Simulated Live Feed */}
            <div className="relative z-20 w-80 space-y-3 mt-8">
                <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">Live Signals</div>
                
                <div className="p-4 bg-white/[0.05] border border-white/10 rounded-lg backdrop-blur-md animate-in slide-in-from-left duration-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#FF6B35] font-mono">Payment Successful</span>
                        <span className="text-[10px] text-gray-500">Just now</span>
                    </div>
                    <div className="text-sm text-white">Stripe: $299 MRR (Pro Plan)</div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                        <MapPin size={10} /> London, UK
                    </div>
                </div>

                <div className="p-4 bg-white/[0.05] border border-white/10 rounded-lg backdrop-blur-md animate-in slide-in-from-left duration-500 delay-150 relative overflow-y-auto overflow-x-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6B35]" />
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#FF6B35] font-mono">Core Action</span>
                        <span className="text-[10px] text-gray-500">12s ago</span>
                    </div>
                    <div className="text-sm text-white">Mixpanel: Dashboard_Created</div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                        <MapPin size={10} /> Austin, TX
                    </div>
                </div>

                <div className="p-4 bg-white/[0.05] border border-white/10 rounded-lg backdrop-blur-md opacity-50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/70 font-mono">Feedback</span>
                        <span className="text-[10px] text-gray-500">45s ago</span>
                    </div>
                    <div className="text-sm text-white">Zendesk: Ticket Resolved (CSAT 5/5)</div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                        <MapPin size={10} /> Berlin, DE
                    </div>
                </div>
            </div>

            {/* Metrics Overlay Right */}
            <div className="absolute top-8 right-8 z-10 w-64 space-y-4">
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl backdrop-blur-sm">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Velocity (Last 1hr)</div>
                    <div className="text-3xl text-white font-light">142<span className="text-sm text-gray-500 ml-1">signals</span></div>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl backdrop-blur-sm">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Signal Quality</div>
                    <div className="text-3xl text-[#FF6B35] font-light">High</div>
                </div>
            </div>

            {/* High-end Data Grid Map Visual */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                {/* SVG Dotted Map Simulation */}
                <svg className="absolute w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="#ffffff" opacity="0.4" />
                        </pattern>
                        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#050505" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dot-grid)" />
                    
                    {/* Active Nodes */}
                    <circle cx="30%" cy="40%" r="4" fill="#FF6B35" className="animate-pulse" style={{ animationDuration: '2s' }} />
                    <circle cx="30%" cy="40%" r="24" fill="none" stroke="#FF6B35" strokeWidth="1" className="animate-ping opacity-20" style={{ animationDuration: '2s' }} />
                    
                    <circle cx="65%" cy="35%" r="3" fill="#FF6B35" className="animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                    <circle cx="65%" cy="35%" r="16" fill="none" stroke="#FF6B35" strokeWidth="1" className="animate-ping opacity-20" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                    
                    <circle cx="50%" cy="60%" r="5" fill="#FF6B35" className="animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
                    <circle cx="50%" cy="60%" r="40" fill="none" stroke="#FF6B35" strokeWidth="1" className="animate-ping opacity-20" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />

                    {/* Connecting Arcs */}
                    <path d="M 30% 40% Q 40% 20% 65% 35%" fill="none" stroke="#FF6B35" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" className="animate-[dash_20s_linear_infinite]" />
                    <path d="M 65% 35% Q 70% 50% 50% 60%" fill="none" stroke="#FF6B35" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" className="animate-[dash_20s_linear_infinite]" />
                </svg>
                
                {/* Center Glow */}
                <div className="absolute w-[800px] h-[800px] bg-[url(#glow)] rounded-full mix-blend-screen pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(5,5,5,0) 70%)' }} />
            </div>

            {/* Dark gradient fade for the edges */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_90%)] pointer-events-none" />
        </div>
    )
}
