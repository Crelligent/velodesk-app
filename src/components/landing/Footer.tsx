import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const PLATFORM_LINKS = [
  { href: '/#how-it-works', label: 'Features' },
  { href: '/#integrations', label: 'Integrations' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/investors', label: 'For investors' },
]

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

const linkClass = 'text-[15px] text-white/70 transition-colors hover:text-[#A9B8FF] focus-visible:outline-2 focus-visible:outline-white'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#020308] px-4 pb-10 pt-16 font-outfit text-white md:px-14 md:pt-20">
      <div className="mx-auto mb-16 grid max-w-[1200px] grid-cols-1 gap-10 md:mb-20 md:grid-cols-[2fr_1fr_1fr] md:gap-14">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="Velodesk home">
            <Image src="/velodesk%20(2).png" alt="" width={48} height={48} className="h-12 w-12" />
            <span className="font-orbitron text-2xl font-bold uppercase tracking-[2px] text-white">Velodesk</span>
          </Link>
          <p className="max-w-[300px] text-[15px] leading-relaxed text-white/70">
            Measure product-market fit from your real data.
          </p>
        </div>

        <nav aria-label="Platform">
          <h2 className="mb-6 font-dm-mono text-xs uppercase tracking-[2px] text-white">Platform</h2>
          <ul className="flex flex-col gap-4">
            {PLATFORM_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className="mb-6 font-dm-mono text-xs uppercase tracking-[2px] text-white">Legal</h2>
          <ul className="flex flex-col gap-4">
            {LEGAL_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="https://crelligent.com" target="_blank" rel="noreferrer" className={linkClass}>
                By Crelligent &amp; Company
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 text-center md:flex-row md:text-left">
        <p className="text-sm text-white/60">© {new Date().getFullYear()} Velodesk by Crelligent &amp; Company. All rights reserved.</p>
        <ul className="flex gap-6">
          <li>
            <a href="https://x.com/crelligent" target="_blank" rel="noreferrer" className="text-sm text-white/60 transition-colors hover:text-white">
              X (Twitter)
            </a>
          </li>
          <li>
            <a href="https://linkedin.com/company/crelligent" target="_blank" rel="noreferrer" className="text-sm text-white/60 transition-colors hover:text-white">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
