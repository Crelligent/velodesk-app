'use client'

import React from 'react'

export default function FeaturesBenefits() {
  return (
    <section className="fb-section" id="features">
      <style dangerouslySetInnerHTML={{
        __html: `
        .fb-section {
          background: #020308;
          color: #fff;
          padding: 140px 56px;
          font-family: 'Outfit', sans-serif;
          border-top: 1px solid rgba(255,255,255,0.02);
        }

        .fb-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .fb-header {
          text-align: center;
          margin-bottom: 100px;
        }

        .fb-tag {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #FF6B35;
          margin-bottom: 16px;
        }

        .fb-title {
          font-size: 48px;
          font-weight: 200;
          letter-spacing: -1px;
        }

        .fb-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }

        .fb-column {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .fb-col-title {
          font-size: 24px;
          font-weight: 400;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.9);
        }

        .fb-item {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .fb-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .fb-content h4 {
          font-size: 18px;
          font-weight: 400;
          margin-bottom: 8px;
          color: #fff;
        }

        .fb-content p {
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
          font-weight: 300;
        }

        /* Subtle highlighting for benefits */
        .benefit-col .fb-icon {
          background: rgba(74,222,128,0.05);
          border-color: rgba(74,222,128,0.2);
          color: #4ade80;
        }

        @media (max-width: 900px) {
          .fb-grid { grid-template-columns: 1fr; gap: 80px; }
          .fb-section { padding: 80px 28px; }
        }
        `
      }} />

      <div className="fb-container">
        <div className="fb-header">
          <div className="fb-tag">Everything You Need</div>
          <h2 className="fb-title">Powerful features. Undeniable benefits.</h2>
        </div>

        <div className="fb-grid">
          
          <div className="fb-column feature-col">
            <h3 className="fb-col-title">The Platform</h3>
            
            <div className="fb-item">
              <div className="fb-icon">🔌</div>
              <div className="fb-content">
                <h4>Universal Data Sync</h4>
                <p>Connects natively to Stripe, Mixpanel, Paystack, and 20+ other tools. We handle the data normalization.</p>
              </div>
            </div>

            <div className="fb-item">
              <div className="fb-icon">📊</div>
              <div className="fb-content">
                <h4>Dynamic PMF Dashboard</h4>
                <p>A real-time command center showing your PMF Score™, historical trends, and exact signal breakdowns.</p>
              </div>
            </div>

            <div className="fb-item">
              <div className="fb-icon">📄</div>
              <div className="fb-content">
                <h4>1-Click Investor Reports</h4>
                <p>Generate clean, mathematically sound product-market fit reports designed specifically for VC diligence.</p>
              </div>
            </div>

            <div className="fb-item">
              <div className="fb-icon">🔮</div>
              <div className="fb-content">
                <h4>Scenario Modeling</h4>
                <p>See exactly how a 5% increase in retention or a drop in churn will impact your overall PMF Score.</p>
              </div>
            </div>
          </div>

          <div className="fb-column benefit-col">
            <h3 className="fb-col-title">The Impact</h3>
            
            <div className="fb-item">
              <div className="fb-icon">✓</div>
              <div className="fb-content">
                <h4>Raise Capital Faster</h4>
                <p>Stop answering questions with "I think." Walk into partner meetings with empirical proof that your product works.</p>
              </div>
            </div>

            <div className="fb-item">
              <div className="fb-icon">✓</div>
              <div className="fb-content">
                <h4>Unify Your Team</h4>
                <p>End the debate over what metric matters most. Give engineering, product, and marketing one north star to chase.</p>
              </div>
            </div>

            <div className="fb-item">
              <div className="fb-icon">✓</div>
              <div className="fb-content">
                <h4>Stop Burning Runway</h4>
                <p>Know exactly when you have enough signal to pour money into paid acquisition, and when you need to fix the leaky bucket.</p>
              </div>
            </div>

            <div className="fb-item">
              <div className="fb-icon">✓</div>
              <div className="fb-content">
                <h4>Save 40+ Hours a Month</h4>
                <p>Never manually export CSVs, run pivot tables, or stitch together data in Google Sheets just to see your growth rate again.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
