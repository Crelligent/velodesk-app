import { NextResponse } from 'next/server'
import { verifyTransaction } from '@/lib/paystack'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordPaystackPayment } from '@/lib/paystack-billing'

export async function GET(request: Request) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
        return NextResponse.redirect(`${appUrl}/pricing?error=missing_reference`)
    }

    // The paying user must be the signed-in user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.redirect(`${appUrl}/login`)
    }

    try {
        // Verify transaction with Velodesk's own Paystack key (this is our billing, not customer data)
        const verification = await verifyTransaction(reference)

        if (!verification.status || verification.data.status !== 'success') {
            return NextResponse.redirect(`${appUrl}/pricing?error=payment_failed`)
        }

        // user_id was set server-side in checkout; it must match the session
        const metadataUserId = verification.data.metadata?.user_id
        if (metadataUserId !== user.id) {
            console.error(`Paystack callback: reference ${reference} does not belong to the session user`)
            return NextResponse.redirect(`${appUrl}/pricing?error=verification_failed`)
        }

        const result = await recordPaystackPayment(createAdminClient(), {
            reference,
            userId: user.id,
            customerCode: verification.data.customer.customer_code,
            planCode: verification.data.plan_object?.plan_code ?? verification.data.plan ?? null,
            interval: verification.data.plan_object?.interval ?? null,
            paidAt: verification.data.paid_at ?? null,
            amount: verification.data.amount,
            currency: verification.data.currency,
        })

        if (result.status === 'rejected') {
            console.error(`Paystack callback: ${result.reason} for ${reference}`)
            return NextResponse.redirect(`${appUrl}/pricing?error=verification_failed`)
        }
        if (result.status === 'duplicate') {
            // Already processed (e.g. by the webhook, or a page refresh): never re-grant
            return result.userId === user.id
                ? NextResponse.redirect(`${appUrl}/dashboard/settings?payment=already_processed`)
                : NextResponse.redirect(`${appUrl}/pricing?error=verification_failed`)
        }

        return NextResponse.redirect(`${appUrl}/dashboard/settings?success=true`)
    } catch (error) {
        console.error('Paystack callback error:', error)
        return NextResponse.redirect(`${appUrl}/pricing?error=verification_failed`)
    }
}
