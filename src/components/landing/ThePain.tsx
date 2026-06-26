'use client'

import React from 'react'

export default function ThePain() {
  return (
    <section className="pain-section">
      <style dangerouslySetInnerHTML={{
        __html: `
        .pain-section {
          background: #04060D;
          color: #fff;
          padding: 120px 56px;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .pain-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .pain-left {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .pain-stat-block {
          border-left: 2px solid #FF6B35;
          padding-left: 24px;
        }

        .pain-stat {
          font-size: 64px;
          font-weight: 300;
          line-height: 1;
          margin-bottom: 12px;
          color: #fff;
          letter-spacing: -2px;
        }

        .pain-stat span {
          color: #FF6B35;
        }

        .pain-stat-desc {
          font-size: 18px;
          color: rgba(240,238,232,0.6);
          font-weight: 300;
          line-height: 1.5;
          max-width: 400px;
        }

        .pain-headline {
          font-size: 42px;
          font-weight: 200;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .pain-headline strong {
          font-weight: 500;
        }

        .pain-right {
          position: relative;
          min-height: 500px;
        }

        .pain-card {
          position: absolute;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 24px 32px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          max-width: 320px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .pain-card-title {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #FF6B35;
          margin-bottom: 12px;
        }

        .pain-card-text {
          font-size: 16px;
          color: rgba(255,255,255,0.9);
          font-weight: 300;
          line-height: 1.5;
        }

        /* Positioning the cards for a chaotic, scattered feel */
        .card-1 { top: 0; right: 40px; z-index: 3; transform: rotate(2deg); }
        .card-2 { top: 140px; left: 0; z-index: 2; transform: rotate(-3deg); }
        .card-3 { top: 280px; right: 20px; z-index: 4; transform: rotate(1deg); }
        .card-4 { top: 400px; left: 40px; z-index: 1; transform: rotate(-2deg); }

        @media (max-width: 900px) {
          .pain-container { grid-template-columns: 1fr; gap: 60px; }
          .pain-right { min-height: auto; display: flex; flex-direction: column; gap: 20px; }
          .pain-card { position: relative; top: 0 !important; left: 0 !important; right: 0 !important; transform: none !important; width: 100%; max-width: none; }
          .pain-section { padding: 80px 28px; }
        }
        `
      }} />

      <div className="pain-container">
        
        <div className="pain-left">
          <div className="pain-stat-block">
            <div className="pain-stat">78<span>%</span></div>
            <div className="pain-stat-desc">
              of founders can't name their Day 30 retention rate off the top of their head.
            </div>
          </div>

          <h2 className="pain-headline">
            You're drowning in dashboards, but starving for <strong>truth.</strong>
          </h2>
        </div>

        <div className="pain-right">
          
          <div className="pain-card card-1">
            <div className="pain-card-title">Scattered Data</div>
            <div className="pain-card-text">
              Stripe says revenue is up. Mixpanel says active users are down. Your CRM is a mess. Where is the actual signal?
            </div>
          </div>

          <div className="pain-card card-2">
            <div className="pain-card-title">The Investor Question</div>
            <div className="pain-card-text">
              "Do you have product-market fit?" You answer with a gut feeling instead of hard math. They politely pass.
            </div>
          </div>

          <div className="pain-card card-3">
            <div className="pain-card-title">Burning Runway</div>
            <div className="pain-card-text">
              Spending thousands on ads to drive top-of-funnel traffic into a leaky bucket you can't measure.
            </div>
          </div>

          <div className="pain-card card-4">
            <div className="pain-card-title">No Clear Answer</div>
            <div className="pain-card-text">
              Staring at 8 different tabs trying to piece together if you're actually building something people want.
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
