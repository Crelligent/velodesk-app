import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { subscriptionManageLink } from '@/lib/paystack'
import { createCustomerPortalSession } from '@/lib/stripe'

/**
 * GET /api/billing/card (session user only)
 * Sends the customer to their gateway's hosted "update card" page:
 * Paystack's subscription management link, or the Stripe customer portal.
 */
export async function GET() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${appUrl}/login`)

    const { data: sub, error } = await createAdminClient()
        .from('subscriptions')
        .select('provider, provider_subscription_id, stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle()
    if (error || !sub?.provider) return NextResponse.redirect(`${appUrl}/billing?error=no_subscription`)

    try {
        if (sub.provider === 'paystack' && sub.provider_subscription_id) {
            const res = await subscriptionManageLink(sub.provider_subscription_id)
            if (res.status && res.data?.link) return NextResponse.redirect(res.data.link)
            console.error('Paystack manage link failed:', res.message)
        } else if (sub.provider === 'stripe' && sub.stripe_customer_id) {
            const session = await createCustomerPortalSession({
                customerId: sub.stripe_customer_id,
                returnUrl: `${appUrl}/billing`,
            })
            return NextResponse.redirect(session.url)
        }
    } catch (e) {
        console.error('Update card link failed:', e instanceof Error ? e.name : 'unknown')
    }
    return NextResponse.redirect(`${appUrl}/billing?error=card_link_failed`)
}
