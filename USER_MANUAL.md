# Velodesk User Manual

**Version 1.0 | Last Updated: December 2024**

Welcome to Velodesk — the AI-powered Product-Market Fit (PMF) platform that helps startups and product teams validate, measure, and optimize their path to product-market fit.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Core Features](#core-features)
4. [AR/XR Lab](#arxr-lab)
5. [Enterprise Features](#enterprise-features)
6. [Integrations](#integrations)
7. [API Access](#api-access)
8. [Support](#support)

---

## Getting Started

### Creating Your Account

1. Visit `https://velodesk.io`
2. Click **Get Started** or **Sign Up**
3. Enter your email and create a password
4. Complete the onboarding questionnaire:
   - Company name
   - Industry
   - Team size
   - Current stage

### First-Time Setup

After signing up:

1. **Connect Integrations** — Link your analytics, CRM, and payment tools
2. **View Your PMF Score** — See your initial product-market fit assessment
3. **Explore Insights** — Review AI-generated recommendations

---

## Dashboard Overview

The Velodesk dashboard is organized into sections:

| Section | Purpose |
|---------|---------|
| **Core** | Overview, Analytics, Retention tracking |
| **Intelligence** | Validations, Leads, Trends |
| **Product** | Prototyping, Simulations |
| **AR/XR Lab** | 3D visualizations for investor presentations |
| **Growth** | AI Copilot, Competitive analysis, GTM Strategy |
| **Share** | PMF Reports, Data Room, Embeddable Badges |
| **Enterprise** | Team management, API Keys, White-label settings |
| **Settings** | Integrations, Account preferences |

---

## Core Features

### PMF Score

Your Product-Market Fit score (0-100) is calculated from 5 key metrics:

- **Retention** (25%) — How many users return
- **Growth** (20%) — User acquisition rate
- **Engagement** (20%) — User activity depth
- **Revenue** (20%) — Monetization health
- **Satisfaction** (15%) — NPS and feedback

**Score Ranges:**
- 80-100: Strong PMF ✅
- 60-79: Emerging PMF 📈
- 40-59: Searching 🔍
- 0-39: Pre-PMF ⚠️

### Analytics

Track your key metrics over time:
- Daily/weekly/monthly trends
- Cohort analysis
- Funnel visualization

### Retention

Monitor user retention with:
- Retention curves
- Churn prediction
- At-risk user identification

### Validations

Run experiments to validate assumptions:
- Create hypothesis
- Define success criteria
- Track experiment results

### Leads

Score and manage leads:
- ML-powered lead scoring
- Company fit analysis
- Engagement tracking

### Trends

Identify patterns in your data:
- Growth trajectory
- Seasonal patterns
- Anomaly detection

---

## AR/XR Lab

Immersive 3D visualizations for product validation and investor presentations.

### PMF Presenter (`/dashboard/ar-lab`)

Display your PMF score in stunning 3D:
- Floating score card
- Animated metric orbs
- Interactive orbit controls

**How to use:**
1. Navigate to AR/XR Lab → PMF Presenter
2. Click and drag to rotate the scene
3. Scroll to zoom in/out
4. Use "Share AR Link" for presentations

### Product Preview (`/dashboard/ar-preview`)

Visualize your product mockups on 3D devices:

1. Select device type (phone, tablet, laptop)
2. Click "Upload Screen" to add your mockup
3. View on floating 3D device frames
4. Record demos for investor pitches

### User Journey (`/dashboard/user-journey`)

Map user flows in 3D space:

1. Add steps: Screen, Action, Decision, Start, End
2. Connect steps by selecting and choosing destinations
3. Mark friction levels (low, medium, high)
4. Export journey as JSON

### Landing Tester (`/dashboard/landing-tester`)

Preview landing pages on different devices:

1. Enter your landing page URL
2. Select devices to preview (iPhone, Android, iPad, MacBook, Desktop)
3. View all devices floating in 3D
4. Share preview links with test users

### Focus Group (`/dashboard/focus-group`)

Analyze user feedback in 3D:

1. Add feedback manually or import from surveys
2. View feedback cards clustered by sentiment
3. Toggle views: Scatter, Cluster, Timeline
4. Identify AI-detected themes

### Prototype Validator (`/dashboard/prototype-validator`)

Test prototypes with heatmaps:

1. Add screens (upload images)
2. Define hotspots for interactions
3. Toggle heatmap overlay to see engagement
4. Share test link with users
5. Track clicks and dwell time

---

## Enterprise Features

### Team Management (`/dashboard/team`)

Invite and manage team members:

**Roles:**
- **Owner** — Full access, billing, delete org
- **Admin** — Manage members, edit settings, reports
- **Member** — View dashboard, experiments, export
- **Viewer** — Read-only access

**Inviting Members:**
1. Click "Invite Member"
2. Enter email address
3. Select role
4. Invite is sent (expires in 7 days)

### API Keys (`/dashboard/api-keys`)

Generate API keys for external integrations:

1. Click "Create API Key"
2. Name your key (e.g., "Production Integration")
3. Select scopes (Read, Write)
4. Copy and save your secret (shown only once!)

**Rate Limits:** 1,000 requests/hour per key

### White-Label (`/dashboard/white-label`)

Customize branding for reports:

**Branding Tab:**
- Upload custom logo
- Set primary/secondary colors
- Choose font family
- Remove "Powered by Velodesk"
- Add custom footer text

**Emails Tab:**
- Custom "From" name
- Custom email address (requires verification)

**Domain Tab:**
- Set custom domain for reports (e.g., `pmf.yourcompany.com`)
- CNAME configuration guide provided

---

## Integrations

Connect your tools for automated data sync:

| Category | Tools |
|----------|-------|
| **Analytics** | Google Analytics, Mixpanel, Amplitude |
| **CRM** | HubSpot, Salesforce |
| **Payments** | Stripe, Paystack |
| **Support** | Intercom, Zendesk |
| **Surveys** | Typeform, SurveyMonkey |

**To connect:**
1. Go to Settings → Integrations
2. Click "Connect" on desired tool
3. Authorize access via OAuth
4. Data syncs automatically

---

## API Access

### Authentication

All API requests require a Bearer token:

```bash
curl -X GET https://velodesk.io/api/v1/pmf-score \
  -H "Authorization: Bearer vd_your_api_key"
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/pmf-score` | Get current PMF score |
| POST | `/api/v1/pmf-score` | Calculate new score |
| GET | `/api/v1/metrics` | Get all metrics |

### Example: Get PMF Score

```bash
curl -X GET https://velodesk.io/api/v1/pmf-score \
  -H "Authorization: Bearer vd_abc123..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 78,
    "breakdown": {
      "retention": 82,
      "growth": 75,
      "engagement": 80,
      "revenue": 72,
      "satisfaction": 85
    },
    "calculated_at": "2024-01-20T10:30:00Z"
  }
}
```

### Rate Limiting

- 1,000 requests per hour
- Headers include: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- 429 status returned when exceeded

---

## Support

### Contact

- **Email:** support@velodesk.io
- **Help Center:** https://help.velodesk.io

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `G` then `D` | Go to Dashboard |
| `G` then `A` | Go to Analytics |
| `G` then `R` | Go to Reports |
| `?` | Show shortcuts |

### Troubleshooting

**Score not updating?**
- Ensure integrations are connected
- Check for sync errors in Settings
- Manual refresh available in Analytics

**Invite not received?**
- Check spam folder
- Verify email address
- Resend from Team page

**API returning 401?**
- Verify API key is correct
- Check key hasn't been revoked
- Ensure key has required scopes

---

## Pricing

| Plan | Price | Users | Features |
|------|-------|-------|----------|
| **Free** | $0/mo | 1 | Core PMF, basic integrations |
| **Pro** | $29/mo | 1 | All features, AI insights |
| **Team** | $79/mo | 5 | Team collaboration, reporting |
| **Enterprise** | $199/mo | Unlimited | White-label, API, custom domain |

---

*Thank you for choosing Velodesk. Let's find your product-market fit together!*
