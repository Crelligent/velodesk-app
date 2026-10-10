import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { planIdFromStripePrice, stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { planTierFromPlanId } from '@/lib/plans'

const toIso = (unix: number | null | undefined) =>
    unix ? new Date(unix * 1000).toISOString() : null

/**
 * Writes the subscription's current state to `subscriptions` (one row per user).
 * Idempotent and independent of event order: checkout.session.completed and
 * customer.subscription.* can arrive in any order.
 */
async function syncSubscription(
    supabaseAdmin: SupabaseClient,
    subscription: Stripe.Subscription,
    fallbackUserId?: string | null
) {
    let userId = subscription.metadata?.user_id || fallbackUserId || null
    const { data: existingBySub, error: lookupError } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .maybeSingle()
    if (lookupError) throw lookupError
    userId = userId || existingBySub?.user_id || null
    if (!userId) {
        console.error(`Stripe webhook: no user for subscription ${subscription.id}`)
        return
    }

    // Don't let a stale/ended subscription overwrite a newer one for the same user
    const { data: current, error: currentError } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_subscription_id, status')
        .eq('user_id', userId)
        .maybeSingle()
    if (currentError) throw currentError
    const ended = ['canceled', 'incomplete_expired'].includes(subscription.status)
    if (
        current?.stripe_subscription_id &&
        current.stripe_subscription_id !== subscription.id &&
        ended
    ) {
        return
    }

    const item = subscription.items.data[0]
    // API 2025-03+ moved current_period_end onto subscription items
    const periodEnd =
        (item as unknown as { current_period_end?: number })?.current_period_end ??
        (subscription as unknown as { current_period_end?: number }).current_period_end
    const customerId =
        typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
    // Plan is derived from the PRICE, validated against our STRIPE_PRICES map.
    // metadata.plan_id is never trusted on its own.
    const plan = planTierFromPlanId(planIdFromStripePrice(item?.price.id))
    if (!plan) {
        console.error(`Stripe webhook: unknown price ${item?.price.id} on ${subscription.id}; plan not granted`)
    }

    const { error } = await supabaseAdmin.from('subscriptions').upsert(
        {
            user_id: userId,
            provider: 'stripe',
            plan: plan ?? 'free', // unknown price never inherits a previous (e.g. trial) plan
            status: subscription.status,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            provider_customer_id: customerId,
            provider_subscription_id: subscription.id,
            price_id: item?.price.id ?? null,
            current_period_end: toIso(periodEnd),
            trial_ends_at: toIso(subscription.trial_end),
        },
        { onConflict: 'user_id' }
    )
    if (error) throw error
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
    const legacy = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription
    const parent = (invoice as unknown as {
        parent?: { subscription_details?: { subscription?: string | { id: string } } }
    }).parent?.subscription_details?.subscription
    const sub = legacy ?? parent
    if (!sub) return null
    return typeof sub === 'string' ? sub : sub.id
}

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid signature'
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
    }

    // Events from customers' CONNECTED accounts (Stripe Connect, used to read their
    // revenue) must never touch Velodesk billing.
    if (event.account) {
        return new NextResponse(null, { status: 200 })
    }

    // Initialize Supabase admin client to bypass RLS in the webhook
    const supabaseAdmin = createAdminClient()

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                if (session.mode === 'subscription' && session.client_reference_id && session.subscription) {
                    const subscriptionId =
                        typeof session.subscription === 'string' ? session.subscription : session.subscription.id
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
                    await syncSubscription(supabaseAdmin, subscription, session.client_reference_id)
                }
                break
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                await syncSubscription(supabaseAdmin, event.data.object as Stripe.Subscription)
                break
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription

                const { error } = await supabaseAdmin.from('subscriptions')
                    .update({
                        status: 'paused', // Rather than deleted, pause access
                    })
                    .eq('stripe_subscription_id', subscription.id)
                if (error) throw error
                break
            }
            case 'customer.subscription.trial_will_end': {
                const subscription = event.data.object as Stripe.Subscription
                // TODO: Send day-11 "trial ending soon" email via Resend/Hubspot
                console.log(`Sending trial_will_end email for subscription: ${subscription.id}`)
                break
            }
            case 'invoice.payment_succeeded': {
                // Re-read the subscription instead of forcing 'active': the $0 trial
                // invoice also fires this event and the user must stay 'trialing'.
                const subscriptionId = invoiceSubscriptionId(event.data.object as Stripe.Invoice)
                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
                    await syncSubscription(supabaseAdmin, subscription)
                }
                // TODO: Send receipt/welcome email
                break
            }
            case 'invoice.payment_failed': {
                const subscriptionId = invoiceSubscriptionId(event.data.object as Stripe.Invoice)
                if (subscriptionId) {
                    const { error } = await supabaseAdmin.from('subscriptions')
                        .update({ status: 'past_due' })
                        .eq('stripe_subscription_id', subscriptionId)
                    if (error) throw error

                    // TODO: Trigger dunning email sequence
                    console.log(`Payment failed, entering dunning for subscription: ${subscriptionId}`)
                }
                break
            }
        }
    } catch (error) {
        console.error('Webhook handler failed:', error)
        return new NextResponse('Webhook handler failed', { status: 500 })
    }

    return new NextResponse(null, { status: 200 })
}
