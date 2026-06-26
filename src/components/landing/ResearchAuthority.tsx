'use client'

import React from 'react'

export default function ResearchAuthority() {
  return (
    <section className="research-section" id="research">
      <style dangerouslySetInnerHTML={{
        __html: `
        .research-section {
          background: #0A0D18;
          color: #fff;
          padding: 140px 56px;
          font-family: 'Outfit', sans-serif;
          border-top: 1px solid rgba(255,255,255,0.02);
          position: relative;
          overflow: hidden;
        }

        .research-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
          position: relative;
          z-index: 2;
        }

        .rs-left {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .rs-tag {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #FF6B35;
        }

        .rs-title {
          font-size: 56px;
          font-weight: 200;
          line-height: 1.1;
          letter-spacing: -2px;
        }

        .rs-subtitle {
          font-size: 18px;
          color: rgba(255,255,255,0.7);
          font-weight: 300;
          line-height: 1.6;
        }

        .rs-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
        }

        .rs-input-group {
          display: flex;
          gap: 12px;
        }

        .rs-input {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 16px 20px;
          color: #fff;
          font-size: 15px;
          font-family: 'Outfit', sans-serif;
          outline: none;
          transition: border-color 0.3s;
        }

        .rs-input:focus {
          border-color: rgba(255,255,255,0.3);
        }

        .rs-btn {
          background: #fff;
          color: #000;
          border: none;
          border-radius: 6px;
          padding: 0 32px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .rs-btn:hover {
          transform: translateY(-2px);
          background: #f0f0f0;
        }

        .rs-disclaimer {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }

        .rs-right {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-content: center;
        }

        .rs-stat-box {
          background: rgba(255,255,255,0.02);
          border-left: 3px solid #FF6B35;
          padding: 32px 40px;
          border-radius: 0 12px 12px 0;
        }

        .rs-stat-box.green { border-color: #4ade80; }
        .rs-stat-box.purple { border-color: #7B61FF; }

        .rs-stat-num {
          font-size: 56px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: -2px;
          margin-bottom: 12px;
        }

        .rs-stat-text {
          font-size: 16px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
        }

        /* Background blur effect */
        .rs-glow {
          position: absolute;
          top: 50%;
          right: -10%;
          transform: translateY(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,107,53,0.05) 0%, rgba(255,107,53,0) 70%);
          filter: blur(60px);
          z-index: 1;
        }

        @media (max-width: 900px) {
          .research-container { grid-template-columns: 1fr; gap: 60px; }
          .research-section { padding: 80px 28px; }
          .rs-input-group { flex-direction: column; }
          .rs-btn { padding: 16px; }
        }
        `
      }} />

      <div className="rs-glow"></div>

      <div className="research-container">
        
        <div className="rs-left">
          <div className="rs-tag">Original Research</div>
          <h2 className="rs-title">The State of PMF 2026</h2>
          <p className="rs-subtitle">
            We analyzed data from 400+ post-seed startups across global markets to understand exactly what separates the top 1% from the rest. The answers aren't what you think.
          </p>
          
          <form className="rs-form" onSubmit={(e) => e.preventDefault()}>
            <div className="rs-input-group">
              <input type="email" placeholder="Enter your work email" className="rs-input" required />
              <button type="submit" className="rs-btn">Get the Full Report</button>
            </div>
            <div className="rs-disclaimer">Join 2,000+ founders reading our insights. No spam, ever.</div>
          </form>
        </div>

        <div className="rs-right">
          
          <div className="rs-stat-box">
            <div className="rs-stat-num">92%</div>
            <div className="rs-stat-text">of Series A investors now demand raw cohort retention data before issuing a term sheet.</div>
          </div>

          <div className="rs-stat-box green">
            <div className="rs-stat-num">3.4x</div>
            <div className="rs-stat-text">higher valuation multiples for startups that can mathematically prove engagement depth.</div>
          </div>

          <div className="rs-stat-box purple">
            <div className="rs-stat-num">11 mo</div>
            <div className="rs-stat-text">The average runway wasted by teams building features before confirming core product-market fit.</div>
          </div>

        </div>

      </div>
    </section>
  )
}
