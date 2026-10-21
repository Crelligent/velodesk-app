'use client'

import React, { useEffect, useState } from 'react'
import { PlaySquare, FastForward, Rewind, Pause, Play } from 'lucide-react'

export default function CohortDVRPage() {
    const [currentMonth, setCurrentMonth] = useState(4)
    const [playing, setPlaying] = useState(false)
    const totalMonths = 12

    // Sample retention curve (% of the cohort still active, month 0 to month 12).
    // Playback at month m reveals the curve up to m, as it would have looked at that point.
    const curve = [100, 85, 72, 60, 51, 45, 42, 40, 39, 38, 38, 37, 37]

    useEffect(() => {
        if (!playing) return
        const timer = setInterval(() => {
            setCurrentMonth(m => {
                if (m >= totalMonths) {
                    setPlaying(false)
                    return m
                }
                return m + 1
            })
        }, 900)
        return () => clearInterval(timer)
    }, [playing])

    const togglePlay = () => {
        if (!playing && currentMonth >= totalMonths) setCurrentMonth(0)
        setPlaying(p => !p)
    }
    const step = (delta: number) => {
        setPlaying(false)
        setCurrentMonth(m => Math.min(totalMonths, Math.max(0, m + delta)))
    }

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-medium tracking-widest uppercase mb-4">
                        <PlaySquare size={14} /> Time-Travel Analytics
                    </div>
                    <h1 className="text-4xl font-outfit font-extralight tracking-tight text-white mb-2">
                        Cohort DVR
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Watch your user retention degrade over time to visually identify exactly where the bucket leaks.
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => step(-1)}
                        aria-label="Previous month"
                        className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white transition">
                        <Rewind size={18} />
                    </button>
                    <button
                        onClick={togglePlay}
                        aria-label={playing ? 'Pause playback' : 'Play retention over time'}
                        className="p-3 bg-[#FF6B35] hover:bg-[#ff8559] text-white rounded-lg transition flex items-center justify-center min-w-[48px]">
                        {playing ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button 
                        onClick={() => step(1)}
                        aria-label="Next month"
                        className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white transition">
                        <FastForward size={18} />
                    </button>
                </div>
            </div>

            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl mb-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-sm uppercase tracking-widest text-gray-500">Retention Playback: Month {currentMonth}</h2>
                    <div className="text-sm font-mono text-[#FF6B35]">
                        {String(currentMonth).padStart(2, '0')} : {String(totalMonths).padStart(2, '0')}
                    </div>
                </div>

                {/* Timeline scrubber */}
                <div className="mb-16 relative group">
                    <input 
                        type="range" 
                        min="0" 
                        max={totalMonths} 
                        value={currentMonth}
                        onChange={(e) => { setPlaying(false); setCurrentMonth(Number(e.target.value)) }}
                        aria-label="Playback month"
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FF6B35] relative z-10" 
                    />
                    
                    <div className="flex justify-between mt-4 text-xs font-mono text-gray-500">
                        {[0, 3, 6, 9, 12].map(m => (
                            <span key={m} className={m === currentMonth ? 'text-[#FF6B35]' : ''}>Day {m * 30}</span>
                        ))}
                    </div>
                </div>

                {/* Visual Chart Area */}
                <div className="h-80 relative border-l border-b border-white/10 px-4 pt-8 flex items-end gap-2">
                    {curve.map((val, i) => {
                        const visible = i <= currentMonth
                        const isCurrent = i === currentMonth
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative">
                                {/* Day-0 baseline */}
                                <div className="absolute bottom-0 w-full bg-white/5 rounded-t-sm" style={{ height: '100%' }} />
                                <div
                                    className={`relative w-full rounded-t-sm z-10 transition-all duration-500 ${isCurrent ? 'bg-[#FF6B35] shadow-[0_0_15px_rgba(255,107,53,0.5)]' : 'bg-white/20'}`}
                                    style={{ height: visible ? `${val}%` : '0%' }}
                                />
                                {visible && (
                                    <div
                                        className={`absolute z-20 text-[10px] font-mono transition-all duration-500 ${isCurrent ? 'text-[#FF6B35]' : 'text-gray-500'}`}
                                        style={{ bottom: `calc(${val}% + 4px)` }}
                                    >
                                        {val}%
                                    </div>
                                )}
                                <div className="absolute -bottom-6 text-[10px] font-mono text-gray-500">M{i}</div>
                            </div>
                        )
                    })}
                </div>
                <div className="h-6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-xl">
                    <div className="text-xs text-[#FF6B35] uppercase tracking-wider mb-2">DVR AI Observation</div>
                    <div className="text-white text-sm leading-relaxed">
                        Between <span className="font-mono text-[#ff8559]">Day 30 and Day 60</span>, retention drops 13 points, the steepest fall after the first month. It lines up with the end of the free trial. Users who open the &ldquo;Reports&rdquo; feature during the trial are 3x more likely to stay past it.
                    </div>
                </div>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Historical Comparison</div>
                    <div className="text-sm leading-relaxed text-gray-400">
                        This cohort (Q2 2026) retains <span className="text-[#4ade80]">+4.2 points</span> more users at the 120-day mark than the Q1 2026 cohort, a sign the onboarding revamp is working.
                    </div>
                </div>
            </div>

        </div>
    )
}
