'use client'

import React, { useId } from 'react'

interface WavyBackgroundProps {
  rotation?: number;
  opacity?: number;
  className?: string;
  gradientColors?: [string, string, string, string, string];
  scale?: number;
  offsetY?: string;
}

export default function WavyBackground({
  rotation = 0,
  opacity = 0.6,
  className = "",
  scale = 1.0,
  offsetY = "-50%",
  gradientColors = [
    "rgba(123, 97, 255, 0)",       // Transparent #7B61FF
    "rgba(123, 97, 255, 0.7)",     // #7B61FF
    "rgba(91, 141, 239, 0.7)",     // #5B8DEF
    "rgba(56, 189, 248, 0.7)",     // #38BDF8
    "rgba(56, 189, 248, 0)"        // Transparent #38BDF8
  ]
}: WavyBackgroundProps) {
  // Use React.useId() to generate a hydration-safe unique ID
  const rawId = useId()
  const gradientId = `gradient-wave-${rawId.replace(/:/g, '')}`

  return (
    <div 
      className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`} 
      style={{ opacity }}
    >
      <svg 
        className="absolute top-1/2 left-1/2 w-[1440px] h-[1000px]" 
        style={{ 
            transform: `translate(-50%, ${offsetY}) rotate(${rotation}deg) scale(${scale})`,
            minWidth: '100vw',
            minHeight: '100vh'
        }}
        viewBox="0 0 1440 1000" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        preserveAspectRatio="none"
      >
        {Array.from({ length: 70 }).map((_, i) => {
          const startY = 150 + i * 14;
          const cp1y = 400 - i * 9;
          const cp2y = 700 + i * 19;
          const endY = 250 + i * 12;
          
          return (
            <path
              key={i}
              d={`M -100 ${startY} C 400 ${cp1y}, 900 ${cp2y}, 1540 ${endY}`}
              stroke={`url(#${gradientId})`}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="20%" stopColor={gradientColors[1]} />
            <stop offset="50%" stopColor={gradientColors[2]} />
            <stop offset="80%" stopColor={gradientColors[3]} />
            <stop offset="100%" stopColor={gradientColors[4]} />
          </linearGradient>
        </defs>
      </svg>
      {/* Top and Bottom Fade Masks */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#04060D] via-transparent to-[#04060D]" />
    </div>
  )
}
