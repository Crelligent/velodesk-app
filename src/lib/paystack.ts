const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export const PAYSTACK_PLANS = {
    pro_monthly: 'PLN_xxx', // Replace with your Paystack plan code
    pro_yearly: 'PLN_xxx',
    enterprise_monthly: 'PLN_xxx',
    enterprise_yearly: 'PLN_xxx',
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
        customer: {
            email: string
        }
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
