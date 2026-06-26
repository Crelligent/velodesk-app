'use client'

import React, { useState, useEffect } from 'react'
import { SlidersHorizontal } from 'lucide-react'

export default function SimulatorPage() {
    // State for our levers
    const [retention, setRetention] = useState(34) // %
    const [cac, setCac] = useState(125) // $
    const [mrrGrowth, setMrrGrowth] = useState(8.5) // %
    const [nps, setNps] = useState(47)

    // Baseline values for comparison
    const baseRetention = 34
    const baseCac = 125
    const baseMrrGrowth = 8.5
    const baseNps = 47
    const baseScore = 68
    const baseRunway = 16

    // Calculated metrics
    const [pmfScore, setPmfScore] = useState(baseScore)
    const [runway, setRunway] = useState(baseRunway)
    const [ltvCac, setLtvCac] = useState(3.2)

    // The Physics Engine Logic
    useEffect(() => {
        // Calculate new score
        let newScore = baseScore
        newScore += (retention - baseRetention) * 1.5
        newScore += (mrrGrowth - baseMrrGrowth) * 2
        newScore += (nps - baseNps) * 0.2
        newScore -= (cac - baseCac) * 0.1
        
        // Cap between 0 and 100
        newScore = Math.min(Math.max(Math.round(newScore), 0), 100)
        setPmfScore(newScore)

        // Calculate Runway impact
        let newRunway = baseRunway
        newRunway += (retention - baseRetention) * 0.2
        newRunway += (mrrGrowth - baseMrrGrowth) * 0.5
        newRunway -= (cac - baseCac) * 0.05
        setRunway(Math.max(Math.round(newRunway * 10) / 10, 0))

        // LTV:CAC proxy
        const assumedLtv = 400 + (retention * 10) + (nps * 2)
        const newLtvCac = Math.max(Math.round((assumedLtv / cac) * 10) / 10, 0.1)
        setLtvCac(newLtvCac)

    }, [retention, cac, mrrGrowth, nps])

    const scoreDiff = pmfScore - baseScore
    const runwayDiff = Math.round((runway - baseRunway) * 10) / 10
    const ltvCacDiff = Math.round((ltvCac - 3.2) * 10) / 10

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-medium tracking-widest uppercase mb-4">
                    <SlidersHorizontal size={14} /> The Physics Engine
                </div>
                <h1 className="text-4xl font-outfit font-extralight tracking-tight text-white mb-2">
                    PMF Scenario Simulator
                </h1>
                <p className="text-gray-400 text-lg">
                    Drag the sliders to see how changes to core metrics ripple through your PMF Score and extend your runway.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Levers */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-8">Growth Levers</h2>
                        
                        {/* D30 Retention */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-white text-lg font-light">D30 Retention</h3>
                                    <p className="text-xs text-gray-500">Percentage of users active on Day 30</p>
                                </div>
                                <div className="text-2xl font-outfit text-[#FF6B35]">{retention}%</div>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={retention} 
                                onChange={(e) => setRetention(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FF6B35]" 
                            />
                        </div>

                        {/* Customer Acquisition Cost */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-white text-lg font-light">Blended CAC</h3>
                                    <p className="text-xs text-gray-500">Fully loaded customer acquisition cost</p>
                                </div>
                                <div className="text-2xl font-outfit text-white">${cac}</div>
                            </div>
                            <input 
                                type="range" 
                                min="10" max="500" step="5"
                                value={cac} 
                                onChange={(e) => setCac(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white" 
                            />
                        </div>

                        {/* MRR Growth */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-white text-lg font-light">MRR Growth (MoM)</h3>
                                    <p className="text-xs text-gray-500">Monthly recurring revenue growth rate</p>
                                </div>
                                <div className="text-2xl font-outfit text-white">{mrrGrowth}%</div>
                            </div>
                            <input 
                                type="range" 
                                min="-10" max="50" step="0.5"
                                value={mrrGrowth} 
                                onChange={(e) => setMrrGrowth(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white" 
                            />
                        </div>

                        {/* NPS */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-white text-lg font-light">Net Promoter Score</h3>
                                    <p className="text-xs text-gray-500">Word of mouth indicator (-100 to 100)</p>
                                </div>
                                <div className="text-2xl font-outfit text-[#FF6B35]">{nps}</div>
                            </div>
                            <input 
                                type="range" 
                                min="-100" max="100" 
                                value={nps} 
                                onChange={(e) => setNps(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FF6B35]" 
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: The Impact */}
                <div className="lg:col-span-5">
                    <div className="sticky top-8">
                        <div className="p-8 bg-gradient-to-b from-[#FF6B35]/[0.05] to-transparent border border-[#FF6B35]/20 rounded-2xl relative overflow-hidden transition-all duration-500">
                            {/* Ambient glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35]/10 blur-[100px] pointer-events-none" />
                            
                            <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-8">The Butterfly Effect</h2>
                            
                            <div className="flex flex-col items-center justify-center py-8 border-b border-white/5 mb-8">
                                <div className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40 mb-4">
                                    Projected PMF Score™
                                </div>
                                <div className="font-outfit text-8xl font-extralight text-white tracking-tighter tabular-nums transition-all duration-300">
                                    {pmfScore}<span className="text-3xl text-gray-500">/100</span>
                                </div>
                                <div className={`mt-4 text-sm font-medium ${scoreDiff > 0 ? 'text-[#4ade80]' : scoreDiff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {scoreDiff > 0 ? '+' : ''}{scoreDiff === 0 ? 'No change' : `${scoreDiff} from baseline`}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Projected Runway</div>
                                        <div className="text-2xl text-white font-light tabular-nums">{runway} Months</div>
                                    </div>
                                    <div className={`text-sm ${runwayDiff > 0 ? 'text-[#4ade80]' : runwayDiff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                        {runwayDiff > 0 ? '+' : ''}{runwayDiff === 0 ? '-' : `${runwayDiff} mos`}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">LTV:CAC Ratio</div>
                                        <div className="text-2xl text-white font-light tabular-nums">{ltvCac}x</div>
                                    </div>
                                    <div className={`text-sm ${ltvCacDiff > 0 ? 'text-[#4ade80]' : ltvCacDiff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                        {ltvCacDiff > 0 ? '+' : ''}{ltvCacDiff === 0 ? '-' : `${ltvCacDiff}x`}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Investor Conviction</div>
                                        <div className={`text-2xl font-light ${pmfScore >= 80 ? 'text-[#4ade80]' : pmfScore >= 60 ? 'text-white' : 'text-red-400'}`}>
                                            {pmfScore >= 80 ? 'High' : pmfScore >= 60 ? 'Moderate' : 'Low'}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">Based on score</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
