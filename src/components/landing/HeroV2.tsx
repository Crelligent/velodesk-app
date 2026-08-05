'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParallax, useScrollReveal } from '@/hooks/useScrollAnimations'
import WavyBackground from './WavyBackground'

export default function HeroV2() {
  const { ref: parallaxRef } = useParallax(0.12)
  const { ref: intRef, isVisible: intVisible } = useScrollReveal(0.3)
  const logoRefs = useRef<(HTMLImageElement | null)[]>([])
  const [scrolled, setScrolled] = useState(false)

  // Sticky nav scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!intVisible) return
    logoRefs.current.forEach((logo, i) => {
      if (logo) {
        logo.style.transition = `opacity 0.6s ease ${i * 80}ms, transform 0.6s ease ${i * 80}ms`
        logo.style.opacity = '1'
        logo.style.transform = 'translateY(0)'
      }
    })
  }, [intVisible])

  const integrationLogos = [
    { src: '/google-analytics-4.svg', alt: 'Google Analytics' },
    { src: '/hotjar-2.svg', alt: 'Hotjar' },
    { src: '/segment-1.svg', alt: 'Segment' },
    { src: '/Canny_logo.png', alt: 'Canny' },
    { src: '/hubspot.svg', alt: 'HubSpot' },
    { src: '/intercom-2.svg', alt: 'Intercom' },
    { src: '/mixpanel.svg', alt: 'Mixpanel' },
    { src: '/paystack-2.svg', alt: 'Paystack' },
    { src: '/pipedrive.svg', alt: 'Pipedrive' },
    { src: '/salesforce-2.svg', alt: 'Salesforce' },
    { src: '/typeform.svg', alt: 'Typeform' },
    { src: '/zendesk-1.svg', alt: 'Zendesk' },
  ]

  return (
    <div className="relative min-h-screen bg-[#04060D] text-[#F0EEE8] font-outfit overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@200;300;400;500;600;700;800&family=Orbitron:wght@400;500;600;700;800;900&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
        
        .hero-noise {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.028;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { opacity: 0; animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }

        .int-marquee-container {
          overflow: hidden; position: relative; width: 100%;
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .int-marquee {
          display: flex; align-items: center; gap: 64px; width: max-content;
          animation: marqueeScroll 30s linear infinite;
        }
        .int-marquee:hover { animation-play-state: paused; }
        @keyframes marqueeScroll { to { transform: translateX(calc(-50% - 32px)); } }
        
        .int-logo {
          height: 28px; width: auto; object-fit: contain;
          filter: grayscale(100%) opacity(0.4);
          transition: filter 0.3s ease, transform 0.3s ease;
          opacity: 0;
          transform: translateY(12px);
        }
        .int-logo:hover { filter: grayscale(0%) opacity(1); }
        `
      }} />
      <div className="hero-noise" />
      <WavyBackground offsetY="-90%" opacity={0.9} />

      {/* NAV — Sticky with scroll effect */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-xl bg-[#04060D]/80 border-b border-white/5'
            : 'bg-gradient-to-b from-[#04060D] to-transparent border-b border-transparent'
        }`}
      >
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <img src="/velodesk%20(2).png" alt="Velodesk" className="h-12 w-auto" />
          <div className="flex flex-col justify-center">
            <span className="font-orbitron font-bold text-lg tracking-[0.15em] text-white leading-none">VELODESK</span>
            <span className="font-mono text-[9px] text-white/30 tracking-widest mt-1 uppercase">By Crelligent & Co.</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          <Link href="#how-it-works" className="text-sm font-light text-white/50 hover:text-white transition">How it Works</Link>
          <Link href="#research" className="text-sm font-light text-white/50 hover:text-white transition">Research</Link>
          <Link href="#for-investors" className="text-sm font-light text-white/50 hover:text-white transition">For Investors</Link>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <Link href="/auth/login" className="text-sm font-medium text-white hover:text-[#7B61FF] transition">Sign In</Link>
          <Link href="/auth/register" className="px-5 py-2.5 bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] hover:brightness-110 text-white text-sm font-medium rounded-full transition border border-white/10">Get Early Access</Link>
        </div>
      </nav>

      {/* HERO CONTENT */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-48 pb-20 px-6 text-center">
        
        {/* Headline */}
        <h1 className="animate-fade-up text-5xl md:text-7xl lg:text-[84px] font-medium tracking-tight leading-[0.95] mb-6 max-w-5xl">
          <span className="bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent">Your startup has</span>{' '}
          <span className="font-['Instrument_Serif'] italic font-normal bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] bg-clip-text text-transparent">a score.</span><br />
          <span className="bg-gradient-to-b from-white/35 to-white/15 bg-clip-text text-transparent">You just can&apos;t see it yet.</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-up delay-200 text-lg md:text-xl font-light text-white/50 max-w-2xl mb-10 leading-relaxed">
          VeloDesk reads your Stripe, Mixpanel, and 17 other tools to calculate the single number investors actually care about: your <strong className="text-white font-medium">PMF Score™</strong>.
        </p>

        {/* Call to Action */}
        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link href="/auth/register" className="px-8 py-4 bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] text-white text-lg font-medium transition-all duration-300 rounded-full transform hover:-translate-y-1 hover:brightness-110 border border-white/10">
            Calculate My Score
          </Link>
          <Link href="#demo" className="px-8 py-4 bg-transparent text-white/70 hover:text-white text-lg font-medium transition rounded-full flex items-center gap-2">
            View Live Demo
          </Link>
        </div>

        {/* PARALLAX FLOAT on Dashboard Screenshot */}
        <div
          ref={parallaxRef}
          className="animate-fade-up delay-500 relative w-full max-w-6xl mx-auto"
          style={{ transition: 'transform 0.1s linear' }}
        >
          <div className="relative rounded-2xl md:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-[#050505]">
            <img 
              src="/new-velodesk-dashboard.png" 
              alt="Velodesk Dashboard" 
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition duration-700"
            />
          </div>

          {/* Mirror Reflection */}
          <div className="relative mt-0 overflow-hidden" style={{ height: '180px' }}>
            <div 
              className="absolute top-0 left-0 right-0 rounded-2xl md:rounded-[32px] overflow-hidden"
              style={{ transform: 'scaleY(-1)' }}
            >
              <img 
                src="/new-velodesk-dashboard.png" 
                alt="" 
                aria-hidden="true"
                className="w-full h-auto object-cover opacity-60"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#04060D]/70 to-[#04060D] pointer-events-none" />
          </div>
        </div>

      </section>

      {/* INTEGRATION LOGO FADE-IN WAVE */}
      <section ref={intRef} className="relative z-10 pb-32 pt-10">
        <p className="text-center text-xs font-mono tracking-widest uppercase text-white/30 mb-8">Seamlessly reads data from</p>
        <div className="int-marquee-container max-w-7xl mx-auto px-8">
          <div className="int-marquee">
            <div className="flex items-center gap-16">
              {integrationLogos.map((logo, i) => (
                <img
                  key={`g1-${i}`}
                  ref={el => { logoRefs.current[i] = el }}
                  src={logo.src}
                  alt={logo.alt}
                  className="int-logo"
                />
              ))}
            </div>
            <div className="flex items-center gap-16">
              {integrationLogos.map((logo, i) => (
                <img
                  key={`g2-${i}`}
                  ref={el => { logoRefs.current[i + integrationLogos.length] = el }}
                  src={logo.src}
                  alt={logo.alt}
                  className="int-logo"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
