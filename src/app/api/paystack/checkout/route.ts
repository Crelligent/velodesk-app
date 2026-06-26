import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeTransaction, PAYSTACK_PLANS } from '@/lib/paystack'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { planId } = await request.json()

        // Get plan code
        const planCode = PAYSTACK_PLANS[planId as keyof typeof PAYSTACK_PLANS]
        if (!planCode) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        // Initialize transaction
        const response = await initializeTransaction({
            email: user.email!,
            planCode,
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/callback`,
            metadata: {
                user_id: user.id,
                plan_id: planId,
            },
        })

        if (!response.status) {
            return NextResponse.json({ error: response.message }, { status: 400 })
        }

        return NextResponse.json({ url: response.data.authorization_url })
    } catch (error) {
        console.error('Paystack checkout error:', error)
        return NextResponse.json({ error: 'Failed to initialize transaction' }, { status: 500 })
    }
}
