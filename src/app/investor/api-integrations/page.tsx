'use client'

import { Network, Database, CheckCircle2, Plus } from 'lucide-react'

export default function ApiIntegrationsPage() {
    return (
        <div className="animate-fade-in max-w-4xl">
            <div className="mb-10">
                <h1 className="font-outfit text-4xl font-extralight tracking-tight mb-2">API Integrations</h1>
                <p className="text-[#606060] font-light">Manage your incoming data pipelines from portfolio companies.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-[0.03] blur-3xl rounded-full" />
                    <div className="flex items-center gap-3 text-[#606060] mb-4 relative z-10">
                        <Network className="w-4 h-4" />
                        <span className="text-[0.7rem] uppercase tracking-[0.15em]">Live Data Links</span>
                    </div>
                    <div className="text-4xl font-outfit font-light mb-1 relative z-10">14</div>
                    <div className="text-sm text-emerald-400 relative z-10">
                        Startups syncing via API
                    </div>
                </div>

                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.04] transition-colors">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-white/90 font-medium mb-1">Add Portfolio Data Source</h3>
                    <p className="text-sm text-[#606060]">Input a startup's Velodesk Data Room Key to start syncing</p>
                </div>
            </div>

            {/* Current Syncs Table Placeholder */}
            <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
                    <h2 className="text-lg font-outfit font-medium text-white/90 flex items-center gap-2">
                        <Database className="w-5 h-5 text-[#808080]" />
                        Recent Sync Activity
                    </h2>
                </div>
                
                <div className="p-6">
                    <div className="space-y-4">
                        {[
                            { name: 'PayFlow', status: 'Synced', time: '2 mins ago' },
                            { name: 'HealthSync', status: 'Synced', time: '14 mins ago' },
                            { name: 'EduStream', status: 'Synced', time: '1 hour ago' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="font-medium text-white/90">{item.name}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-[#606060]">{item.time}</div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {item.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
