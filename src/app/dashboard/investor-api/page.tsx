'use client'

import { useState } from 'react'
import { Network, Key, CheckCircle2, Copy, Eye, EyeOff, Building2, RefreshCw } from 'lucide-react'

export default function InvestorApiPage() {
    const [showKey, setShowKey] = useState(false)
    const [autoSync, setAutoSync] = useState(true)
    const [apiKey] = useState('vd_live_sec_8f92jknv8349fnk234f9823f9n23f8923')

    return (
        <div className="animate-fade-in max-w-4xl">
            <div className="mb-10">
                <div className="text-[0.65rem] text-indigo-400 uppercase tracking-[0.3em] mb-4">Data Bridging</div>
                <h1 className="font-outfit text-4xl font-extralight tracking-tight mb-2">Investor API Sync</h1>
                <p className="text-[#606060] font-light">Securely pipeline your live PMF metrics directly to your investors' dashboards.</p>
            </div>

            {/* Active Connections */}
            <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden mb-8">
                <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
                    <h2 className="text-lg font-outfit font-medium text-white/90 flex items-center gap-2">
                        <Network className="w-5 h-5 text-emerald-400" />
                        Active Investor Connections
                    </h2>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-white/90 font-medium">Aruwa Capital</h3>
                                <div className="text-xs text-[#606060] flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    Last synced: 2 mins ago
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm text-[#808080]">Auto-sync Live Data</span>
                                <button 
                                    onClick={() => setAutoSync(!autoSync)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${autoSync ? 'bg-emerald-500' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${autoSync ? 'translate-x-5' : ''}`} />
                                </button>
                            </label>
                            
                            <button className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-[#808080] hover:text-red-400 border border-white/5 rounded transition-colors text-sm">
                                Revoke Access
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Generation */}
            <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
                    <h2 className="text-lg font-outfit font-medium text-white/90 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-400" />
                        Generate Secure Data Room Key
                    </h2>
                    <p className="text-sm text-[#606060] mt-1">
                        Provide this key to new investors or accelerators to allow them to securely fetch your metrics into their Velodesk portal.
                    </p>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#606060] mb-2 font-medium">Read-Only Access Token</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/[0.02] border border-white/10 rounded p-3 font-mono text-sm text-white flex items-center justify-between">
                                <span>{showKey ? apiKey : '••••••••••••••••••••••••••••••••••••••••••••••••'}</span>
                                <button onClick={() => setShowKey(!showKey)} className="text-[#606060] hover:text-white transition-colors">
                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <button className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-4 flex gap-3">
                        <RefreshCw className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                        <p className="text-sm text-indigo-200/70 leading-relaxed">
                            Generating a new token will immediately invalidate any previously generated tokens that have not yet been accepted by an investor. Connected investors like Aruwa Capital will remain unaffected.
                        </p>
                    </div>

                    <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded transition-colors text-sm font-medium">
                        Rotate Access Token
                    </button>
                </div>
            </div>
        </div>
    )
}
