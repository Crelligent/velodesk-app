'use client'

import { useEffect, useState } from 'react'

interface MetricBarProps {
    label: string
    value: number
    maxValue?: number
    delay?: number
}

export default function MetricBar({ label, value, maxValue = 100, delay = 0 }: MetricBarProps) {
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => {
            // Ensure value doesn't exceed 100% visually
            const percentage = Math.min((value / maxValue) * 100, 100)
            setWidth(percentage)
        }, delay)

        return () => clearTimeout(timer)
    }, [value, maxValue, delay])

    return (
        <div className="mb-6 w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="text-white/80 font-light text-sm tracking-wide">{label}</span>
                <span className="text-white font-outfit text-xl font-extralight tracking-tight">
                    {Math.round(value)}<span className="text-white/40 text-sm ml-1">/ {maxValue}</span>
                </span>
            </div>
            {/* Track */}
            <div className="h-[6px] w-full bg-white/5 rounded-full overflow-hidden relative">
                {/* Fill */}
                <div 
                    className="absolute top-0 left-0 h-full bg-white transition-all duration-1000 ease-out"
                    style={{ width: `${width}%` }}
                >
                    {/* Optional: Add a subtle glow/gradient at the tip of the bar */}
                    <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent to-white/50 blur-[2px]" />
                </div>
            </div>
        </div>
    )
}
