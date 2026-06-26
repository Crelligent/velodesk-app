# Velodesk Product Roadmap

## Current Status: MVP Complete ✅

**All UI is complete!** The only remaining work is connecting to real data sources and AI APIs when you have the budget/need for it.

Core features implemented and functional.

---

## Phase 2: Post-Launch Enhancements

### Priority: High

- [ ] **Stripe Integration** - Subscription billing, usage metering
- [ ] **Resend Email Integration** - Transactional emails, weekly digests
- [ ] **Custom SMTP** - Branded email sender (noreply@velodesk.crelligent.com)
- [ ] **Database-backed Features** - Persist AR/XR data, simulations, experiments
- [ ] **Benchmark Comparisons Page** - Compare PMF metrics against industry averages

### Priority: Medium

- [ ] **Real AI Integration** - Replace mock sentiment analysis with actual Gemini API calls
- [ ] **WebXR Support** - True AR/VR experiences on compatible devices
- [ ] **Notification System** - In-app alerts, email notifications for score changes

---

## Phase 3: Advanced Features

### Figma Integration 🎨

**Status:** Planned for v2

**Use Cases:**
- Import Figma prototypes directly into Prototype Validator
- Preview landing page designs in Landing Tester
- Show Figma frames in Focus Group Room
- AR preview of product mockups from Figma

**Requirements:**
- Figma OAuth integration
- Frame selection UI
- Figma API token storage in integration_tokens table
- Live sync when designs change

**Endpoints Needed:**
- `GET /v1/files/:file_key` - Fetch file metadata
- `GET /v1/images/:file_key` - Export frames as images
- OAuth flow for user authentication

---

## Phase 4: Enterprise Features

- [ ] **Multi-tenant Organizations** - Teams with role-based access
- [ ] **Audit Logs** - Track all user actions
- [ ] **SSO/SAML** - Enterprise single sign-on
- [ ] **Custom Domains** - White-label custom domains
- [ ] **API Rate Limiting** - Usage quotas per plan
- [ ] **SLA Dashboard** - Uptime monitoring for enterprise clients

---

## Core AI/ML Features (The Brain of Velodesk) 🧠

**These ARE Velodesk's core technology - implemented with mock data, needs real ML integration:**

| Feature | Current Status | Next Step |
|---------|----------------|-----------|
| **PMF Scoring Algorithm** | ✅ Implemented (weighted formula) | Train ML model on real data |
| **AI Co-pilot** | ✅ UI built | Connect to Gemini/OpenAI API |
| **Churn Prediction** | ✅ Trends page built | Add predictive ML model |
| **Retention Analysis** | ✅ Cohort UI built | Connect to real data sources |
| **Lead Scoring** | ✅ Leads page built | Add ML-based scoring |
| **GTM Strategy Generator** | ✅ UI built | Connect to AI for generation |
| **Sentiment Analysis** | ✅ Focus Group built | Add real NLP analysis |
| **Benchmark Comparisons** | ✅ Built | Industry comparison page complete |

**Priority:** These need real API integration in Phase 2, not pushed to Phase 5.

---

## Technical Debt

- [ ] Move CSS inline styles to external files (lint cleanup)
- [ ] Add form labels for accessibility
- [ ] Implement proper error boundaries
- [ ] Add loading states to all data fetches
- [ ] Write unit tests for core components

---

## Completed ✅

- [x] Landing page with premium design
- [x] Authentication (Email + Google OAuth)
- [x] Onboarding flow with logo upload
- [x] Dashboard with sidebar navigation
- [x] Premium Lucide icons throughout
- [x] PMF Score display
- [x] AR/XR Lab pages (PMF Presenter, Product Preview, etc.)
- [x] Prototyping canvas
- [x] Simulations page
- [x] User dropdown in header
- [x] Conditional sidebar (hidden on integrations page)

---

*Last updated: December 29, 2024*

