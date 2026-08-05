'use client'

import { Search, Filter, MoreHorizontal, FileText, CheckCircle2, ChevronRight, Activity, Target } from 'lucide-react'

const pipelineStages = [
    {
        name: 'Screening',
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        prospects: [
            { name: 'NexaHealth', industry: 'Healthtech', date: 'Added 2d ago', aiRisk: 'Low Risk', aiScore: 88, aiColor: 'text-emerald-400', aiBg: 'bg-emerald-500/10' },
            { name: 'OmniChain', industry: 'Web3', date: 'Added 4d ago', aiRisk: 'High Risk', aiScore: 32, aiColor: 'text-red-400', aiBg: 'bg-red-500/10' },
            { name: 'BuildOps', industry: 'Contech', date: 'Added 5d ago', aiRisk: 'Medium Risk', aiScore: 65, aiColor: 'text-amber-400', aiBg: 'bg-amber-500/10' },
        ]
    },
    {
        name: 'Due Diligence',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        prospects: [
            { name: 'Lumina AI', industry: 'Enterprise SaaS', date: '2 weeks in DD', aiRisk: 'Very Low Risk', aiScore: 94, aiColor: 'text-emerald-400', aiBg: 'bg-emerald-500/10' },
            { name: 'AeroFarms', industry: 'Agtech', date: '1 week in DD', aiRisk: 'Medium Risk', aiScore: 58, aiColor: 'text-amber-400', aiBg: 'bg-amber-500/10' },
        ]
    },
    {
        name: 'Term Sheet',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        prospects: [
            { name: 'PayFlow B2B', industry: 'Fintech', date: 'Signed 1d ago', aiRisk: 'Low Risk', aiScore: 82, aiColor: 'text-emerald-400', aiBg: 'bg-emerald-500/10' },
        ]
    }
]

export default function DealflowPage() {
    return (
        <div className="animate-fade-in max-w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="text-[0.65rem] text-emerald-400 uppercase tracking-[0.3em] mb-4">Pre-Investment Pipeline</div>
                    <h1 className="font-outfit text-4xl font-extralight tracking-tight mb-2">Dealflow Intelligence</h1>
                    <p className="text-[#606060] font-light max-w-2xl">Evaluate prospective startups using Velodesk's AI Pre-PMF Risk Assessor before committing capital.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-[#606060] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text"
                            placeholder="Search prospects..."
                            className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#606060] transition-colors w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
                        <Target className="w-4 h-4" />
                        Add Prospect
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
                {pipelineStages.map((stage) => (
                    <div key={stage.name} className="flex-shrink-0 w-[350px] flex flex-col h-full min-h-[500px]">
                        {/* Stage Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${stage.color} ${stage.bg} ${stage.border}`}>
                                    {stage.name}
                                </div>
                                <span className="text-[#606060] text-sm font-medium">{stage.prospects.length}</span>
                            </div>
                            <button className="p-1 text-[#606060] hover:text-white transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Stage Column */}
                        <div className="flex-1 bg-[rgba(255,255,255,0.01)] border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl p-3 flex flex-col gap-3">
                            {stage.prospects.map((prospect, i) => (
                                <div key={i} className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-lg p-4 hover:border-[rgba(255,255,255,0.1)] transition-colors group cursor-pointer shadow-xl">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-white/90 font-medium text-sm mb-1">{prospect.name}</h3>
                                            <div className="text-xs text-[#606060]">{prospect.industry}</div>
                                        </div>
                                        <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/50 font-medium">
                                            {prospect.name.charAt(0)}
                                        </div>
                                    </div>

                                    {/* AI Risk Score Bar */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-white/60">
                                                <Activity className="w-3 h-3 text-purple-400" /> AI PMF Confidence
                                            </div>
                                            <span className="text-xs font-mono font-medium text-white/80">{prospect.aiScore}/100</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${prospect.aiScore > 80 ? 'bg-emerald-500' : prospect.aiScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                style={{ width: `${prospect.aiScore}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.05)]">
                                        <div className="text-xs text-[#606060] flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5" /> Data Room
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${prospect.aiColor} ${prospect.aiBg}`}>
                                            {prospect.aiRisk}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
