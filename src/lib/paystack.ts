const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

// Plan codes come from env so placeholder codes never reach Paystack. Unset = plan unavailable.
export const PAYSTACK_PLANS: Record<string, string | undefined> = {
    founder_monthly_ngn: process.env.PAYSTACK_PLAN_FOUNDER_MONTHLY_NGN,
    founder_yearly_ngn: process.env.PAYSTACK_PLAN_FOUNDER_YEARLY_NGN,
    startup_monthly_ngn: process.env.PAYSTACK_PLAN_STARTUP_MONTHLY_NGN,
    startup_yearly_ngn: process.env.PAYSTACK_PLAN_STARTUP_YEARLY_NGN,

    founder_monthly_usd: process.env.PAYSTACK_PLAN_FOUNDER_MONTHLY_USD,
    founder_yearly_usd: process.env.PAYSTACK_PLAN_FOUNDER_YEARLY_USD,
    startup_monthly_usd: process.env.PAYSTACK_PLAN_STARTUP_MONTHLY_USD,
    startup_yearly_usd: process.env.PAYSTACK_PLAN_STARTUP_YEARLY_USD,
}

/** Reverse lookup: Paystack plan code -> plan id (e.g. 'founder_monthly'). Unknown code -> null. */
export function planIdFromPaystackCode(planCode: string | null | undefined): string | null {
    if (!planCode) return null
    const match = Object.entries(PAYSTACK_PLANS).find(([, code]) => code && code === planCode)
    return match ? match[0].replace(/_(ngn|usd)$/, '') : null
}

interface InitializeTransactionResponse {
    status: boolean
    message: string
    data: {
        authorization_url: string
        access_code: string
        reference: string
    }
}

interface VerifyTransactionResponse {
    status: boolean
    message: string
    data: {
        status: 'success' | 'failed' | 'abandoned'
        reference: string
        amount: number
        currency: string
        paid_at?: string
        customer: {
            email: string
            customer_code: string
        }
        plan?: string | null
        plan_object?: { plan_code?: string; interval?: string } | null
        metadata?: Record<string, unknown>
    }
}

export async function initializeTransaction({
    email,
    amount,
    planCode,
    callbackUrl,
    metadata,
}: {
    email: string
    amount?: number
    planCode?: string
    callbackUrl: string
    metadata?: Record<string, unknown>
}): Promise<InitializeTransactionResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            amount: amount ? amount * 100 : undefined, // Paystack uses kobo
            plan: planCode,
            callback_url: callbackUrl,
            metadata,
        }),
    })

    return response.json()
}

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
    })

    return response.json()
}

export async function createSubscription({
    customerCode,
    planCode,
}: {
    customerCode: string
    planCode: string
}) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customer: customerCode,
            plan: planCode,
        }),
    })

    return response.json()
}
