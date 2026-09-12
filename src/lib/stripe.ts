import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const STRIPE_PRICES = {
    pro_monthly: 'price_xxx', // Replace with your Stripe price ID
    pro_yearly: 'price_xxx',
    enterprise_monthly: 'price_xxx',
    enterprise_yearly: 'price_xxx',
    founder_monthly: 'price_founder_xxx',
    team_monthly: 'price_team_xxx',
    accelerator_monthly: 'price_accel_xxx'
}

export async function createCheckoutSession({
    priceId,
    customerId,
    successUrl,
    cancelUrl,
    clientReferenceId,
    customerEmail,
}: {
    priceId: string
    customerId?: string
    successUrl: string
    cancelUrl: string
    clientReferenceId?: string
    customerEmail?: string
}) {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer: customerId,
        customer_email: customerId ? undefined : customerEmail,
        client_reference_id: clientReferenceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        subscription_data: {
            trial_period_days: 14,
        },
    })

    return session
}

export async function createCustomerPortalSession({
    customerId,
    returnUrl,
}: {
    customerId: string
    returnUrl: string
}) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    })

    return session
}
