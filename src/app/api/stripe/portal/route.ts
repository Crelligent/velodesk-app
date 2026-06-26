import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        // Get user's Stripe customer ID
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('provider_customer_id')
            .eq('user_id', userId)
            .eq('provider', 'stripe')
            .single()

        if (error || !subscription?.provider_customer_id) {
            return NextResponse.json(
                { error: 'No Stripe subscription found' },
                { status: 404 }
            )
        }

        // Dynamic import Stripe
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.provider_customer_id,
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
