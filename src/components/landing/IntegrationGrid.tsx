'use client'

import React from 'react'

export default function IntegrationGrid() {
  return (
    <section className="int-grid-section">
      <style dangerouslySetInnerHTML={{
        __html: `
        .int-grid-section {
          background: #04060D;
          color: #fff;
          padding: 140px 56px;
          font-family: 'Outfit', sans-serif;
          border-top: 1px solid rgba(255,255,255,0.02);
          text-align: center;
        }

        .ig-header {
          margin-bottom: 80px;
        }

        .ig-title {
          font-size: 48px;
          font-weight: 200;
          letter-spacing: -1px;
          margin-bottom: 24px;
        }

        .ig-subtitle {
          font-size: 20px;
          color: rgba(255,255,255,0.6);
          font-weight: 300;
          max-width: 600px;
          margin: 0 auto;
        }

        .ig-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .ig-panel {
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 60px 40px;
        }

        .ig-panel-title {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 40px;
        }

        .ig-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          align-items: center;
          justify-items: center;
        }

        .ig-logo {
          height: 28px;
          width: auto;
          object-fit: contain;
          opacity: 0.6;
          transition: all 0.3s ease;
          filter: grayscale(100%) brightness(200%);
        }

        .ig-logo:hover {
          opacity: 1;
          filter: grayscale(0%) brightness(100%);
          transform: scale(1.1);
        }

        .ig-logo.text-logo {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.5px;
          filter: none;
        }

        @media (max-width: 900px) {
          .ig-container { grid-template-columns: 1fr; gap: 40px; }
          .int-grid-section { padding: 80px 28px; }
          .ig-grid { grid-template-columns: repeat(2, 1fr); }
        }
        `
      }} />

      <div className="ig-header">
        <h2 className="ig-title">We don't replace your tools.<br/>We read them.</h2>
        <p className="ig-subtitle">
          VeloDesk sits on top of your existing stack. No engineering required, no new SDKs to install. Just connect and sync.
        </p>
      </div>

      <div className="ig-container">
        
        <div className="ig-panel">
          <div className="ig-panel-title">Global Standards</div>
          <div className="ig-grid">
            <img src="/stripe.svg" alt="Stripe" className="ig-logo text-logo" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.removeAttribute('style'); }} /><span style={{display: 'none'}} className="ig-logo text-logo">Stripe</span>
            <img src="/mixpanel.svg" alt="Mixpanel" className="ig-logo" />
            <img src="/amplitude-color_v1.png" alt="Amplitude" className="ig-logo" />
            <img src="/hubspot.svg" alt="HubSpot" className="ig-logo" />
            <img src="/segment-1.svg" alt="Segment" className="ig-logo" />
            <img src="/google-analytics-4.svg" alt="Google Analytics" className="ig-logo" />
            <img src="/intercom-2.svg" alt="Intercom" className="ig-logo" />
            <img src="/zendesk-1.svg" alt="Zendesk" className="ig-logo" />
            <img src="/salesforce-2.svg" alt="Salesforce" className="ig-logo" />
          </div>
        </div>

        <div className="ig-panel">
          <div className="ig-panel-title">Regional Powerhouses</div>
          <div className="ig-grid">
            <img src="/paystack-2.svg" alt="Paystack" className="ig-logo" />
            <div className="ig-logo text-logo">Flutterwave</div>
            <div className="ig-logo text-logo">Moniepoint</div>
            <div className="ig-logo text-logo">Wave</div>
            <div className="ig-logo text-logo">Kuda</div>
            <div className="ig-logo text-logo">Opay</div>
          </div>
        </div>

      </div>
    </section>
  )
}
