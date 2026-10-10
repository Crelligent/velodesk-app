import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startPaystackCheckout, startStripeCheckout } from '@/lib/billing'

/**
 * GET /api/billing/start?plan=founder_monthly&gateway=stripe|paystack&currency=USD|NGN
 * Checkout for an ALREADY signed-in user (e.g. trial ended -> pricing -> pick plan).
 * The middleware sends signed-in visitors of /signup?plan=... here instead of
 * bouncing them to /dashboard (which caused a pricing<->dashboard loop).
 */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        const login = new URL('/login', request.url)
        return NextResponse.redirect(login)
    }

    const planId = params.get('plan')
    const currency = (params.get('currency') || 'USD').toUpperCase()
    // NGN always goes through Paystack
    const gateway = currency === 'NGN' ? 'paystack' : params.get('gateway') || 'stripe'

    try {
        const result = gateway === 'paystack'
            ? await startPaystackCheckout(supabase, user, planId, currency)
            : await startStripeCheckout(supabase, user, planId, currency)

        if ('error' in result) {
            const target = result.code === 'already_subscribed' ? '/dashboard/settings' : '/pricing'
            return NextResponse.redirect(new URL(`${target}?error=${result.code}`, request.url))
        }
        return NextResponse.redirect(result.url)
    } catch (error) {
        console.error('Billing start error:', error)
        return NextResponse.redirect(new URL('/pricing?error=checkout_failed', request.url))
    }
}
