'use client'

import React from 'react'
import Link from 'next/link'

// The former waitlist copy ("Limited Availability", "First 500 founders get prioritized
// onboarding", "Spots are filling up fast") was invented scarcity and contradicted the open
// 14-day trial; its email form also discarded submissions. Replaced with a direct trial CTA.
// The 1-on-1 diagnostic session offer is hidden until the owner confirms it is real.
const SHOW_UNVERIFIED_CLAIMS = false

export default function FinalCTA() {
  return (
    <section className="cta-section" id="waitlist">
      <style dangerouslySetInnerHTML={{
        __html: `
        .cta-section {
          background: #FF6B35;
          color: #000;
          padding: 160px 56px;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .cta-container {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .cta-tag {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 24px;
          font-weight: 600;
        }

        .cta-title {
          font-size: 64px;
          font-weight: 200;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 32px;
        }

        .cta-subtitle {
          font-size: 20px;
          color: rgba(0,0,0,0.8);
          line-height: 1.6;
          margin-bottom: 48px;
        }

        .cta-form {
          display: flex;
          max-width: 500px;
          margin: 0 auto;
          background: #fff;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .cta-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 16px 20px;
          font-size: 16px;
          font-family: 'Outfit', sans-serif;
          outline: none;
          color: #000;
        }

        .cta-btn {
          background: #000;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0 32px;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          background: #222;
        }

        .cta-link {
          display: inline-block;
          background: #000;
          color: #fff;
          border-radius: 8px;
          padding: 18px 40px;
          font-weight: 500;
          font-size: 16px;
          text-decoration: none;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          transition: transform 0.2s, background 0.2s;
        }

        .cta-link:hover {
          transform: translateY(-2px);
          background: #222;
        }

        .cta-link:focus-visible {
          outline: 3px solid #000;
          outline-offset: 4px;
        }

        .cta-disclaimer {
          margin-top: 24px;
          font-size: 14px;
          color: rgba(0,0,0,0.8);
          font-weight: 500;
        }

        /* Abstract shapes */
        .cta-shape-1 {
          position: absolute;
          top: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          z-index: 1;
          filter: blur(40px);
        }

        .cta-shape-2 {
          position: absolute;
          bottom: -150px;
          right: -100px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: rgba(0,0,0,0.05);
          z-index: 1;
          filter: blur(60px);
        }

        @media (max-width: 900px) {
          .cta-title { font-size: 48px; }
          .cta-section { padding: 100px 28px; }
          .cta-form { flex-direction: column; background: transparent; box-shadow: none; padding: 0; gap: 12px; }
          .cta-input { background: #fff; border-radius: 8px; }
          .cta-btn { padding: 18px; border-radius: 8px; }
        }
        `
      }} />

      <div className="cta-shape-1"></div>
      <div className="cta-shape-2"></div>

      <div className="cta-container">
        <div className="cta-tag">14-day free trial</div>
        <h2 className="cta-title">See your real PMF Score.</h2>
        <p className="cta-subtitle">
          Connect Paystack or Stripe and get a score calculated from your actual data.
          {SHOW_UNVERIFIED_CLAIMS && (
            <> You&apos;ll also get a personalized 1-on-1 PMF diagnostic session with our data team.</>
          )}
        </p>

        <Link href="/signup" className="cta-link">Start your free trial</Link>

        <div className="cta-disclaimer">No credit card required.</div>
      </div>
    </section>
  )
}
