'use client'

import { useState, useEffect } from 'react'
import { X, Play, Share2, Download, Lock, TrendingUp, BarChart3, Activity } from 'lucide-react'

interface InvestorModeOverlayProps {
    isOpen: boolean
    onClose: () => void
    companyName: string
}

export default function InvestorModeOverlay({ isOpen, onClose, companyName }: InvestorModeOverlayProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [activeTab, setActiveTab] = useState<'pitch' | 'metrics' | 'data-room'>('pitch')

    // Handle animation timing
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            document.body.style.overflow = 'hidden'
        } else {
            setTimeout(() => setIsVisible(false), 300)
            document.body.style.overflow = 'unset'
        }
        
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen && !isVisible) return null

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-[#020202] backdrop-blur-3xl"
                onClick={onClose}
            />

            {/* Content Container */}
            <div className={`relative w-full max-w-7xl h-[90vh] bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 delay-100 ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B61FF] to-[#0A0A0B] border border-white/10 flex items-center justify-center text-lg font-outfit text-white">
                            {companyName.charAt(0)}
                        </div>
                        <div>
                            <div className="text-[0.65rem] text-[#7B61FF] uppercase tracking-[0.2em] font-medium mb-1">Investor Mode</div>
                            <h2 className="text-xl font-outfit font-light">{companyName} <span className="text-white/40">Fundraising Data Room</span></h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-white/80 transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share Link
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#7B61FF]/10 hover:bg-[#7B61FF]/20 border border-[#7B61FF]/30 rounded text-sm text-[#7B61FF] transition-colors">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 ml-4 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Nav */}
                    <div className="w-64 border-r border-white/5 bg-[#050505] p-6 flex flex-col gap-2">
                        <button 
                            onClick={() => setActiveTab('pitch')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light transition-colors ${activeTab === 'pitch' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                        >
                            <Play className="w-4 h-4" />
                            PMF Presenter
                        </button>
                        <button 
                            onClick={() => setActiveTab('metrics')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light transition-colors ${activeTab === 'metrics' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Live Metrics
                        </button>
                        <button 
                            onClick={() => setActiveTab('data-room')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light transition-colors ${activeTab === 'data-room' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                        >
                            <Lock className="w-4 h-4" />
                            Secure Data Room
                        </button>
                    </div>

                    {/* Stage */}
                    <div className="flex-1 bg-[#0A0A0B] p-10 overflow-y-auto relative">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7B61FF] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />
                        
                        {activeTab === 'pitch' && (
                            <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center max-w-2xl mx-auto">
                                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-8 shadow-2xl">
                                    <Activity className="w-8 h-8 text-[#7B61FF]" />
                                </div>
                                <h1 className="text-5xl font-outfit font-extralight tracking-tight mb-6">
                                    Our Product-Market Fit Score is <span className="text-[#7B61FF] font-medium">32/35</span>
                                </h1>
                                <p className="text-lg text-white/50 font-light mb-12">
                                    Launch the interactive PMF presentation to walk investors through your retention curves, organic growth loops, and willingness to pay.
                                </p>
                                <button className="px-8 py-4 bg-[#7B61FF] hover:bg-[#8A73FF] text-white rounded-lg font-medium tracking-wide transition-colors shadow-[0_0_40px_rgba(123,97,255,0.3)]">
                                    Start Presentation
                                </button>
                            </div>
                        )}

                        {activeTab === 'metrics' && (
                            <div className="animate-fade-in">
                                <h3 className="text-2xl font-outfit font-light mb-8">Live Validated Metrics</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="text-sm text-white/40 uppercase tracking-widest mb-4">Willingness to Pay</div>
                                        <div className="text-4xl font-light text-white mb-2">64%</div>
                                        <div className="text-sm text-emerald-400">+12% vs Industry Avg</div>
                                    </div>
                                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="text-sm text-white/40 uppercase tracking-widest mb-4">W4 Retention</div>
                                        <div className="text-4xl font-light text-white mb-2">41%</div>
                                        <div className="text-sm text-emerald-400">Top Quartile</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'data-room' && (
                            <div className="animate-fade-in">
                                <h3 className="text-2xl font-outfit font-light mb-8">Secure Data Room</h3>
                                <div className="p-12 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                                    <Lock className="w-8 h-8 text-white/20 mb-4" />
                                    <h4 className="text-lg font-medium text-white/80 mb-2">Request Access</h4>
                                    <p className="text-sm text-white/40 max-w-sm">
                                        Investors must request access to view raw financial models, cap tables, and corporate documents.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
