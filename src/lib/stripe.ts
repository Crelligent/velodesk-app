import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const STRIPE_PRICES = {
    pro_monthly: 'price_xxx', // Replace with your Stripe price ID
    pro_yearly: 'price_xxx',
    enterprise_monthly: 'price_xxx',
    enterprise_yearly: 'price_xxx',
}

export async function createCheckoutSession({
    priceId,
    customerId,
    successUrl,
    cancelUrl,
}: {
    priceId: string
    customerId?: string
    successUrl: string
    cancelUrl: string
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
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
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
