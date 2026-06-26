import { NextResponse } from 'next/server'
import { verifyTransaction } from '@/lib/paystack'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=missing_reference`
        )
    }

    try {
        // Verify transaction
        const verification = await verifyTransaction(reference)

        if (!verification.status || verification.data.status !== 'success') {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=payment_failed`
            )
        }

        // Get user and plan from metadata
        const userId = verification.data.metadata?.user_id as string
        const planId = verification.data.metadata?.plan_id as string

        if (userId && planId) {
            // Get user's organization
            const { data: org } = await supabaseAdmin
                .from('organizations')
                .select('id')
                .eq('owner_id', userId)
                .single()

            if (org) {
                // Update or create subscription
                await supabaseAdmin
                    .from('subscriptions')
                    .upsert({
                        org_id: org.id,
                        plan: planId.includes('pro') ? 'pro' : 'enterprise',
                        provider: 'paystack',
                        provider_subscription_id: reference,
                        status: 'active',
                        current_period_start: new Date().toISOString(),
                        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    })
            }
        }

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`
        )
    } catch (error) {
        console.error('Paystack callback error:', error)
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=verification_failed`
        )
    }
}
