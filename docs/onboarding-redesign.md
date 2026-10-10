# Velodesk onboarding redesign: signup to first real PMF Score

Goal: a Nigerian founder reaches a PMF Score built from their own Paystack or Stripe data in under 10 minutes. Velodesk tokens only; green is the only accent; no gradients or glow blobs.

## Where users drop off today

1. **Pricing → signup** sends people to checkout right after signup, while the card promises "No credit card required". Defaults are USD and Stripe.
2. **Email confirmation** is a dead end that loses the session.
3. **Onboarding asks for profile data first** (including a logo), then shows a made-up "/35" score with hard-coded focus areas.
4. **Integrations**: 23 tiles in a `grid-cols-4` that breaks at 375px; Stripe is "Recommended", Paystack is not; 0.55rem buttons; raw error strings.
5. **Nothing calculates a score.** The dashboard then shows a mock 84 and ₦142.5M MRR to every user.

## Activation metric

**Primary:** % of signups who see a data-backed PMF Score within 24 hours. Target: 40% at launch.
**Supporting:** % of signups who connect a source within 24h, median time from signup to first score (target under 10 min), and sync failure rate by provider.
**Events** (send to a real analytics tool; today they only go to `console.log`): `signup_completed`, `profile_completed`, `source_selected{provider}`, `source_connected{provider}`, `sync_failed{provider,reason}`, `first_score_viewed{signals_measured}`.

## Screen by screen

Every screen: one primary button (`bg-accent text-on-accent`); "Step 2 of 3" as text; 48px inputs with 16px text (no iOS zoom). At 375px: 16px gutters, single column, primary button sticky at the bottom.

### 0. Landing hero
- H1: **"Show investors your product-market fit, from your real revenue."**
- Sub: "Connect Paystack or Stripe. Get your PMF Score in about 10 minutes."
- Primary: **Get my PMF Score**. Secondary (ghost): *See a sample report*.
- Under the button: "14-day free trial. No card needed."

### 1. Create account (`/signup`)
- H1: **"Create your Velodesk account"**. Helper: "Takes about 8 minutes to your first score."
- **Continue with Google** (outlined) above the fields: full name, email, password (with show/hide toggle). Company name moves to step 2. Drop the "Work Email" label: many founders use Gmail.
- Terms are a line of text under the button, not a checkbox.
- Primary: **Create account**. Busy state: "Creating account…", disabled.
- Errors appear inline under the field with an icon. For example: "An account with this email already exists. Sign in instead?"
- If there is a `?plan=` parameter, save it as the trial plan. **Do not redirect to checkout.** Ask for a card at the end of the trial.
- Email verification must not block progress: show a "Verify your email" banner later, or use a 6-digit code on the same screen, not a link.

### 2. Your company (`/onboarding`, step 1 of 3)
- H1: **"Tell us about your company"**
- Fields: company name, country (defaults to Nigeria, which sets ₦ and Paystack-first), stage (four chips: Pre-revenue · Early revenue · Growing · Scaling).
- Primary: **Continue**. No skip. Remove the logo upload and the value-proposition field. Ask for those later, in report settings.

### 3. Connect revenue (step 2 of 3), the core screen
- H1: **"Connect where you get paid"**
- Sub: "Your score starts with real transactions. We only read data; we can never move money."
- Two large option cards, ordered by country: **Paystack** and **Stripe**. Below them: "Use something else? *Upload a CSV of transactions*" (needs backend support) and "*I'll do this later*" (ghost, goes to the dashboard empty state).
- **Paystack** (API key):
  - Three numbered instructions: Paystack Dashboard → Settings → API Keys & Webhooks → copy **Secret Key**.
  - Label "Paystack secret key". Helper: "Starts with sk_live_. Stored encrypted."
  - Primary: **Connect Paystack**. Busy state: "Checking key…"
  - Errors: "That key didn't work. Check you copied the Secret Key, not the Public Key." A key starting with `sk_test_` gets a warning: "This is a test key. Your score will use test data."
- **Stripe** (OAuth): Primary: **Continue to Stripe**. If the founder returns with an error: "Stripe didn't finish connecting. Try again." plus a Retry button.
- Data policy: one sentence plus a disclosure, linking Velodesk (not Crelligent) terms.

### 4. Building your score (step 3 of 3)
- H1: **"Building your PMF Score"**
- A checklist that updates live:
  - Connected Paystack ✓
  - Importing transactions (e.g. "8,214 of ~12,000")
  - Calculating retention and revenue growth
- A skeleton in the shape of the score card. Copy: "Usually under 2 minutes. You can leave; we'll email you when it's ready."
- Error: "Paystack stopped responding partway through. Nothing was lost." Primary: **Try again**. Secondary: *Contact support*.
- Not enough data (fewer than 30 days of transactions or under 10 customers): "We need at least 30 days of payments to score retention. Here's what we can measure now." Show the measured parts and grey out the rest.

### 5. Your first PMF Score
- The score is the largest element on the screen (`.pmf-score`, tabular numbers), with its label (for example "Emerging fit") and the date.
- **Coverage line:** "Based on Paystack revenue data · 3 of 7 signals measured."
- Component list: measured components show a value and a bar. Unmeasured ones are greyed with the reason, e.g. "Engagement: connect Mixpanel or Amplitude to measure". **Never fill a missing signal with a default.** (`/api/pmf/calculate` currently uses 50 for every missing metric. The backend must return `null` plus a coverage count.)
- Primary: **Add product usage data** (raises accuracy). Secondary: *Download PDF*, *Share investor link*.

**Dashboard empty state:** "Your PMF Score will appear here once you connect Paystack or Stripe." Primary: **Connect revenue data**. No mock numbers.

## Pricing page: visual fixes

1. **Default to ₦ and Paystack** for Nigerian visitors (by geo or locale). Show ₦30,000 / ₦50,000 with thousands separators in tabular numbers. Replace the `dangerouslySetInnerHTML` "US $" symbol with plain text. Make USD a secondary toggle.
2. **Recolour to the Velodesk palette.** Remove the purple/sky top border, the `#7B61FF` button and the `#38BDF8` plan name. Mark Startup with `border-accent` and a "Most popular" text badge. Its button is `bg-accent text-on-accent`; Founder's button is ghost. Both buttons are full width (not `w-48`).
3. **Fix the trial promise.** Put one line above the cards: "14-day free trial on both plans. No card needed." Remove the repeated check item, and make signup stop redirecting to checkout so the promise is true.
4. **Remove the dead Yearly toggle**, or wire it to real annual prices (e.g. "2 months free").
5. **Headline:** use `font-display` at 36px on mobile and 56px on desktop, not `text-7xl font-bold` Inter. Replace "Pricing that scales with you / Surprisingly simple, exceptionally powerful" with "Know your PMF Score before investors ask."
6. **Merge the two "suite" panels into one comparison table** with a sticky header and in-card horizontal scroll at 375px. List Paystack where only Stripe is named.
7. **Accessibility:**
   - The currency switch needs `role="switch"`, `aria-checked`, a label and a visible focus ring. `focus:outline-none` currently removes it.
   - `text-gray-500` on #0A0A0A is about 4:1 and fails; use `text-text-muted`.
8. **Brand separation and price parity:**
   - Remove "By Crelligent" from the nav, and replace the unloaded `font-orbitron` wordmark with the logo or `font-display`.
   - Check the price parity: ₦30,000 ≈ $15 but ₦50,000 ≈ $49.
