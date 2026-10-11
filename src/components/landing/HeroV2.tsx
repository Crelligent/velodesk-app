'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useParallax, useScrollReveal } from '@/hooks/useScrollAnimations'
import WavyBackground from './WavyBackground'
import IntegrationLogo from './IntegrationLogo'
import { LIVE_COUNT, LIVE_INTEGRATIONS } from './liveIntegrations'
import { PRIMARY_CTA, SECONDARY_CTA } from './ctaStyles'

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/investors', label: 'For investors' },
]

const FEATURED_IDS = ['stripe', 'paystack', 'mixpanel', 'hubspot']

export default function HeroV2() {
  const { ref: parallaxRef } = useParallax(0.12)
  const { ref: intRef, isVisible: intVisible } = useScrollReveal(0.3)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close the mobile menu on Escape and return focus to its button.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const featured = FEATURED_IDS.map((id) => LIVE_INTEGRATIONS.find((i) => i.id === id)?.name).filter(Boolean)

  return (
    <div className="relative bg-[#04060D] text-[#F0EEE8] font-outfit overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hero-noise {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.028;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { opacity: 0; animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }

        .int-marquee-container {
          overflow: hidden; position: relative; width: 100%;
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .int-marquee { display: flex; align-items: center; gap: 64px; width: max-content; animation: marqueeScroll 40s linear infinite; }
        .int-marquee:hover { animation-play-state: paused; }
        @keyframes marqueeScroll { to { transform: translateX(calc(-50% - 32px)); } }
        .int-logo-item {
          display: flex; align-items: center; filter: grayscale(100%) brightness(1.6) opacity(0.6);
          transition: filter 0.3s ease, opacity 0.6s ease, transform 0.6s ease;
          opacity: 0; transform: translateY(12px);
        }
        .int-logo-item.is-visible { opacity: 1; transform: translateY(0); }
        .int-logo-item:hover { filter: none; }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up { animation: none; opacity: 1; }
          .int-marquee { animation: none; flex-wrap: wrap; justify-content: center; width: auto; }
          .int-logo-item { opacity: 1; transform: none; transition: none; }
        }
        `,
        }}
      />
      <div className="hero-noise" />
      <WavyBackground offsetY="-90%" opacity={0.9} />

      {/* NAV */}
      <nav
        aria-label="Main"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? 'backdrop-blur-xl bg-[#04060D]/90 border-b border-white/5'
            : 'bg-gradient-to-b from-[#04060D] to-transparent border-b border-transparent'
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 relative z-10" aria-label="Velodesk home">
            <Image src="/velodesk%20(2).png" alt="" width={32} height={32} className="h-8 w-8" />
            <span className="flex flex-col justify-center">
              <span className="font-orbitron font-bold text-sm uppercase tracking-[0.15em] text-white leading-none">Velodesk</span>
              <span className="hidden sm:block font-dm-mono text-[10px] text-white/60 tracking-widest mt-1 uppercase">By Crelligent</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-white/70 hover:text-white transition">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative z-10">
            <Link href="/login" className="hidden md:inline text-sm font-medium text-white/80 hover:text-white transition">
              Sign in
            </Link>
            <Link href="/signup" className={`${PRIMARY_CTA} whitespace-nowrap px-4 py-2 text-sm`}>
              Start free trial
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white focus-visible:outline-2 focus-visible:outline-white"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div id={menuId} hidden={!menuOpen} className="md:hidden border-t border-white/5 px-4 pb-6">
          <ul className="flex flex-col py-2">
            {[...NAV_LINKS, { href: '/login', label: 'Sign in' }].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block py-3 text-base text-white/80 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* HERO CONTENT */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-32 md:pt-48 pb-16 px-4 md:px-6 text-center">
        <h1 className="animate-fade-up text-[2.6rem] sm:text-5xl md:text-7xl lg:text-[84px] font-medium tracking-tight leading-[1.02] md:leading-[0.95] mb-6 max-w-5xl">
          <span className="text-white">Your startup has</span>{' '}
          <span className="font-instrument italic font-normal bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent pr-1">a score.</span>
          <br />
          <span className="text-white/75">You just can&apos;t see it yet.</span>
        </h1>

        <p className="animate-fade-up delay-200 text-lg md:text-xl font-light text-white/75 max-w-2xl mb-10 leading-relaxed">
          Velodesk reads your payment, product and support data to calculate the single number investors care about:
          your <strong className="text-white font-medium">PMF Score</strong>.
        </p>

        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-16 md:mb-20">
          <Link href="/signup" className={`${PRIMARY_CTA} px-8 py-4 text-lg`}>
            Start free trial
          </Link>
          <Link href="/pricing" className={`${SECONDARY_CTA} px-8 py-4 text-lg`}>
            See pricing
          </Link>
        </div>

        {/* Product screenshot (sample data) */}
        <div ref={parallaxRef} className="animate-fade-up delay-500 relative w-full max-w-6xl mx-auto">
          <div className="relative rounded-2xl md:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-[#7B61FF]/10 bg-[#050505]">
            <Image
              src="/new-velodesk-dashboard.png"
              alt="Velodesk dashboard showing a PMF Score, revenue metrics and an activity feed (sample data)"
              width={1387}
              height={1134}
              priority
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="w-full h-auto"
            />
            <span className="absolute left-3 top-3 md:left-5 md:top-5 rounded-full border border-white/15 bg-[#04060D]/85 px-3 py-1 font-dm-mono text-[11px] uppercase tracking-wider text-white backdrop-blur">
              Sample data
            </span>
          </div>
          <div aria-hidden="true" className="absolute inset-x-0 -bottom-px h-24 bg-gradient-to-b from-transparent to-[#04060D] pointer-events-none" />
        </div>
      </section>

      {/* LIVE INTEGRATIONS MARQUEE */}
      <section ref={intRef} aria-label="Tools you can connect" className="relative z-10 pb-20 md:pb-28 pt-6">
        <p className="text-center text-xs font-dm-mono tracking-widest uppercase text-white/70 mb-8 px-6">
          {LIVE_COUNT} tools connect today: {featured.join(', ')} and more
        </p>
        <div className="int-marquee-container max-w-7xl mx-auto px-4 md:px-8">
          <div className="int-marquee">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex items-center gap-16" aria-hidden={copy === 1 ? true : undefined}>
                {LIVE_INTEGRATIONS.map((integration, i) => (
                  <li
                    key={`${copy}-${integration.id}`}
                    className={`int-logo-item ${intVisible ? 'is-visible' : ''}`}
                    style={{ transitionDelay: intVisible ? `${i * 60}ms` : undefined }}
                  >
                    <IntegrationLogo integration={integration} variant="mark" decorative={copy === 1} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
