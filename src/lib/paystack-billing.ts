/**
 * Records a successful Paystack payment for VELODESK's own billing. Server only.
 * Shared by /api/paystack/callback (browser redirect) and /api/paystack/webhook
 * (charge.success), so a payment is recorded even if the user closes the tab.
 *
 * Every reference is stored in payment_events (unique per provider), so an old
 * successful reference can never be replayed to re-activate a subscription.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { planIdFromPaystackCode } from '@/lib/paystack'
import { planTierFromPlanId } from '@/lib/plans'

// Billing period length per Paystack plan interval (days)
const INTERVAL_DAYS: Record<string, number> = {
    weekly: 7,
    monthly: 30,
    quarterly: 91,
    biannually: 182,
    annually: 365,
}

export interface PaystackPayment {
    reference: string
    userId?: string | null // from metadata set server-side at checkout; absent on renewals
    customerCode: string
    planCode?: string | null
    interval?: string | null
    paidAt?: string | null
    amount: number // kobo
    currency: string
}

export type RecordResult =
    | { status: 'recorded'; userId: string }
    | { status: 'duplicate'; userId: string | null }
    | { status: 'rejected'; reason: 'unknown_plan' | 'unknown_user' }

export async function recordPaystackPayment(
    admin: SupabaseClient,
    payment: PaystackPayment
): Promise<RecordResult> {
    // Plan comes from the verified plan code, never from client-supplied metadata
    const planId = planIdFromPaystackCode(payment.planCode)
    const plan = planTierFromPlanId(planId)
    if (!plan) return { status: 'rejected', reason: 'unknown_plan' }

    let userId = payment.userId || null
    if (!userId) {
        const { data: row, error } = await admin
            .from('subscriptions')
            .select('user_id')
            .eq('provider', 'paystack')
            .eq('provider_customer_id', payment.customerCode)
            .maybeSingle()
        if (error) throw error
        userId = row?.user_id ?? null
    }
    if (!userId) return { status: 'rejected', reason: 'unknown_user' }

    // Claim the reference first: the unique index makes replays (and the
    // callback/webhook race) a no-op.
    const { error: claimError } = await admin.from('payment_events').insert({
        provider: 'paystack',
        reference: payment.reference,
        user_id: userId,
        amount: payment.amount,
        currency: payment.currency,
        paid_at: payment.paidAt ?? new Date().toISOString(),
    })
    if (claimError) {
        if (claimError.code === '23505') {
            const { data: existing } = await admin
                .from('payment_events')
                .select('user_id')
                .eq('provider', 'paystack')
                .eq('reference', payment.reference)
                .maybeSingle()
            return { status: 'duplicate', userId: existing?.user_id ?? null }
        }
        throw claimError
    }

    const interval = payment.interval ?? (planId?.includes('yearly') ? 'annually' : 'monthly')
    const days = INTERVAL_DAYS[interval] ?? 30
    const paidAt = payment.paidAt ? new Date(payment.paidAt) : new Date()

    // One row per user (same model as Stripe)
    const { error } = await admin.from('subscriptions').upsert(
        {
            user_id: userId,
            plan,
            provider: 'paystack',
            provider_customer_id: payment.customerCode,
            price_id: payment.planCode,
            status: 'active',
            current_period_start: paidAt.toISOString(),
            current_period_end: new Date(paidAt.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'user_id' }
    )
    if (error) {
        // Release the claimed reference so Paystack's retry (or the callback) can
        // process this payment again instead of seeing a "duplicate".
        const { error: releaseError } = await admin
            .from('payment_events')
            .delete()
            .eq('provider', 'paystack')
            .eq('reference', payment.reference)
        if (releaseError) {
            console.error(`Paystack: failed to release reference ${payment.reference}:`, releaseError.message)
        }
        throw error
    }
    return { status: 'recorded', userId }
}
