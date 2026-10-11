import Stripe from 'stripe'
import { TRIAL_DAYS } from '@/lib/plans'

// Stripe is optional (no account yet). Never throw at import time: a missing key used to
// crash the whole Vercel build ("Neither apiKey nor config.authenticator provided").
// Calls made without a real key fail at request time instead, inside each route's try/catch.
export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_not_configured')

// Price ids come from env so placeholder ids never reach Stripe. Unset = plan unavailable.
export const STRIPE_PRICES: Record<string, string | undefined> = {
    founder_monthly: process.env.STRIPE_PRICE_FOUNDER_MONTHLY,
    founder_yearly: process.env.STRIPE_PRICE_FOUNDER_YEARLY,
    startup_monthly: process.env.STRIPE_PRICE_STARTUP_MONTHLY,
    startup_yearly: process.env.STRIPE_PRICE_STARTUP_YEARLY,
    accelerator_monthly: process.env.STRIPE_PRICE_ACCELERATOR_MONTHLY,
}

/** Reverse lookup: Stripe price id -> plan id (e.g. 'founder_monthly'). Unknown price -> null. */
export function planIdFromStripePrice(priceId: string | null | undefined): string | null {
    if (!priceId) return null
    const match = Object.entries(STRIPE_PRICES).find(([, id]) => id && id === priceId)
    return match ? match[0] : null
}

export async function createCheckoutSession({
    priceId,
    customerId,
    successUrl,
    cancelUrl,
    clientReferenceId,
    customerEmail,
    trialDays = TRIAL_DAYS,
    trialEnd,
    metadata,
}: {
    priceId: string
    customerId?: string
    successUrl: string
    cancelUrl: string
    clientReferenceId?: string
    customerEmail?: string
    trialDays?: number
    trialEnd?: number // unix seconds; takes precedence over trialDays
    metadata?: Record<string, string>
}) {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_collection: 'if_required',
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer: customerId,
        customer_email: customerId ? undefined : customerEmail,
        client_reference_id: clientReferenceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        subscription_data: {
            ...(trialEnd
                ? { trial_end: trialEnd }
                : trialDays > 0 ? { trial_period_days: trialDays } : {}),
            // Lets the webhook map the subscription to the user/plan regardless of event order
            metadata,
        },
    })

    return session
}

export async function createCustomerPortalSession({
    customerId,
    returnUrl,
}: {
    customerId: string
    returnUrl: string
}) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    })

    return session
}
