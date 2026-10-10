import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startStripeCheckout } from '@/lib/billing'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { planId, currency } = await request.json()
        
        // Reuses the existing Stripe customer, refuses if already subscribed,
        // carries over any remaining server-side trial
        const result = await startStripeCheckout(supabase, user, planId, currency)
        if ('error' in result) {
            return NextResponse.json(
                { error: result.error, code: result.code, ...(result.code === 'use_paystack' ? { gateway: 'paystack' } : {}) },
                { status: result.status }
            )
        }
        return NextResponse.json({ url: result.url })
    } catch (error) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
}
