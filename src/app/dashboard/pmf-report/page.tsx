'use client'

import { useState } from 'react'
import { ShieldCheck, Download, Link2, CheckCircle2, Lock, Activity, Database, GitMerge } from 'lucide-react'

// Mock Data
const CERTIFICATE_DATA = {
    startupName: 'Nexus AI',
    score: 84,
    generatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    cryptoHash: 'SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sources: [
        { name: 'Stripe', type: 'Revenue & Billing', status: 'Verified' },
        { name: 'Mixpanel', type: 'Product Telemetry', status: 'Verified' },
        { name: 'Postgres', type: 'Core Database', status: 'Verified' },
    ],
    dimensions: [
        { name: 'Cohort Retention', score: 88 },
        { name: 'Revenue Expansion', score: 92 },
        { name: 'High-Frequency Engagement', score: 76 },
        { name: 'Sentiment & Satisfaction', score: 80 }
    ]
}

export default function PMFCertificatePage() {
    const [shareUrl, setShareUrl] = useState<string | null>(null)
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        // Mock export delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsExporting(false)
        alert('PDF successfully exported to your downloads folder.')
    }

    const handleShare = () => {
        const slug = Math.random().toString(36).substring(7)
        const url = `${window.location.origin}/verify/${slug}`
        setShareUrl(url)
        navigator.clipboard.writeText(url)
    }

    return (
        <div className="p-8 pb-32 max-w-7xl mx-auto font-outfit">
            
            {/* Page Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-medium text-white tracking-tight mb-2">PMF Certificate</h1>
                    <p className="text-white/50 text-sm">A cryptographically secure, ungameable proof of your traction.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/10"
                    >
                        <Link2 className="w-4 h-4" />
                        {shareUrl ? 'Link Copied!' : 'Copy Secure Link'}
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] hover:brightness-110 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {isExporting ? 'Generating PDF...' : 'Download Full Report & Certificate'}
                    </button>
                </div>
            </div>

            {/* The Certificate Document (Landscape) */}
            <div className="relative bg-[#0C0E1A] rounded-[3px] overflow-hidden shadow-2xl p-4 md:p-5 isolate w-full aspect-[1.414/1] min-h-[650px] flex flex-col border-[2px] border-white/10">
                {/* Outer Banknote Frame */}
                <div className="relative flex-1 border-[1px] border-[#7B61FF]/20 p-2 isolate overflow-hidden bg-[#0C0E1A] flex flex-col justify-between rounded-sm">
                    {/* Inner Ornate Border */}
                    <div className="relative flex-1 border-[4px] border-double border-[#7B61FF]/30 p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-[#0A0C14]">
                        
                        {/* Corner Rosettes (Top Left) */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-r-[2px] border-b-[2px] border-[#7B61FF]/20 rounded-br-full flex items-center justify-center pointer-events-none bg-[#0C0E1A]">
                            <div className="absolute top-2 left-2 w-10 h-10 rounded-full border border-dashed border-[#7B61FF]/40 animate-[spin_60s_linear_infinite] flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full border border-[#7B61FF]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-[#7B61FF]/30 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* Corner Rosettes (Top Right) */}
                        <div className="absolute top-0 right-0 w-16 h-16 border-l-[2px] border-b-[2px] border-[#7B61FF]/20 rounded-bl-full flex items-center justify-center pointer-events-none bg-[#0C0E1A]">
                            <div className="absolute top-2 right-2 w-10 h-10 rounded-full border border-dashed border-[#7B61FF]/40 animate-[spin_60s_linear_infinite_reverse] flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full border border-[#7B61FF]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-[#7B61FF]/30 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* Corner Rosettes (Bottom Left) */}
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-r-[2px] border-t-[2px] border-[#7B61FF]/20 rounded-tr-full flex items-center justify-center pointer-events-none bg-[#0C0E1A]">
                            <div className="absolute bottom-2 left-2 w-10 h-10 rounded-full border border-dashed border-[#7B61FF]/40 animate-[spin_60s_linear_infinite_reverse] flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full border border-[#7B61FF]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-[#7B61FF]/30 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* Corner Rosettes (Bottom Right) */}
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-l-[2px] border-t-[2px] border-[#7B61FF]/20 rounded-tl-full flex items-center justify-center pointer-events-none bg-[#0C0E1A]">
                            <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full border border-dashed border-[#7B61FF]/40 animate-[spin_60s_linear_infinite] flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full border border-[#7B61FF]/20 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-[#7B61FF]/30 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    
                    {/* Silver Holographic Strip (Moved to align with new borders) */}
                    <div className="absolute top-0 bottom-0 left-12 w-8 bg-gradient-to-b from-[#e2e8f0] via-[#f8fafc] to-[#cbd5e1] opacity-90 border-x border-white/40 z-20" style={{ mixBlendMode: 'screen' }}>
                        <div className="w-full h-full opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>
                    </div>

                    {/* Official Gold Seal with Ribbons */}
                    <div className="absolute bottom-6 right-6 md:bottom-8 md:right-10 z-30 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
                        <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
                            {/* Red Ribbons */}
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1 z-0">
                                <div className="w-5 h-16 bg-gradient-to-b from-red-700 to-red-900 border-x border-red-500/30 origin-top transform rotate-[15deg] shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }}></div>
                                <div className="w-5 h-16 bg-gradient-to-b from-red-800 to-red-950 border-x border-red-500/30 origin-top transform -rotate-[15deg] shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }}></div>
                            </div>
                            
                            {/* Gold Base */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728] shadow-[0_5px_15px_rgba(0,0,0,0.5)] border border-[#AA771C] z-10 flex items-center justify-center">
                                {/* Serrated Edge effect */}
                                <div className="absolute inset-[-2px] border-[4px] border-dotted border-[#AA771C]/50 rounded-full"></div>
                                
                                {/* Inner Ring */}
                                <div className="absolute inset-2 rounded-full border border-[#8A5A19]/30 bg-gradient-to-tl from-[#BF953F] to-[#FDFFCC] flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
                                    <div className="absolute inset-1 border border-[#AA771C]/30 rounded-full"></div>
                                    <div className="flex flex-col items-center">
                                        <img src="/velodesk (2).png" alt="VeloDesk Seal" className="w-6 h-6 md:w-7 md:h-7 object-contain mb-0.5 opacity-60 filter grayscale contrast-200 brightness-50" />
                                        <span className="text-[5px] md:text-[6px] font-bold tracking-[0.2em] text-[#8A5A19] uppercase">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Accents & Watermark */}
                    {/* Wavy Banknote Guilloche Lines */}
                    <div 
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ 
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.5'%3E%3Cpath d='M0 20 Q 10 10, 20 20 T 40 20 M0 22 Q 10 12, 20 22 T 40 22 M0 18 Q 10 8, 20 18 T 40 18'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '40px 40px',
                        }} 
                    />

                    {/* Repeating VeloDesk logo watermark mesh */}
                    <div 
                        className="absolute inset-0 opacity-[0.04] pointer-events-none filter grayscale mix-blend-screen"
                        style={{ 
                            backgroundImage: `url("/velodesk (2).png")`,
                            backgroundSize: '80px 80px',
                            backgroundRepeat: 'repeat',
                            backgroundPosition: 'center'
                        }} 
                    />
                    
                    {/* Giant centered watermark logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.015] pointer-events-none flex items-center justify-center mix-blend-screen">
                        <img src="/velodesk (2).png" alt="" className="w-full h-full object-contain filter grayscale" />
                    </div>
                    
                    <div className="pl-16 relative z-10 flex-1 flex flex-col">
                        {/* Certificate Header Row */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-6">
                                <img src="/velodesk (2).png" alt="VeloDesk" className="w-12 h-12 object-contain" />
                                <div className="h-8 w-px bg-white/20" />
                                <div className="w-12 h-12 rounded-xl border border-[#7B61FF]/30 bg-[#0A0C14] flex items-center justify-center shadow-lg">
                                    <span className="text-xl font-bold text-white tracking-tighter" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>N</span>
                                </div>
                            </div>
                            <div className="text-right flex gap-12 border border-[#7B61FF]/20 bg-[#0C0E1A]/80 backdrop-blur-sm px-6 py-3 rounded-lg">
                                <div>
                                    <p className="text-[10px] font-mono text-[#7B61FF] uppercase tracking-widest mb-1">Serial Number</p>
                                    <p className="text-sm font-mono text-white tracking-widest">VD-2026-NEXUS-084</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono text-[#7B61FF] uppercase tracking-widest mb-1">Date of Issue</p>
                                    <p className="text-sm font-mono text-white tracking-widest">{CERTIFICATE_DATA.generatedAt}</p>
                                </div>
                            </div>
                        </div>

                    {/* Certificate Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/40 mb-3">Official Certification</h2>
                        <h3 className="text-5xl md:text-6xl font-['Instrument_Serif'] italic font-normal text-white mb-3 tracking-tight">Product-Market Fit</h3>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-base text-white/40 font-light">Awarded to</p>
                            <span className="text-xl text-white font-medium tracking-wide">{CERTIFICATE_DATA.startupName}</span>
                        </div>
                    </div>

                    {/* 3-Column Body */}
                    <div className="grid grid-cols-3 gap-6 items-center flex-1 mb-6">
                        
                        {/* Left: Sources */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-3">Telemetry Sources</h4>
                            {CERTIFICATE_DATA.sources.map((source, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div>
                                        <p className="text-xs font-medium text-white">{source.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-[#00B67A]/10 border border-[#00B67A]/20">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-[#00B67A]" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Center: The Score */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-44 h-44 rounded-full bg-[#04060D] border-[3px] border-[#090A10] shadow-xl flex flex-col items-center justify-center relative">
                                <span className="text-6xl font-medium bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-none">
                                    {CERTIFICATE_DATA.score}
                                </span>
                                <span className="text-[10px] font-mono text-white/30 tracking-widest mt-1.5 uppercase">/ 100</span>
                            </div>
                        </div>

                        {/* Right: Dimensions */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-3">Core Dimensions</h4>
                            {CERTIFICATE_DATA.dimensions.map((dim, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-end mb-1.5">
                                        <span className="text-[10px] text-white/70">{dim.name}</span>
                                        <span className="text-[10px] font-medium text-white">{dim.score}</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full bg-gradient-to-r from-[#7B61FF] to-[#38BDF8]" 
                                            style={{ width: `${dim.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Cryptographic Footer */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between pr-24 md:pr-32">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#00B67A]/10 flex items-center justify-center border border-[#00B67A]/20">
                                <ShieldCheck className="w-5 h-5 text-[#00B67A]" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-white flex items-center gap-1.5">
                                    Verified by VeloDesk 
                                    <Lock className="w-2.5 h-2.5 text-[#00B67A]" />
                                </p>
                                <p className="text-[10px] text-white/40">Data pulled directly via API. Founder manipulation impossible.</p>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Cryptographic Hash</p>
                            <p className="text-[10px] font-mono text-[#7B61FF]">{CERTIFICATE_DATA.cryptoHash}</p>
                        </div>
                    </div>
                </div>
                </div>
                </div>
            </div>

            {/* Detailed PMF Report Pages (Simulated PDF Output) */}
            <div className="mt-24 flex flex-col gap-16 items-center">
                <div className="w-full flex items-center justify-between border-b border-white/10 pb-6 mb-4">
                    <div>
                        <h2 className="text-2xl font-medium text-white mb-2">Automated Due Diligence Export</h2>
                        <p className="text-white/50 text-sm">Preview of the 12-page raw data appendix generated for investors.</p>
                    </div>
                </div>

                {/* Page 1: Overview & Cryptographic Audit Log */}
                <div className="w-full max-w-4xl bg-[#0C0E1A] border border-white/10 rounded-[20px] aspect-[1/1.2] p-12 flex flex-col shadow-2xl relative">
                    {/* Page Header */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B61FF] to-[#38BDF8] flex items-center justify-center">
                                <span className="text-sm font-bold text-white tracking-tighter">N</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{CERTIFICATE_DATA.startupName}</p>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Automated PMF Report</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">Page</p>
                            <p className="text-sm font-mono text-white">01</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <h3 className="text-3xl font-['Instrument_Serif'] italic text-white mb-8">Executive Summary</h3>
                        <p className="text-white/70 text-sm leading-relaxed mb-12">
                            Based on real-time ingestion of Stripe revenue data and Mixpanel event telemetry, {CERTIFICATE_DATA.startupName} exhibits top-quartile Product-Market Fit. Net Dollar Retention (NDR) is expanding rapidly driven by organic seat expansion, and the L30 power user curve indicates a deeply ingrained daily habit among the core user base. All data points have been cryptographically sealed at the time of generation to prevent manual tampering.
                        </p>

                        <h4 className="text-xs font-mono text-white/50 uppercase tracking-widest mb-6">Cryptographic Audit Log</h4>
                        <div className="bg-[#04060D] border border-white/5 rounded-xl p-6 font-mono text-[10px] text-white/60 space-y-4 flex-1">
                            <div>
                                <span className="text-[#38BDF8]">[SYSTEM]</span> 2026-06-23T14:02:11Z - Initiating PMF Verification Protocol
                            </div>
                            <div>
                                <span className="text-[#7B61FF]">[STRIPE API]</span> Fetching trailing 12-month transaction logs...<br/>
                                <span className="text-white/30 pl-4">Hash: 8f4e2...a1b9 | Status: Verified (Zero Manual Entries Detected)</span>
                            </div>
                            <div>
                                <span className="text-[#7B61FF]">[MIXPANEL API]</span> Fetching trailing 12-month event telemetry...<br/>
                                <span className="text-white/30 pl-4">Hash: 3c9d1...f8e2 | Status: Verified (Continuous Data Stream)</span>
                            </div>
                            <div>
                                <span className="text-[#00B67A]">[PHYSICS ENGINE]</span> Calculating Dimensions...<br/>
                                <span className="text-white/30 pl-4">Cohort Retention: 88/100 | Expansion: 92/100 | Engagement: 76/100</span>
                            </div>
                            <div className="pt-4 mt-4 border-t border-white/10 text-[#00B67A]">
                                FINAL SEAL: {CERTIFICATE_DATA.cryptoHash}
                            </div>
                        </div>
                    </div>

                    {/* Page Footer */}
                    <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{CERTIFICATE_DATA.cryptoHash.substring(0, 32)}...</p>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-[#00B67A]" />
                            <span className="text-[10px] font-mono text-[#00B67A] uppercase tracking-widest">Verified by VeloDesk</span>
                        </div>
                    </div>
                </div>

                {/* Page 2: Retention & Engagement */}
                <div className="w-full max-w-4xl bg-[#0C0E1A] border border-white/10 rounded-[20px] aspect-[1/1.2] p-12 flex flex-col shadow-2xl relative">
                    {/* Page Header */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B61FF] to-[#38BDF8] flex items-center justify-center">
                                <span className="text-sm font-bold text-white tracking-tighter">N</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{CERTIFICATE_DATA.startupName}</p>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Automated PMF Report</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">Page</p>
                            <p className="text-sm font-mono text-white">02</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-10">
                        <h3 className="text-3xl font-['Instrument_Serif'] italic text-white">Retention & Engagement</h3>
                        
                        {/* Power User Curve */}
                        <div className="bg-[#090A10] border border-white/5 rounded-xl p-8">
                            <h4 className="text-xs font-mono text-white/50 uppercase tracking-widest mb-6">Power User "Smile" Curve (L30)</h4>
                            <div className="h-40 flex items-end gap-1 mb-2">
                                {/* Mocking a smile curve: high on left, dipping, high on right */}
                                {[40, 25, 15, 10, 8, 7, 6, 6, 7, 8, 10, 12, 15, 20, 25, 30, 35, 45, 55, 65].map((val, i) => (
                                    <div 
                                        key={i} 
                                        className="flex-1 bg-gradient-to-t from-[#7B61FF]/20 to-[#38BDF8] rounded-t-sm"
                                        style={{ height: `${val}%` }}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-white/40 font-mono">
                                <span>1 Day</span>
                                <span>Active Days in Month</span>
                                <span>30 Days</span>
                            </div>
                            <p className="text-xs text-[#00B67A] mt-4 font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" /> Smile curve detected. High percentage of users active 25+ days/month.
                            </p>
                        </div>

                        {/* Cohort Heatmap */}
                        <div className="bg-[#090A10] border border-white/5 rounded-xl p-8 flex-1">
                            <h4 className="text-xs font-mono text-white/50 uppercase tracking-widest mb-6">Trailing 6-Month Cohort Retention</h4>
                            <div className="space-y-2">
                                {[100, 88, 85, 82, 80, 78].map((val, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="w-12 text-[10px] text-white/40 pt-1.5 font-mono">M{i}</div>
                                        <div className="flex-1 flex gap-1">
                                            {Array.from({length: 6 - i}).map((_, j) => {
                                                const cellVal = val - (j*2);
                                                return (
                                                    <div 
                                                        key={j} 
                                                        className="h-7 flex-1 rounded text-[10px] flex items-center justify-center font-medium text-white/90"
                                                        style={{ backgroundColor: `rgba(0, 182, 122, ${Math.max(0.1, cellVal / 100)})` }}
                                                    >
                                                        {cellVal}%
                                                    </div>
                                                )
                                            })}
                                            {Array.from({length: i}).map((_, j) => (
                                                <div key={`empty-${j}`} className="h-7 flex-1 rounded bg-white/[0.02]" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Page Footer */}
                    <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{CERTIFICATE_DATA.cryptoHash.substring(0, 32)}...</p>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-[#00B67A]" />
                            <span className="text-[10px] font-mono text-[#00B67A] uppercase tracking-widest">Verified by VeloDesk</span>
                        </div>
                    </div>
                </div>

                {/* Page 3: Revenue & Matrix */}
                <div className="w-full max-w-4xl bg-[#0C0E1A] border border-white/10 rounded-[20px] aspect-[1/1.2] p-12 flex flex-col shadow-2xl relative">
                    {/* Page Header */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B61FF] to-[#38BDF8] flex items-center justify-center">
                                <span className="text-sm font-bold text-white tracking-tighter">N</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{CERTIFICATE_DATA.startupName}</p>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Automated PMF Report</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">Page</p>
                            <p className="text-sm font-mono text-white">03</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-10">
                        <h3 className="text-3xl font-['Instrument_Serif'] italic text-white">Revenue Dynamics</h3>
                        
                        {/* Net Dollar Retention vs Logo Churn */}
                        <div className="bg-[#090A10] border border-white/5 rounded-xl p-8">
                            <h4 className="text-xs font-mono text-white/50 uppercase tracking-widest mb-6">NDR vs. Logo Churn (Trailing 12M)</h4>
                            <div className="flex items-center gap-12">
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-white/60">Net Dollar Retention (NDR)</span>
                                            <span className="text-[#00B67A] font-mono font-medium">124%</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full"><div className="h-full bg-[#00B67A] rounded-full w-[100%]" /></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-white/60">Logo Churn (Annualized)</span>
                                            <span className="text-[#FF6B35] font-mono font-medium">4.2%</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full"><div className="h-full bg-[#FF6B35] rounded-full w-[15%]" /></div>
                                    </div>
                                </div>
                                <div className="w-32 h-32 rounded-full border-[6px] border-[#00B67A] flex items-center justify-center bg-[#00B67A]/10 relative">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">124<span className="text-sm text-white/50">%</span></div>
                                        <div className="text-[8px] uppercase tracking-widest text-white/50 mt-1">NDR</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Adoption Matrix */}
                        <div className="bg-[#090A10] border border-white/5 rounded-xl p-8 flex-1">
                            <h4 className="text-xs font-mono text-white/50 uppercase tracking-widest mb-6">Feature Impact on Retention</h4>
                            <div className="border border-white/10 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-white/5 text-white/50 font-mono uppercase tracking-widest text-[9px]">
                                        <tr>
                                            <th className="p-3 font-normal border-b border-white/10">Feature Node</th>
                                            <th className="p-3 font-normal border-b border-white/10">Adoption %</th>
                                            <th className="p-3 font-normal border-b border-white/10">Impact on Retention</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white/80 divide-y divide-white/5">
                                        <tr>
                                            <td className="p-3 flex items-center gap-2"><GitMerge className="w-3 h-3 text-[#7B61FF]"/> API Automations</td>
                                            <td className="p-3">68%</td>
                                            <td className="p-3 text-[#00B67A]">+42% uplift</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 flex items-center gap-2"><Database className="w-3 h-3 text-[#38BDF8]"/> Custom Dashboards</td>
                                            <td className="p-3">84%</td>
                                            <td className="p-3 text-[#00B67A]">+28% uplift</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 flex items-center gap-2"><Activity className="w-3 h-3 text-white/30"/> SSO Integration</td>
                                            <td className="p-3">12%</td>
                                            <td className="p-3 text-white/40">Neutral</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Page Footer */}
                    <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{CERTIFICATE_DATA.cryptoHash.substring(0, 32)}...</p>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-[#00B67A]" />
                            <span className="text-[10px] font-mono text-[#00B67A] uppercase tracking-widest">Verified by VeloDesk</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
