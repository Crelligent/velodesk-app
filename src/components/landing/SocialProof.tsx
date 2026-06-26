'use client'

import React from 'react'

export default function SocialProof() {
  return (
    <section className="sp-section">
      <style dangerouslySetInnerHTML={{
        __html: `
        .sp-section {
          background: #04060D;
          color: #fff;
          padding: 140px 56px;
          font-family: 'Outfit', sans-serif;
          border-top: 1px solid rgba(255,255,255,0.02);
        }

        .sp-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .sp-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .sp-title {
          font-size: 40px;
          font-weight: 200;
          letter-spacing: -1px;
        }

        .sp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .sp-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sp-quote-mark {
          font-family: 'Times New Roman', serif;
          font-size: 64px;
          color: #FF6B35;
          line-height: 0.5;
          opacity: 0.5;
        }

        .sp-text {
          font-size: 16px;
          color: rgba(255,255,255,0.8);
          line-height: 1.6;
          font-weight: 300;
          flex-grow: 1;
        }

        .sp-author {
          display: flex;
          align-items: center;
          gap: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 24px;
        }

        .sp-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          color: rgba(255,255,255,0.6);
          font-size: 14px;
        }

        .sp-info {
          display: flex;
          flex-direction: column;
        }

        .sp-name {
          font-size: 15px;
          font-weight: 500;
        }

        .sp-role {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }

        @media (max-width: 900px) {
          .sp-grid { grid-template-columns: 1fr; gap: 32px; }
          .sp-section { padding: 80px 28px; }
        }
        `
      }} />

      <div className="sp-container">
        
        <div className="sp-header">
          <h2 className="sp-title">You are not alone in the chaos.</h2>
        </div>

        <div className="sp-grid">
          
          <div className="sp-card">
            <div className="sp-quote-mark">"</div>
            <p className="sp-text">
              "We were generating revenue, but I honestly couldn't tell you if we had product-market fit. I had to pull data from Stripe, Amplitude, and our database just to prep for board meetings. It was a nightmare."
            </p>
            <div className="sp-author">
              <div className="sp-avatar">TO</div>
              <div className="sp-info">
                <div className="sp-name">Tobi O.</div>
                <div className="sp-role">Fintech Founder, Lagos</div>
              </div>
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-quote-mark">"</div>
            <p className="sp-text">
              "Investors kept asking for our D30 retention and blended CAC. My co-founder and I would literally just look at each other. If I had a single dashboard that gave me the exact math, I would have raised our seed round 3 months faster."
            </p>
            <div className="sp-author">
              <div className="sp-avatar">SM</div>
              <div className="sp-info">
                <div className="sp-name">Sarah M.</div>
                <div className="sp-role">SaaS Founder, London</div>
              </div>
            </div>
          </div>

          <div className="sp-card">
            <div className="sp-quote-mark">"</div>
            <p className="sp-text">
              "The anxiety of not knowing if we were building something people actually wanted was killing me. We had active users, but were they the right users? I needed absolute mathematical certainty, not a guess."
            </p>
            <div className="sp-author">
              <div className="sp-avatar">DK</div>
              <div className="sp-info">
                <div className="sp-name">David K.</div>
                <div className="sp-role">Logistics Founder, Nairobi</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
