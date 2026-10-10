/**
 * Checkout entry points shared by POST /api/{stripe,paystack}/checkout and
 * GET /api/billing/start. Server only.
 */
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createCheckoutSession, STRIPE_PRICES } from '@/lib/stripe'
import { initializeTransaction, PAYSTACK_PLANS } from '@/lib/paystack'
import { getEntitlement, TRIAL_DAYS, type SubscriptionRow } from '@/lib/plans'

export type CheckoutResult = { url: string } | { error: string; status: number; code: string }

interface ExistingSub extends SubscriptionRow {
    stripe_customer_id?: string | null
}

async function loadSubscription(supabase: SupabaseClient, userId: string): Promise<ExistingSub | null> {
    const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, provider, trial_ends_at, current_period_end, stripe_customer_id')
        .eq('user_id', userId)
        .maybeSingle()
    return data
}

/** A paid (provider-backed) subscription that is still entitled. Server trials (provider null) don't count. */
function hasPaidSubscription(sub: ExistingSub | null): boolean {
    return !!sub?.provider && getEntitlement(sub).entitled
}

const ALREADY_SUBSCRIBED: CheckoutResult = {
    error: 'You already have an active subscription. Manage it from Settings > Billing.',
    status: 409,
    code: 'already_subscribed',
}

export async function startStripeCheckout(
    supabase: SupabaseClient,
    user: User,
    planId: unknown,
    currency: unknown
): Promise<CheckoutResult> {
    // NGN pricing is only configured on Paystack; Stripe prices are USD.
    if (typeof currency === 'string' && currency.toUpperCase() === 'NGN') {
        return { error: 'NGN payments are processed by Paystack', status: 400, code: 'use_paystack' }
    }
    const priceId = typeof planId === 'string' ? STRIPE_PRICES[planId] : undefined
    if (!priceId) return { error: 'Invalid plan', status: 400, code: 'invalid_plan' }

    const existing = await loadSubscription(supabase, user.id)
    if (hasPaidSubscription(existing)) return ALREADY_SUBSCRIBED

    // Trial: none if the user already had one; carry over the remainder of a
    // server-side trial (Stripe requires trial_end >= 48h ahead).
    let trialDays = existing ? 0 : TRIAL_DAYS
    let trialEnd: number | undefined
    if (existing && !existing.provider && existing.status === 'trialing' && existing.trial_ends_at) {
        const end = Math.floor(new Date(existing.trial_ends_at).getTime() / 1000)
        if (end > Math.floor(Date.now() / 1000) + 48 * 3600) {
            trialEnd = end
            trialDays = 0
        }
    }

    const session = await createCheckoutSession({
        priceId,
        customerId: existing?.stripe_customer_id ?? undefined,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?trial=started`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        clientReferenceId: user.id,
        customerEmail: user.email,
        trialDays,
        trialEnd,
        metadata: { user_id: user.id, plan_id: planId as string },
    })
    if (!session.url) return { error: 'Failed to create checkout session', status: 500, code: 'checkout_failed' }
    return { url: session.url }
}

export async function startPaystackCheckout(
    supabase: SupabaseClient,
    user: User,
    planId: unknown,
    currency: unknown
): Promise<CheckoutResult> {
    // NGN is the primary Paystack currency
    const cur = typeof currency === 'string' && currency ? currency.toLowerCase() : 'ngn'
    const planCode = typeof planId === 'string' ? PAYSTACK_PLANS[`${planId}_${cur}`] : undefined
    if (!planCode) return { error: 'Invalid plan', status: 400, code: 'invalid_plan' }

    const existing = await loadSubscription(supabase, user.id)
    if (hasPaidSubscription(existing)) return ALREADY_SUBSCRIBED

    const response = await initializeTransaction({
        email: user.email!,
        planCode,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/callback`,
        metadata: { user_id: user.id, plan_id: planId as string },
    })
    if (!response.status) return { error: response.message, status: 400, code: 'checkout_failed' }
    return { url: response.data.authorization_url }
}
