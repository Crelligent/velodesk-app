'use client'

import React from 'react'

export default function Footer() {
  return (
    <footer className="footer-section">
      <style dangerouslySetInnerHTML={{
        __html: `
        .footer-section {
          background: #020308;
          color: #fff;
          padding: 80px 56px 40px;
          font-family: 'Outfit', sans-serif;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 80px;
        }

        .ft-brand {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ft-logo-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ft-logo-img {
          height: 56px;
          width: auto;
          object-fit: contain;
        }

        .ft-logo {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: 24px;
          letter-spacing: 2px;
          color: #fff;
        }

        .ft-tagline {
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          max-width: 300px;
          line-height: 1.6;
        }

        .ft-column-title {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #fff;
          margin-bottom: 24px;
        }

        .ft-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ft-link {
          font-size: 15px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.2s;
        }

        .ft-link:hover {
          color: #7B61FF;
        }

        .ft-bottom {
          max-width: 1200px;
          margin: 0 auto;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ft-copyright {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }

        .ft-socials {
          display: flex;
          gap: 24px;
        }

        .ft-social-link {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.2s;
        }

        .ft-social-link:hover {
          color: #fff;
        }

        .ft-compliance {
          max-width: 1200px;
          margin: 0 auto 32px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }

        .ft-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.30);
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .footer-container { grid-template-columns: 1fr; gap: 40px; }
          .footer-section { padding: 60px 28px 32px; }
          .ft-bottom { flex-direction: column; gap: 24px; text-align: center; }
          .ft-compliance { gap: 8px; }
        }
        `
      }} />

      <div className="footer-container">
        
        <div className="ft-brand">
          <div className="ft-logo-wrapper">
            <img src="/velodesk%20(2).png" alt="" className="ft-logo-img" />
            <div className="ft-logo">VELODESK</div>
          </div>
          <div className="ft-tagline">
            The standard for proving product-market fit. Stop guessing, start knowing.
          </div>
        </div>

        <div className="ft-column">
          <div className="ft-column-title">Platform</div>
          <div className="ft-links">
            <a href="#how-it-works" className="ft-link">How it Works</a>
            <a href="#features" className="ft-link">Features</a>
            <a href="#research" className="ft-link">The Research</a>
            <Link href="/investors" className="ft-link">For Investors</Link>
          </div>
        </div>

        <div className="ft-column">
          <div className="ft-column-title">Legal</div>
          <div className="ft-links">
            <a href="#" className="ft-link">Privacy Policy</a>
            <a href="#" className="ft-link">Terms of Service</a>
            <a href="https://crelligent.com" target="_blank" rel="noreferrer" className="ft-link">by Crelligent & Co.</a>
          </div>
        </div>

      </div>

      {/* Security & Compliance Badges */}
      <div className="ft-compliance">
        <span className="ft-badge">🛡️ SOC 2 Type II</span>
        <span className="ft-badge">🔒 GDPR Compliant</span>
        <span className="ft-badge">🔐 256-bit Encryption</span>
        <span className="ft-badge">⬆ 99.9% Uptime SLA</span>
      </div>

      <div className="ft-bottom">
        <div className="ft-copyright">
          © {new Date().getFullYear()} VeloDesk by Crelligent & Company. All rights reserved.
        </div>
        <div className="ft-socials">
          <a href="#" className="ft-social-link">Twitter / X</a>
          <a href="#" className="ft-social-link">LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}
