'use client'

import { useState } from 'react'
import { X, Minus, Maximize2, Paperclip, ArrowUp, GitPullRequest, ChevronDown, CheckCircle2 } from 'lucide-react'

export default function AIAgentWindow() {
    const [isMinimized, setIsMinimized] = useState(false)

    return (
        <div className={`fixed bottom-4 right-4 bg-[#141518] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col font-sans overflow-hidden transition-all duration-300 ${isMinimized ? 'w-[250px] h-[48px]' : 'w-[400px]'}`}>
            {/* Top Header */}
            <div 
                className="flex items-center justify-between px-3 h-[48px] cursor-pointer"
                onClick={() => isMinimized && setIsMinimized(false)}
            >
                <div className="flex items-center gap-1.5">
                    <img 
                        src="/velodesk (2).png" 
                        alt="VeloDesk AI Logo" 
                        className="w-7 h-7 object-contain shrink-0"
                    />
                    <span className="text-sm font-medium text-white truncate">VeloDesk AI</span>
                    {!isMinimized && (
                        <span className="bg-white/[0.04] text-[10px] text-white/50 px-1.5 py-0.5 rounded border border-white/5 shrink-0">
                            Opus 4.8
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-white/40 shrink-0">
                    {!isMinimized && (
                        <button 
                            className="hover:text-white transition"
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(true) }}
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {isMinimized && (
                        <button 
                            className="hover:text-white transition"
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(false) }}
                        >
                            <Maximize2 className="w-3 h-3" />
                        </button>
                    )}
                    <button className="hover:text-white transition"><X className="w-4 h-4" /></button>
                </div>
            </div>
            
            {/* Main Content Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 px-4 py-3 text-sm text-white/80 space-y-4">
                
                {/* Connection Activity */}
                <div className="flex items-center gap-2 text-[13px] text-white/50">
                    <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=32&h=32&q=80" 
                        alt="alex" 
                        className="w-4 h-4 rounded-full"
                    />
                    <span>alex asked VeloDesk AI to analyze the Q3 PMF drop</span>
                </div>

                {/* Agent Status */}
                <div className="text-[13px]">
                    Examining Stripe & Mixpanel telemetry...
                </div>

                {/* Timer */}
                <div className="flex items-center gap-1 text-[11px] text-white/40 cursor-pointer hover:text-white/60 transition w-fit">
                    Worked for 12s <ChevronDown className="w-3 h-3 ml-0.5" />
                </div>

                {/* Agent Action */}
                <div className="text-[13px] font-medium text-white/90">
                    Found the root cause. I've drafted an impact report. Findings:
                </div>

                {/* Bullet Points */}
                <ul className="text-[13px] space-y-2.5 ml-1">
                    <li className="flex items-start gap-2">
                        <span className="text-white/30 mt-0.5">•</span>
                        <span className="leading-relaxed">
                            <span className="bg-[#7B61FF]/10 text-[#7B61FF] font-mono text-[11px] px-1.5 py-0.5 rounded border border-[#7B61FF]/20">Mixpanel</span>
                            <span className="text-white/60"> : 45-day retention cliff strongly correlates with skipped Slack integrations.</span>
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-white/30 mt-0.5">•</span>
                        <span className="leading-relaxed">
                            <span className="bg-[#38BDF8]/10 text-[#38BDF8] font-mono text-[11px] px-1.5 py-0.5 rounded border border-[#38BDF8]/20">Stripe</span>
                            <span className="text-white/60"> : Enterprise MRR expansion (+14%) successfully offset the SMB churn.</span>
                        </span>
                    </li>
                </ul>

                {/* Draft Report Box */}
                <div className="bg-[#1C1D21] border border-white/5 rounded-lg p-3 mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-[12px] font-medium text-white/90 flex items-center gap-1.5">
                            Analyzed 2.4M events 
                            <span className="text-[#38BDF8]/90 text-[11px] ml-1 border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-1 rounded">High Confidence</span>
                        </div>
                        <button className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[11px] font-medium transition text-white/80">
                            <CheckCircle2 className="w-3 h-3" /> Preview
                        </button>
                    </div>
                    
                    <div className="flex items-start gap-2 text-[13px] text-white/80">
                        <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center bg-white/10 rounded">
                            <div className="w-2 h-2 bg-[#7B61FF] rounded-sm" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">Draft Q3 PMF Impact Report</span>
                            <span className="text-[11px] text-white/40 font-mono tracking-tight">nexus-ai/workspace ← auto-generated-report-65a6</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Input */}
            <div className="p-3 pt-0">
                <div className="bg-[#1C1D21]/50 border border-white/10 rounded-lg p-2.5 flex flex-col gap-2 transition focus-within:border-white/20 focus-within:bg-[#1C1D21]">
                    <textarea 
                        rows={1}
                        placeholder="Tell VeloDesk what to do next..." 
                        className="w-full bg-transparent border-none outline-none text-[13px] text-white placeholder:text-white/40 resize-none overflow-hidden"
                    />
                    <div className="flex items-center justify-between">
                        <button className="text-white/40 hover:text-white transition">
                            <Paperclip className="w-4 h-4" />
                        </button>
                        <button className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition text-white">
                            <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                    </div>
                </>
            )}
        </div>
    )
}
