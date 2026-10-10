import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordPaystackPayment } from '@/lib/paystack-billing'

/**
 * Paystack billing webhook for VELODESK's own subscriptions.
 * Configure in Paystack dashboard -> Settings -> API Keys & Webhooks:
 *   ${NEXT_PUBLIC_APP_URL}/api/paystack/webhook
 * Any database error returns 500 so Paystack retries.
 */
function isValidSignature(body: string, signature: string | null): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret || !signature) return false
    const expected = createHmac('sha512', secret).update(body).digest('hex')
    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    return a.length === b.length && timingSafeEqual(a, b)
}

function metadataUserId(metadata: unknown): string | null {
    let meta = metadata
    if (typeof meta === 'string') {
        try { meta = JSON.parse(meta) } catch { return null }
    }
    const id = (meta as { user_id?: unknown } | null)?.user_id
    return typeof id === 'string' ? id : null
}

export async function POST(request: Request) {
    const body = await request.text()
    if (!isValidSignature(body, request.headers.get('x-paystack-signature'))) {
        return new NextResponse('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body) as { event: string; data: Record<string, any> }
    const data = event.data || {}
    const customerCode: string | undefined = data.customer?.customer_code
    if (!customerCode) return new NextResponse(null, { status: 200 })

    const supabaseAdmin = createAdminClient()
    const updateByCustomer = async (values: Record<string, unknown>) => {
        const { error } = await supabaseAdmin.from('subscriptions')
            .update(values)
            .eq('provider', 'paystack')
            .eq('provider_customer_id', customerCode)
        if (error) throw error
    }

    try {
        switch (event.event) {
            case 'subscription.create':
                await updateByCustomer({
                    provider_subscription_id: data.subscription_code,
                    status: 'active',
                    ...(data.next_payment_date ? { current_period_end: data.next_payment_date } : {}),
                })
                break
            case 'charge.success': {
                // Subscription charges only (first payment or renewal)
                const planCode = typeof data.plan === 'string' ? data.plan : data.plan?.plan_code
                if (!planCode) break
                const result = await recordPaystackPayment(supabaseAdmin, {
                    reference: data.reference,
                    userId: metadataUserId(data.metadata), // first payment; renewals match by customer
                    customerCode,
                    planCode,
                    interval: typeof data.plan === 'object' ? data.plan?.interval ?? null : null,
                    paidAt: data.paid_at ?? data.paidAt ?? null,
                    amount: data.amount,
                    currency: data.currency,
                })
                if (result.status === 'rejected') {
                    console.error(`Paystack webhook: ${result.reason} for ${data.reference}`)
                }
                break
            }
            case 'invoice.payment_failed':
                await updateByCustomer({ status: 'past_due' })
                break
            case 'subscription.not_renew':
                // Access continues until current_period_end, then subscription.disable fires
                await updateByCustomer({ status: 'non_renewing' })
                break
            case 'subscription.disable':
                await updateByCustomer({ status: 'canceled' })
                break
            case 'invoice.update':
                if (data.paid && data.subscription?.next_payment_date) {
                    await updateByCustomer({ status: 'active', current_period_end: data.subscription.next_payment_date })
                }
                break
        }
    } catch (error) {
        console.error('Paystack webhook failed:', error)
        return new NextResponse('Webhook handler failed', { status: 500 })
    }

    return new NextResponse(null, { status: 200 })
}
