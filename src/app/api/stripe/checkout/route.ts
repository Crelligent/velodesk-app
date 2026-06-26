import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, STRIPE_PRICES } from '@/lib/stripe'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { planId } = await request.json()

        // Get price ID from plan
        const priceId = STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES]
        if (!priceId) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        // Create checkout session
        const session = await createCheckoutSession({
            priceId,
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
}
