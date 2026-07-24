'use client'

import React from 'react'
import { motion } from 'framer-motion'
export default function MeetVelodesk() {
  return (
    <section className="mv-section">
      <style dangerouslySetInnerHTML={{
        __html: `
        .mv-section {
          background: #04060D;
          color: #fff;
          padding: 140px 56px 120px;
          font-family: 'Outfit', sans-serif;
          border-top: 1px solid rgba(255,255,255,0.03);
          position: relative;
          overflow: hidden;
        }

        .mv-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* ─── HEADER ─── */
        .mv-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .mv-tag {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 20px;
        }

        .mv-title {
          font-size: 56px;
          font-weight: 200;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }

        .mv-title em {
          font-style: italic;
          font-family: 'Instrument Serif', 'Times New Roman', serif;
          font-weight: 400;
          color: #FF6B35;
        }

        .mv-intro {
          font-size: 20px;
          color: rgba(255,255,255,0.6);
          font-weight: 300;
          line-height: 1.6;
          max-width: 680px;
          margin: 0 auto;
        }

        /* ─── STORY BLOCKS ─── */
        .mv-story {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 100px;
        }

        .mv-block {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 40px;
          padding: 48px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: start;
        }

        .mv-block:first-child {
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .mv-block-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.25);
          padding-top: 6px;
          line-height: 1.6;
        }

        .mv-block-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mv-block-headline {
          font-size: 28px;
          font-weight: 300;
          line-height: 1.3;
          letter-spacing: -0.5px;
          color: rgba(255,255,255,0.95);
        }

        .mv-block-text {
          font-size: 17px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          font-weight: 300;
          max-width: 640px;
        }

        /* Accent block — the turning point */
        .mv-block.accent {
          background: linear-gradient(90deg, rgba(255,107,53,0.04) 0%, rgba(255,107,53,0) 60%);
          border-left: 2px solid #FF6B35;
          padding-left: 40px;
          margin-left: -40px;
          border-radius: 0 8px 8px 0;
        }

        /* Solution block — green glow */
        .mv-block.solution {
          background: linear-gradient(90deg, rgba(74,222,128,0.03) 0%, rgba(74,222,128,0) 60%);
          border-left: 2px solid #4ade80;
          padding-left: 40px;
          margin-left: -40px;
          border-radius: 0 8px 8px 0;
        }

        /* ─── DASHBOARD PREVIEW ─── */
        .mv-dashboard-wrap {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 40px 80px rgba(0,0,0,0.6),
            0 0 120px rgba(74,222,128,0.04);
        }

        .mv-dashboard-img {
          width: 100%;
          height: auto;
          display: block;
        }

        .mv-dashboard-caption {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: rgba(255,255,255,0.3);
          font-family: 'DM Mono', monospace;
          letter-spacing: 1px;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 900px) {
          .mv-section { padding: 80px 28px 60px; }
          .mv-block { grid-template-columns: 1fr; gap: 12px; padding: 32px 0; }
          .mv-block.accent, .mv-block.solution { margin-left: 0; padding-left: 24px; }
          .mv-title { font-size: 36px; }
        }
        `
      }} />

      <div className="mv-container">

        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mv-header"
        >
          <div className="mv-tag">Introducing</div>
          <h2 className="mv-title">Meet VeloDesk — <em>clarity</em> for founders who are done guessing.</h2>
          <p className="mv-intro">
            Every startup tool gives you more data. VeloDesk is the first to give you a definitive answer: do people actually want what you're building?
          </p>
        </motion.div>

        {/* STORY ARC */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="mv-story"
        >

          {/* 1. The customer's problem */}
          <div className="mv-block">
            <div className="mv-block-label">The Problem</div>
            <div className="mv-block-content">
              <div className="mv-block-headline">You're a founder with paying users, growing MRR, and no idea if any of it means product-market fit.</div>
              <div className="mv-block-text">
                Investors ask you "do you have PMF?" and your honest answer is a shrug wrapped in optimism. You feel it in your gut — but you can't prove it with numbers. The uncertainty is constant, corrosive, and quietly shaping every decision you make.
              </div>
            </div>
          </div>

          {/* 2. What they do today */}
          <div className="mv-block">
            <div className="mv-block-label">What You Do Today</div>
            <div className="mv-block-content">
              <div className="mv-block-headline">You open 8 tabs every Monday morning and try to piece the truth together manually.</div>
              <div className="mv-block-text">
                Stripe for revenue. Mixpanel for engagement. A Google Sheet for cohort analysis you built at 2am. HubSpot for pipeline. You copy numbers between tools, run formulas, squint at charts, and try to triangulate something that feels like signal. It takes hours. It never feels conclusive.
              </div>
            </div>
          </div>

          {/* 3. Why it will never work */}
          <div className="mv-block accent">
            <div className="mv-block-label">Why It Breaks</div>
            <div className="mv-block-content">
              <div className="mv-block-headline">Product-market fit is not a single metric. No individual tool can see the full picture.</div>
              <div className="mv-block-text">
                Retention alone doesn't tell you if revenue is healthy. Revenue alone doesn't tell you if users are engaged with your core feature. NPS alone doesn't tell you if anyone is actually referring others. PMF is a multi-dimensional signal, and every tool you use only sees one slice. You can't solve a five-dimensional problem with one-dimensional instruments, no matter how hard you try.
              </div>
            </div>
          </div>

          {/* 4. The price they pay */}
          <div className="mv-block">
            <div className="mv-block-label">The Price You Pay</div>
            <div className="mv-block-content">
              <div className="mv-block-headline">You burn months of runway building features nobody asked for, chasing growth that masks a leaky bucket.</div>
              <div className="mv-block-text">
                Worse — you walk into investor meetings unprepared, unable to answer "what's your D30 retention?" or "what's your blended CAC payback?" with precision. You lose deals not because your product is bad, but because you couldn't prove it was good. The emotional cost is just as real: the nagging anxiety that you're building in the dark, spending money you don't have, on a bet you can't quantify.
              </div>
            </div>
          </div>

          {/* 5. The new approach */}
          <div className="mv-block solution">
            <div className="mv-block-label">The New Approach</div>
            <div className="mv-block-content">
              <div className="mv-block-headline">What if one system could read all of your tools and synthesize the answer for you?</div>
              <div className="mv-block-text">
                Not another dashboard that just adds more charts to stare at. A genuine synthesis engine that absorbs complexity across your entire stack, applies a weighted mathematical model across five critical dimensions of product-market fit, and hands you one number you can trust. A system that gives you the visibility you never had — turning impossible decisions into obvious ones.
              </div>
            </div>
          </div>

          {/* 6. Here is what we do */}
          <div className="mv-block solution">
            <div className="mv-block-label">What VeloDesk Does</div>
            <div className="mv-block-content">
              <div className="mv-block-headline">VeloDesk connects to every tool you already use, reads the signals across five PMF dimensions, and gives you a single, definitive PMF Score™.</div>
              <div className="mv-block-text">
                In two minutes, you connect Stripe, Mixpanel, Paystack, HubSpot — whatever you use. VeloDesk ingests your data, normalizes it, and runs it through a weighted scoring model that evaluates retention, engagement, revenue quality, word of mouth, and founder conviction. You get a score, a trend, actionable recommendations, and an investor-ready report. No spreadsheets. No guessing. Just mathematical truth.
              </div>
            </div>
          </div>

          {/* 7. The new future */}
          <div className="mv-block">
            <div className="mv-block-label">The New Future</div>
            <div className="mv-block-content">
              <div className="mv-block-headline">You open one tab. You know exactly where you stand. You know exactly what to do next.</div>
              <div className="mv-block-text">
                The Monday morning panic is gone. Your board deck writes itself. Your investor conversations become presentations of proof, not pleas for patience. Your team rallies around one north star instead of debating which metric matters most. You stop building blindly and start building with absolute clarity. That's the future VeloDesk creates.
              </div>
            </div>
          </div>

        </motion.div>

        {/* DASHBOARD SCREENSHOT */}
        <div className="mv-dashboard-wrap">
          <img
            src="/dashboard-preview.png"
            alt="VeloDesk PMF Dashboard"
            className="mv-dashboard-img"
          />
        </div>
        <div className="mv-dashboard-caption">The VeloDesk PMF Dashboard — your single source of truth.</div>

      </div>
    </section>
  )
}
