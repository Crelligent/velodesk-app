import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    // Initialize Supabase admin client to bypass RLS in the webhook
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                if (session.mode === 'subscription' && session.client_reference_id) {
                    const subscriptionId = session.subscription as string
                    const customerId = session.customer as string
                    
                    // Upsert basic info, full details come in customer.subscription.created
                    await supabaseAdmin.from('subscriptions').upsert({
                        user_id: session.client_reference_id,
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        status: 'incomplete', // Will be updated by subscription webhook
                    }, { onConflict: 'stripe_subscription_id' })
                }
                break
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                
                await supabaseAdmin.from('subscriptions')
                    .update({
                        status: subscription.status,
                        price_id: subscription.items.data[0].price.id,
                        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                    })
                    .eq('stripe_subscription_id', subscription.id)
                break
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                
                await supabaseAdmin.from('subscriptions')
                    .update({
                        status: 'paused', // Rather than deleted, pause access
                    })
                    .eq('stripe_subscription_id', subscription.id)
                break
            }
            case 'customer.subscription.trial_will_end': {
                const subscription = event.data.object as Stripe.Subscription
                // TODO: Send day-11 "trial ending soon" email via Resend/Hubspot
                console.log(`Sending trial_will_end email for subscription: ${subscription.id}`)
                break
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice
                if ((invoice as any).subscription) {
                    await supabaseAdmin.from('subscriptions')
                        .update({ status: 'active' })
                        .eq('stripe_subscription_id', (invoice as any).subscription)
                }
                // TODO: Send receipt/welcome email
                break
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                if ((invoice as any).subscription) {
                    await supabaseAdmin.from('subscriptions')
                        .update({ status: 'past_due' })
                        .eq('stripe_subscription_id', (invoice as any).subscription)
                    
                    // TODO: Trigger dunning email sequence
                    console.log(`Payment failed, entering dunning for subscription: ${invoice.subscription}`)
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
