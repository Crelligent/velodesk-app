'use client'

import React from 'react'

export default function InvestorsPartners() {
  return (
    <section className="ip-section" id="for-investors">
      <style dangerouslySetInnerHTML={{
        __html: `
        .ip-section {
          background: #020308;
          color: #fff;
          padding: 140px 56px;
          font-family: 'Outfit', sans-serif;
          border-top: 1px solid rgba(255,255,255,0.02);
        }

        .ip-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .ip-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .ip-title {
          font-size: 48px;
          font-weight: 200;
          letter-spacing: -1px;
        }

        .ip-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .ip-card {
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 60px 48px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .ip-card:hover {
          transform: translateY(-5px);
        }

        .ip-card.vc:hover { border-color: rgba(74,222,128,0.3); }
        .ip-card.accel:hover { border-color: rgba(123,97,255,0.3); }

        .ip-card-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .ip-card-title {
          font-size: 32px;
          font-weight: 300;
          letter-spacing: -1px;
        }

        .ip-card-text {
          font-size: 16px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          flex-grow: 1;
        }

        .ip-btn {
          display: inline-block;
          padding: 14px 28px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          text-align: center;
          transition: background 0.2s, color 0.2s;
          cursor: pointer;
          align-self: flex-start;
          margin-top: 16px;
        }

        .ip-btn-vc {
          background: transparent;
          color: #4ade80;
          border: 1px solid rgba(74,222,128,0.3);
        }
        .ip-btn-vc:hover {
          background: rgba(74,222,128,0.1);
        }

        .ip-btn-accel {
          background: transparent;
          color: #7B61FF;
          border: 1px solid rgba(123,97,255,0.3);
        }
        .ip-btn-accel:hover {
          background: rgba(123,97,255,0.1);
        }

        @media (max-width: 900px) {
          .ip-grid { grid-template-columns: 1fr; gap: 40px; }
          .ip-section { padding: 80px 28px; }
          .ip-card { padding: 40px 32px; }
        }
        `
      }} />

      <div className="ip-container">
        
        <div className="ip-header">
          <h2 className="ip-title">For the Capital Allocators</h2>
        </div>

        <div className="ip-grid">
          
          <div className="ip-card vc">
            <div className="ip-card-icon">🦅</div>
            <h3 className="ip-card-title">VCs & Angels</h3>
            <p className="ip-card-text">
              Stop waiting for board meetings to know if your portfolio companies are finding traction. Recommend VeloDesk to your founders and get unified, standardized PMF reporting across your entire portfolio.
            </p>
            <a href="mailto:partners@velodesk.com?subject=VC Partnership" className="ip-btn ip-btn-vc">Recommend to Portfolio</a>
          </div>

          <div className="ip-card accel">
            <div className="ip-card-icon">🚀</div>
            <h3 className="ip-card-title">Accelerators</h3>
            <p className="ip-card-text">
              Provide your entire cohort with the ultimate tool for proving product-market fit to downstream investors. Become an official VeloDesk partner and get bulk access and custom reporting for your batches.
            </p>
            <a href="mailto:partners@velodesk.com?subject=Accelerator Partnership" className="ip-btn ip-btn-accel">Become a Partner</a>
          </div>

        </div>

      </div>
    </section>
  )
}
