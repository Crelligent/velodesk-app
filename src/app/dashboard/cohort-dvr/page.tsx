'use client'

import React, { useState } from 'react'
import { PlaySquare, FastForward, Rewind, Pause } from 'lucide-react'

export default function CohortDVRPage() {
    const [currentMonth, setCurrentMonth] = useState(4)
    const totalMonths = 12

    // Simulated retention data that degrades over time.
    // Each array represents the retention profile at that specific month in the timeline.
    const retentionData = [
        [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100], // Month 0
        [100, 85, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Month 1
        [100, 85, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Month 2
        [100, 85, 72, 60, 0, 0, 0, 0, 0, 0, 0, 0], // Month 3
        [100, 85, 72, 60, 51, 0, 0, 0, 0, 0, 0, 0], // Month 4
        [100, 85, 72, 60, 51, 45, 0, 0, 0, 0, 0, 0], // Month 5
        [100, 85, 72, 60, 51, 45, 42, 0, 0, 0, 0, 0], // Month 6
        [100, 85, 72, 60, 51, 45, 42, 40, 0, 0, 0, 0], // Month 7
        [100, 85, 72, 60, 51, 45, 42, 40, 39, 0, 0, 0], // Month 8
        [100, 85, 72, 60, 51, 45, 42, 40, 39, 38, 0, 0], // Month 9
        [100, 85, 72, 60, 51, 45, 42, 40, 39, 38, 38, 0], // Month 10
        [100, 85, 72, 60, 51, 45, 42, 40, 39, 38, 38, 37], // Month 11
        [100, 85, 72, 60, 51, 45, 42, 40, 39, 38, 38, 37], // Month 12
    ]

    const currentData = retentionData[currentMonth]

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
                        onClick={() => setCurrentMonth(Math.max(0, currentMonth - 1))}
                        className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white transition">
                        <Rewind size={18} />
                    </button>
                    <button className="p-3 bg-[#FF6B35] hover:bg-[#ff8559] text-white rounded-lg transition flex items-center justify-center min-w-[48px]">
                        <Pause size={18} />
                    </button>
                    <button 
                        onClick={() => setCurrentMonth(Math.min(totalMonths, currentMonth + 1))}
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
                        onChange={(e) => setCurrentMonth(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FF6B35] relative z-10" 
                    />
                    
                    <div className="flex justify-between mt-4 text-xs font-mono text-gray-500">
                        <span>Day 0</span>
                        <span>Day 30</span>
                        <span>Day 60</span>
                        <span>Day 90</span>
                        <span className="text-[#FF6B35]">Day {currentMonth * 30}</span>
                        <span>Day 150</span>
                        <span>Day 365</span>
                    </div>
                </div>

                {/* Visual Chart Area */}
                <div className="h-80 relative border-l border-b border-white/10 px-4 pt-4 flex items-end gap-2">
                    {/* Simulated bars degrading over time */}
                    {currentData.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                            {/* The "ghost" bar of Day 0 */}
                            <div className="absolute bottom-0 w-full bg-white/5 rounded-t-sm" style={{ height: '100%' }} />
                            
                            {/* The actual retention at current playback time */}
                            {val > 0 ? (
                                <div 
                                    className={`relative w-full rounded-t-sm z-10 transition-all duration-500 ${i === currentMonth ? 'bg-[#FF6B35] shadow-[0_0_15px_rgba(255,107,53,0.5)]' : 'bg-white/20'}`} 
                                    style={{ height: `${val}%` }} 
                                />
                            ) : (
                                <div className="relative w-full rounded-t-sm z-10 bg-transparent transition-all duration-500" style={{ height: '0%' }} />
                            )}
                            
                            {val > 0 && (
                                <div className="absolute -top-8 text-xs font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition">
                                    {val}%
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-xl">
                    <div className="text-xs text-[#FF6B35] uppercase tracking-wider mb-2">DVR AI Observation</div>
                    <div className="text-white text-sm leading-relaxed">
                        At <span className="font-mono text-[#ff8559]">Day 45</span>, retention drops sharply by 12%. This correlates directly with the end of the standard free trial period. Users who engage with the "Reports" feature during the trial are 3x more likely to survive this drop-off.
                    </div>
                </div>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Historical Comparison</div>
                    <div className="text-sm leading-relaxed text-gray-400">
                        This cohort (Q3 2024) is performing <span className="text-[#4ade80]">+4.2%</span> better at the 120-day mark than the Q2 2024 cohort, indicating that the recent onboarding revamp was successful.
                    </div>
                </div>
            </div>

        </div>
    )
}
