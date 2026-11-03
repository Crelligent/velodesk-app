import { NextResponse } from 'next/server'

/**
 * Stripe (USD) checkout is switched off: Velodesk bills Nigerian customers in Naira
 * through Paystack only. Use GET /api/billing/start, which always uses Paystack.
 * (Stripe stays available as a data integration founders can connect.)
 */
export async function POST() {
    return NextResponse.json(
        { error: 'Velodesk bills in Naira through Paystack only.', code: 'use_paystack', gateway: 'paystack' },
        { status: 410 }
    )
}
