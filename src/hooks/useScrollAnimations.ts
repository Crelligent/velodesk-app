'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * useScrollReveal — fires once when element enters viewport.
 * Returns a ref to attach + a boolean `isVisible`.
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

/**
 * useParallax — returns a Y offset that updates on scroll.
 * `speed` controls the parallax intensity (0.1 = subtle, 0.5 = heavy).
 */
export function useParallax(speed = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = ref.current
          if (el) {
            const rect = el.getBoundingClientRect()
            const viewportCenter = window.innerHeight / 2
            const elCenter = rect.top + rect.height / 2
            setOffset((elCenter - viewportCenter) * speed)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return { ref, offset }
}

/**
 * useCountUp — animates a number from 0 to `target` when `trigger` becomes true.
 */
export function useCountUp(target: number, duration = 2000, trigger = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!trigger) return
    let start: number | null = null
    let raf: number

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      }
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [trigger, target, duration])

  return value
}
