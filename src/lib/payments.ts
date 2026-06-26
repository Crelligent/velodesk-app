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
 * Create a Stripe Checkout session via API route
 */
export async function createStripeCheckout(
    priceId?: string,
    successUrl?: string,
    cancelUrl?: string
): Promise<{ url?: string; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    try {
        const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                priceId: priceId || PRICING_TIERS.pro.stripePriceId,
                successUrl: successUrl || `${window.location.origin}/dashboard?payment=success`,
                cancelUrl: cancelUrl || `${window.location.origin}/pricing?payment=cancelled`,
                customerEmail: user.email,
                userId: user.id,
            }),
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
            body: JSON.stringify({ userId: user.id }),
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

interface PaystackOptions {
    email: string
    amount: number
    planCode?: string
    onSuccess?: (response: { reference: string }) => void
    onCancel?: () => void
}

declare global {
    interface Window {
        PaystackPop?: {
            setup: (config: {
                key: string
                email: string
                amount: number
                plan?: string
                currency: string
                ref: string
                callback: (response: { reference: string }) => void
                onClose: () => void
            }) => { openIframe: () => void }
        }
    }
}

/**
 * Initialize Paystack payment popup
 */
export function initPaystack(options: PaystackOptions): void {
    if (typeof window === 'undefined' || !window.PaystackPop) {
        console.error('Paystack not loaded. Add: <script src="https://js.paystack.co/v1/inline.js"></script>')
        return
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
        console.error('Paystack public key not configured')
        return
    }

    const handler = window.PaystackPop.setup({
        key: publicKey,
        email: options.email,
        amount: options.amount * 100, // Paystack uses kobo
        plan: options.planCode || PRICING_TIERS.pro.paystackPlanCode,
        currency: 'NGN',
        ref: 'VD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        callback: (response) => {
            console.log('Paystack success:', response)
            if (options.onSuccess) options.onSuccess(response)
        },
        onClose: () => {
            console.log('Paystack popup closed')
            if (options.onCancel) options.onCancel()
        }
    })

    handler.openIframe()
}

/**
 * Handle successful Paystack payment
 */
export async function handlePaystackSuccess(
    reference: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // Call API to verify payment and update subscription
    try {
        const response = await fetch('/api/paystack/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference, userId: user.id }),
        })

        const data = await response.json()
        return { success: data.success, error: data.error }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Verification failed' }
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
 * Start Paystack checkout for Pro plan
 */
export async function startPaystackCheckout(): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        window.location.href = '/login'
        return
    }

    initPaystack({
        email: user.email!,
        amount: PRICING_TIERS.pro.priceNGN || 45000,
        onSuccess: async (response) => {
            const { success, error } = await handlePaystackSuccess(response.reference)
            if (success) {
                window.location.href = '/dashboard?payment=success'
            } else {
                console.error('Payment verification failed:', error)
                alert('Payment verification failed. Please contact support.')
            }
        },
        onCancel: () => {
            console.log('Payment cancelled')
        }
    })
}

// =================== FORMATTING ===================

export function formatPrice(tier: PricingTier, isNigeria = false): string {
    if (typeof tier.price === 'string') return tier.price

    if (isNigeria && tier.priceNGN) {
        return `₦${tier.priceNGN.toLocaleString()}/mo`
    }

    return `$${tier.price}/mo`
}
