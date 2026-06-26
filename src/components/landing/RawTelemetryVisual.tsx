'use client'

import React, { useEffect, useRef } from 'react'

const COLORS = [
  '#9b5de5', // Purple
  '#00f5d4', // Cyan
  '#84b6f4', // Light blue
  '#f15bb5', // Pink
  '#9ef01a', // Lime
  '#00bbf9', // Blue
  '#ef233c', // Red
  '#fee440', // Yellow
]

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  opacity: number
  life: number
  maxLife: number
  
  constructor(startX: number, startY: number, color: string, canvasWidth: number, canvasHeight: number) {
    this.x = startX
    this.y = startY
    // Initial velocity mostly horizontal
    this.vx = Math.random() * 2 + 2
    this.vy = (Math.random() - 0.5) * 0.5
    this.color = color
    this.size = Math.random() * 1.5 + 0.5
    this.opacity = 1
    this.life = 0
    this.maxLife = Math.random() * 200 + 100
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.life++
    
    // Spread out more as they move right
    if (this.x > canvasWidth * 0.3) {
        // Add some random vertical scatter
        this.vy += (Math.random() - 0.5) * 0.4
        // Decelerate horizontally a bit
        this.vx *= 0.98
    } else {
        // Keep them grouped initially
        this.vy += (Math.random() - 0.5) * 0.05
    }

    this.x += this.vx
    this.y += this.vy

    // Fade out near the end of life or right edge
    if (this.life > this.maxLife * 0.8 || this.x > canvasWidth - 20) {
        this.opacity = Math.max(0, this.opacity - 0.02)
    }

    return this.opacity > 0
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    
    // Slight glow
    ctx.shadowBlur = 5
    ctx.shadowColor = this.color
    ctx.fill()
    ctx.shadowBlur = 0
  }
}

export default function RawTelemetryVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    
    const resizeCanvas = () => {
        // Support High DPI displays
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const sources = COLORS.map((color, i) => ({
        y: (i + 1) * (canvas.getBoundingClientRect().height / (COLORS.length + 1)),
        color
    }))

    const render = () => {
      const rect = canvas.getBoundingClientRect()
      
      // Clear with trail effect (match the bg color #090A10)
      ctx.globalAlpha = 0.15
      ctx.fillStyle = '#090A10'
      ctx.fillRect(0, 0, rect.width, rect.height)
      
      // Draw source nodes
      ctx.globalAlpha = 1
      sources.forEach(source => {
          ctx.fillStyle = source.color
          ctx.beginPath()
          ctx.arc(20, source.y, 3, 0, Math.PI * 2)
          ctx.fill()
          
          // Spawn new particles from this source
          if (Math.random() < 0.4) {
              particles.push(new Particle(20, source.y, source.color, rect.width, rect.height))
          }
      })

      // Update and draw particles
      ctx.globalCompositeOperation = 'lighter'
      particles = particles.filter(p => {
          const isAlive = p.update(rect.width, rect.height)
          if (isAlive) p.draw(ctx)
          return isAlive
      })
      ctx.globalCompositeOperation = 'source-over'

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="w-full h-full bg-[#090A10] rounded-xl overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
