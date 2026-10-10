import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startPaystackCheckout } from '@/lib/billing'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { planId, currency } = await request.json()

        const result = await startPaystackCheckout(supabase, user, planId, currency)
        if ('error' in result) {
            return NextResponse.json({ error: result.error, code: result.code }, { status: result.status })
        }
        return NextResponse.json({ url: result.url })
    } catch (error) {
        console.error('Paystack checkout error:', error)
        return NextResponse.json({ error: 'Failed to initialize transaction' }, { status: 500 })
    }
}
