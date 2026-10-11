import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
    try {
        // User comes from the session, never from the request body: a body userId
        // let anyone open (and cancel) another customer's billing portal.
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's Stripe customer ID (RLS: users can read their own row)
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('provider_customer_id, stripe_customer_id')
            .eq('user_id', user.id)
            .eq('provider', 'stripe')
            .maybeSingle()

        const customerId = subscription?.stripe_customer_id || subscription?.provider_customer_id
        if (error || !customerId) {
            return NextResponse.json(
                { error: 'No Stripe subscription found' },
                { status: 404 }
            )
        }

        // Dynamic import Stripe
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_not_configured')

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Portal session error:', error)
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        )
    }
}
