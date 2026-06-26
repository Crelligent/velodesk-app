import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    // Dynamic import Stripe to avoid version issues
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // Verify webhook signature if secret is configured
    let event
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            )
        } catch (err) {
            console.error('Webhook signature verification failed:', err)
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }
    } else {
        // Dev mode - parse without verification
        event = JSON.parse(body)
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                await handleCheckoutCompleted(session, stripe)
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object
                await handleSubscriptionUpdated(subscription)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                await handleSubscriptionDeleted(subscription)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object
                await handlePaymentFailed(invoice)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}

async function handleCheckoutCompleted(session: any, stripe: any) {
    const userId = session.client_reference_id
    const customerId = session.customer
    const subscriptionId = session.subscription

    if (!userId) {
        console.error('No user ID in checkout session')
        return
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Update or create subscription in database
    const { error } = await supabase.from('subscriptions').upsert(
        {
            user_id: userId,
            plan: 'pro',
            provider: 'stripe',
            provider_customer_id: customerId,
            provider_subscription_id: subscriptionId,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        },
        { onConflict: 'user_id' }
    )

    if (error) {
        console.error('Error updating subscription:', error)
        throw error
    }

    console.log(`Subscription created for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: any) {
    const customerId = subscription.customer

    // Find user by customer ID
    const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('provider_customer_id', customerId)
        .single()

    if (!existingSub) {
        console.error('No subscription found for customer:', customerId)
        return
    }

    // Map Stripe status to our status
    let status = subscription.status
    if (status === 'active') status = 'active'
    else if (status === 'past_due') status = 'past_due'
    else if (status === 'canceled') status = 'canceled'
    else if (status === 'trialing') status = 'trialing'

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('provider_customer_id', customerId)

    if (error) {
        console.error('Error updating subscription:', error)
        throw error
    }

    console.log(`Subscription updated for customer ${customerId}`)
}

async function handleSubscriptionDeleted(subscription: any) {
    const customerId = subscription.customer

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            plan: 'free',
        })
        .eq('provider_customer_id', customerId)

    if (error) {
        console.error('Error canceling subscription:', error)
        throw error
    }

    console.log(`Subscription canceled for customer ${customerId}`)
}

async function handlePaymentFailed(invoice: any) {
    const customerId = invoice.customer

    const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('provider_customer_id', customerId)

    if (error) {
        console.error('Error updating subscription status:', error)
    }

    console.log(`Payment failed for customer ${customerId}`)
}
