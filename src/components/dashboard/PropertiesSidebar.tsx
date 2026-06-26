'use client'

import { Activity, User, AlertCircle, RefreshCw, ChevronUp, ChevronDown, Link2, Copy, MessageSquare } from 'lucide-react'

export default function PropertiesSidebar() {
    return (
        <aside className="w-[300px] border-l border-white/5 bg-[#04060D] flex flex-col fixed top-16 right-0 bottom-0 z-40">
            
            {/* Linear-Style Top Header */}
            <div className="flex items-center w-full h-[48px] border-b border-white/5 px-4 shrink-0">
                {/* Pagination Section */}
                <div className="flex items-center gap-2 pr-3 border-r border-white/5 h-full text-white/40">
                    <span className="text-[12px] font-medium mr-1">02 / 145</span>
                    <div className="flex items-center">
                        <button className="p-1 hover:bg-white/5 rounded transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                        <button className="p-1 hover:bg-white/5 rounded transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                </div>

                {/* ID and Actions Section */}
                <div className="flex items-center justify-between flex-1 pl-3 h-full">
                    <span className="text-[12px] font-medium text-white/60">SIG-1042</span>
                    
                    <div className="flex items-center gap-0.5 text-white/40">
                        <button className="p-1.5 hover:bg-white/5 hover:text-white rounded transition-colors" title="Copy Link">
                            <Link2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-white/5 hover:text-white rounded transition-colors" title="Copy ID">
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-white/5 hover:text-[#7B61FF] rounded transition-colors" title="Send to Slack">
                            <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Properties Content */}
            <div className="p-5 flex-1 overflow-y-auto">
                <h2 className="text-sm font-medium text-white mb-6">Signal Properties</h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                            <Activity className="w-3.5 h-3.5" />
                            <span className="text-xs">Status</span>
                        </div>
                        <span className="text-xs text-white">Investigating</span>
                    </div>
                    
                    <div className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-xs">Impact</span>
                        </div>
                        <span className="text-xs text-white">High Churn Risk</span>
                    </div>
                    
                    <div className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                            <User className="w-3.5 h-3.5" />
                            <span className="text-xs">Assignee</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[8px] text-blue-400">AL</div>
                            <span className="text-xs text-white">Alex</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span className="text-xs">Source</span>
                        </div>
                        <span className="text-xs text-white">Mixpanel</span>
                    </div>
                </div>

                <div className="mt-8">
                    <button className="w-full py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-white/80 text-xs font-medium transition-colors rounded">
                        Add Custom Property...
                    </button>
                </div>
            </div>
        </aside>
    )
}
