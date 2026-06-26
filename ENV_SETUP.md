# Velodesk Environment Setup Guide

## Required Environment Variables

Create a file named `.env.local` in the project root with these variables:

```env
# ===========================================
# SUPABASE
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ===========================================
# AI APIs
# ===========================================
GEMINI_API_KEY=AIzaSyB9QqinWF_dhY5s3Gv1V9nv-mFotudDCPo
OPENAI_API_KEY=sk-xxx-optional

# ===========================================
# STRIPE (Payment Processing)
# ===========================================
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# ===========================================
# PAYSTACK (Alternative Payments - Africa)
# ===========================================
PAYSTACK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx

# ===========================================
# EMAIL (Resend)
# ===========================================
RESEND_API_KEY=re_xxx

# ===========================================
# APP CONFIG
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Supabase
1. Go to https://supabase.com and create a project
2. Copy URL and keys from Settings → API
3. Run `schema.sql` then `enterprise-schema.sql` in SQL Editor

### 2. Stripe
1. Go to https://stripe.com/dashboard
2. Get keys from Developers → API Keys
3. Create webhook endpoint: `https://your-domain/api/stripe/webhook`
4. Create products/prices for Pro ($29), Team ($79), Enterprise ($199)

### 3. Resend (Email)
1. Go to https://resend.com and create account
2. Verify your domain
3. Get API key from dashboard

### 4. Gemini AI
- Your key is already set: `AIzaSyB9QqinWF_dhY5s3Gv1V9nv-mFotudDCPo`

## Vercel Deployment

1. Push to GitHub
2. Import in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

## Security Note

⚠️ Never commit `.env.local` to git - it's already in `.gitignore`
