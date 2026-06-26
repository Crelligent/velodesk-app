'use client'

import React from 'react'

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

        .cta-disclaimer {
          margin-top: 24px;
          font-size: 14px;
          color: rgba(0,0,0,0.6);
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
        <div className="cta-tag">Limited Availability</div>
        <h2 className="cta-title">First 500 founders get 3 months free.</h2>
        <p className="cta-subtitle">
          Join the waitlist today. When we launch, you'll receive an extended free trial and a personalized 1-on-1 PMF diagnostic session with our data team.
        </p>
        
        <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your work email" className="cta-input" required />
          <button type="submit" className="cta-btn">Join the Waitlist</button>
        </form>

        <div className="cta-disclaimer">Spots are filling up fast. Don't build in the dark.</div>
      </div>
    </section>
  )
}
