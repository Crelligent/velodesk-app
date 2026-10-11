'use server'

import { createClient } from '@/lib/supabase/server'

const ALLOWED_PLANS = ['founder_monthly', 'startup_monthly'] as const
const ALLOWED_CURRENCIES = ['USD', 'NGN'] as const

export type SelectedPlan = (typeof ALLOWED_PLANS)[number]
export type SelectedCurrency = (typeof ALLOWED_CURRENCIES)[number]

export async function signUpUser(
    email: string,
    password: string,
    fullName: string,
    origin: string,
    selectedPlan?: string | null,
    selectedCurrency?: string | null,
) {
    const supabase = await createClient()

    // Only persist values we recognise; anything else from the query string is dropped.
    const plan = ALLOWED_PLANS.includes(selectedPlan as SelectedPlan) ? (selectedPlan as SelectedPlan) : null
    const currency = ALLOWED_CURRENCIES.includes(selectedCurrency as SelectedCurrency)
        ? (selectedCurrency as SelectedCurrency)
        : null

    // The chosen plan + currency are stored in user metadata so they survive email
    // confirmation. No checkout happens at signup: the 14-day trial starts without a card.
    // The gateway is derived from currency later (NGN -> Paystack, USD -> Stripe).
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                ...(plan ? { selected_plan: plan } : {}),
                ...(currency ? { selected_currency: currency } : {}),
            },
            emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { data: { user: data.user, session: data.session } }
}

/**
 * Resends the sign-up confirmation email. Supabase also enforces its own minimum gap
 * between emails to the same address; if it refuses, we return how long to wait.
 * For an unknown or already-confirmed address Supabase reports success without sending,
 * so this never reveals whether an account exists.
 */
export async function resendSignupEmail(email: string, origin: string) {
    const clean = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
        return { error: 'Please enter a valid email address.' }
    }
    const supabase = await createClient()
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: clean,
        options: { emailRedirectTo: `${origin}/auth/callback?next=/onboarding` },
    })
    if (error) {
        const wait = error.message.match(/after (\d+) seconds?/i)
        if (wait) return { error: 'Please wait a little before asking again.', retryAfter: Number(wait[1]) }
        return { error: 'We could not resend the email. Please try again in a minute.' }
    }
    return { ok: true }
}

export async function signInUser(email: string, password: string) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
