/**
 * Velodesk Payments Module
 * Stripe and Paystack payment integration
 */

import { createClient } from '@/lib/supabase/client'

// =================== TYPES ===================

export interface SubscriptionStatus {
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'free'
    plan: 'free' | 'pro' | 'enterprise'
    validUntil?: string
    provider?: 'stripe' | 'paystack'
}

export interface PricingTier {
    name: string
    price: number | string
    priceNGN?: number
    features: string[]
    stripePriceId?: string
    paystackPlanCode?: string
}

export interface RegionInfo {
    country: string
    currency: string
    isNigeria: boolean
}

// =================== PRICING TIERS ===================

export const PRICING_TIERS: Record<string, PricingTier> = {
    free: {
        name: 'Free',
        price: 0,
        features: [
            'Basic PMF Score',
            '2 integrations',
            'Weekly reports',
            'Community support',
        ],
    },
    pro: {
        name: 'Pro',
        price: 49,
        priceNGN: 45000,
        features: [
            'Full PMF Score with breakdown',
            'Unlimited integrations',
            'Real-time updates',
            'Shareable investor reports',
            'AI insights',
            'Priority support',
        ],
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        paystackPlanCode: process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE,
    },
    enterprise: {
        name: 'Enterprise',
        price: 'Custom',
        features: [
            'Everything in Pro',
            'Custom integrations',
            'White-label reports',
            'Dedicated success manager',
            'SSO / SAML',
            'API access',
        ],
    },
}

// =================== SUBSCRIPTION STATUS ===================

/**
 * Get current user's subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!subscription) {
        return { status: 'free', plan: 'free' }
    }

    return {
        status: subscription.status,
        plan: subscription.plan,
        validUntil: subscription.current_period_end,
        provider: subscription.provider,
    }
}

/**
 * Check if user has active pro subscription
 */
export async function isPro(): Promise<boolean> {
    const sub = await getSubscriptionStatus()
    if (!sub) return false

    if (sub.status === 'active' && sub.plan === 'pro') {
        if (sub.validUntil && new Date(sub.validUntil) > new Date()) {
            return true
        }
    }

    return false
}

// =================== REGION DETECTION ===================

/**
 * Detect user's region for payment provider selection
 */
export async function detectRegion(): Promise<RegionInfo> {
    try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        return {
            country: data.country_code,
            currency: data.currency,
            isNigeria: data.country_code === 'NG',
        }
    } catch (error) {
        console.error('Region detection failed:', error)
        return { country: 'US', currency: 'USD', isNigeria: false }
    }
}

// =================== STRIPE CHECKOUT ===================

/**
 * Create a Stripe Checkout session via API route.
 * planId matches the pricing page (e.g. 'founder_monthly'); Stripe is USD-only.
 */
export async function createStripeCheckout(
    planId: string = 'founder_monthly'
): Promise<{ url?: string; error?: string }> {
    try {
        const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, currency: 'USD' }),
        })

        const data = await response.json()

        if (data.url) {
            return { url: data.url }
        }

        return { error: data.error || 'Failed to create checkout session' }
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Checkout failed' }
    }
}

/**
 * Redirect to Stripe Customer Portal for subscription management
 */
export async function openCustomerPortal(): Promise<{ url?: string; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    try {
        const response = await fetch('/api/stripe/portal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // User is taken from the session server-side
        })

        const data = await response.json()

        if (data.url) {
            return { url: data.url }
        }

        return { error: data.error || 'Failed to create portal session' }
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Portal failed' }
    }
}

// =================== PAYSTACK CHECKOUT ===================

/**
 * Create a Paystack (NGN) checkout via API route. The server verifies the
 * payment in /api/paystack/callback and /api/paystack/webhook.
 */
export async function createPaystackCheckout(
    planId: string = 'founder_monthly'
): Promise<{ url?: string; error?: string }> {
    try {
        const response = await fetch('/api/paystack/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, currency: 'NGN' }),
        })
        const data = await response.json()
        return data.url ? { url: data.url } : { error: data.error || 'Failed to start checkout' }
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Checkout failed' }
    }
}

// =================== QUICK CHECKOUT HELPERS ===================

/**
 * Start checkout for Pro plan (auto-detects region)
 */
export async function startProCheckout(): Promise<void> {
    const region = await detectRegion()

    if (region.isNigeria) {
        await startPaystackCheckout()
    } else {
        await startStripeCheckout()
    }
}

/**
 * Start Stripe checkout for Pro plan
 */
export async function startStripeCheckout(): Promise<void> {
    const { url, error } = await createStripeCheckout()

    if (url) {
        window.location.href = url
    } else {
        console.error('Stripe checkout failed:', error)
        alert('Unable to start checkout. Please try again.')
    }
}

/**
 * Start Paystack checkout (NGN)
 */
export async function startPaystackCheckout(): Promise<void> {
    const { url, error } = await createPaystackCheckout()

    if (url) {
        window.location.href = url
    } else {
        console.error('Paystack checkout failed:', error)
        alert('Unable to start checkout. Please try again.')
    }
}

// =================== FORMATTING ===================

export function formatPrice(tier: PricingTier, isNigeria = false): string {
    if (typeof tier.price === 'string') return tier.price

    if (isNigeria && tier.priceNGN) {
        return `₦${tier.priceNGN.toLocaleString()}/mo`
    }

    return `$${tier.price}/mo`
}
