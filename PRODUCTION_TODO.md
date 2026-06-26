# Velodesk Production Readiness Checklist

> Last updated: December 28, 2024

---

## 🔴 Phase 1: Configuration (30 mins)

### Database Setup
- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Verify all tables created: `profiles`, `organizations`, `integration_tokens`, `experiments`, `pmf_scores`, `subscriptions`
- [ ] Test RLS policies are working

### Environment Variables
- [ ] Create `.env.local` with production Supabase credentials
- [ ] Add Stripe keys:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
- [ ] Add Paystack keys (for Nigeria):
  - [ ] `PAYSTACK_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
  - [ ] `NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE`
- [ ] Add HubSpot API key:
  - [ ] `HUBSPOT_ACCESS_TOKEN`

---

## 🟡 Phase 2: Backend APIs (6-8 hours)

### Payment Webhooks
- [ ] Create `/api/stripe/webhook/route.ts` - Handle Stripe webhook events
  - [ ] Handle `checkout.session.completed`
  - [ ] Handle `customer.subscription.updated`
  - [ ] Handle `customer.subscription.deleted`
  - [ ] Update `subscriptions` table in Supabase
- [ ] Create `/api/stripe/portal/route.ts` - Customer portal session
- [ ] Test Stripe webhook with Stripe CLI

### Paystack Integration
- [ ] Verify `/api/paystack/callback/route.ts` handles payment verification
- [ ] Test Paystack popup checkout flow

### Integration OAuth Callbacks
- [ ] Create `/api/integrations/callback/route.ts`
  - [ ] Handle HubSpot OAuth callback
  - [ ] Handle Stripe Connect callback
  - [ ] Handle Google Analytics callback
  - [ ] Store tokens in `integration_tokens` table
- [ ] Test OAuth flow for each provider

### Data Sync API
- [ ] Create `/api/integrations/sync/route.ts`
  - [ ] Sync HubSpot contacts
  - [ ] Sync Stripe revenue data
  - [ ] Sync analytics data
  - [ ] Store synced data for PMF calculation

### Badge Generator
- [ ] Create `/api/badge/[token]/route.ts` - Dynamic SVG badge
- [ ] Support styles: `minimal`, `default`, `detailed`
- [ ] Support themes: `dark`, `light`

### PMF Score Calculator
- [ ] Create `/api/pmf/calculate/route.ts`
  - [ ] Aggregate data from connected integrations
  - [ ] Calculate weighted score using `src/lib/ml.ts`
  - [ ] Store in `pmf_scores` table

---

## 🟢 Phase 3: Testing (2-3 hours)

### Authentication
- [ ] Test email/password signup
- [ ] Test email/password login
- [ ] Test Google OAuth signup/login
- [ ] Test logout
- [ ] Test onboarding flow for new users

### Payments
- [ ] Test Stripe Checkout with test card
- [ ] Test Stripe Customer Portal
- [ ] Test Paystack popup (Nigeria VPN)
- [ ] Verify subscription status updates

### Integrations
- [ ] Test HubSpot OAuth connection
- [ ] Test API key connection (Mixpanel, etc.)
- [ ] Test disconnect integration
- [ ] Test data sync

### Core Features
- [ ] Test PMF Report generation
- [ ] Test public report sharing
- [ ] Test badge embed code
- [ ] Test lead scoring display

### Mobile & Accessibility
- [ ] Test responsive layout on mobile
- [ ] Test keyboard navigation
- [ ] Check color contrast

---

## 🚀 Phase 4: Deployment (1 hour)

### Vercel Setup
- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy to preview

### Domain & DNS
- [ ] Purchase/configure domain (e.g., velodesk.app)
- [ ] Add domain to Vercel
- [ ] Configure DNS records
- [ ] Verify SSL certificate

### Supabase Production
- [ ] Create Supabase production project
- [ ] Run schema on production database
- [ ] Update environment variables with production URLs
- [ ] Configure OAuth redirect URLs for production domain

### Final Checks
- [ ] Test production deployment end-to-end
- [ ] Verify all API routes working
- [ ] Check all integrations with production keys
- [ ] Monitor for errors

---

## 📦 Phase 5: Optional Enhancements

### Monitoring & Analytics
- [ ] Add Sentry for error tracking
- [ ] Add PostHog/Mixpanel for user analytics
- [ ] Set up Stripe revenue dashboard

### AI Features
- [ ] Integrate OpenAI/Gemini for AI insights
- [ ] Add AI-powered PMF analysis
- [ ] Add AI copilot suggestions

### Advanced Features
- [ ] Email notifications (Resend/SendGrid)
- [ ] Team/multi-user support
- [ ] White-label reports for enterprise
- [ ] API access for enterprise tier

---

## 📁 Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Database Schema | `supabase/schema.sql` |
| ML Functions | `src/lib/ml.ts` |
| Integrations | `src/lib/integrations.ts` |
| Reports | `src/lib/reports.ts` |
| Payments | `src/lib/payments.ts` |
| Badge | `src/lib/badge.ts` |
| Env Example | `env.example` |

---

## 📊 Progress Tracker

| Phase | Items | Completed | Progress |
|-------|-------|-----------|----------|
| Configuration | 12 | 0 | 0% |
| Backend APIs | 15 | 0 | 0% |
| Testing | 16 | 0 | 0% |
| Deployment | 10 | 0 | 0% |
| **Total** | **53** | **0** | **0%** |

---

*Check off items as you complete them. Good luck! 🚀*
