'use client'

import React from 'react'

// Common founder problems Velodesk addresses — stated generally, not attributed to anyone.
const painPoints = [
  {
    title: 'Data spread across tools',
    text: 'Revenue in Paystack or Stripe, usage in Mixpanel, customers in a spreadsheet. Preparing a board update means stitching it together by hand.',
  },
  {
    title: 'Investor questions without answers',
    text: 'Investors ask for retention, churn and CAC. Without a single source of truth, those numbers take days to assemble and are hard to defend.',
  },
  {
    title: 'Unsure if you have product-market fit',
    text: 'You have users and some revenue, but no consistent way to tell whether they are the right users and whether they are staying.',
  },
]

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
          list-style: none;
          padding: 0;
          margin: 0;
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
          font-size: 18px;
          font-weight: 500;
          color: #fff;
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

      {/*
        This section previously showed quotes attributed to "Tobi O.", "Sarah M." and "David K."
        that could not be traced to real people, so they were removed. The pain points are kept
        as unattributed statements. TODO(owner): add real, consented customer quotes here.
      */}
      <div className="sp-container">
        
        <div className="sp-header">
          <h2 className="sp-title">You are not alone in the chaos.</h2>
        </div>

        <ul className="sp-grid">
          {painPoints.map((point) => (
            <li key={point.title} className="sp-card">
              <h3 className="sp-name">{point.title}</h3>
              <p className="sp-text">{point.text}</p>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
