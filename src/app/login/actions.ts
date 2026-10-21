'use server'

import { createClient as createStatelessClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_EMAILS } from '@/lib/demo'

/**
 * Sign-in with an emailed one-time code (length set in Supabase, currently 8 digits).
 *
 * Two ways in, both ending at the same code screen:
 *  1. Email + password -> password is checked WITHOUT creating a browser session,
 *     then a code is emailed. The session only starts once the code is entered.
 *  2. "Email me a code" -> code only (passwordless).
 * Google sign-in is unchanged (handled in the page).
 *
 * The code is Supabase's email OTP: the "Magic Link" email template must include
 * {{ .Token }} for the code to appear in the email.
 */

// Shared demo accounts use non-deliverable addresses, so they keep password-only sign-in
// (same as /api/demo-login).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_RE = /^\d{6,10}$/ // Supabase Email OTP Length (currently 8)

type Result =
    | { ok: true; step: 'code' }
    | { ok: true; step: 'done'; redirectTo: string }
    | { ok: false; error: string; retryAfter?: number }

const clean = (email: string) => email.trim().toLowerCase()

/** Only same-site paths, never protocol-relative URLs. */
function safeNext(next: string | null | undefined, email: string): string {
    if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) return next
    if (email.includes('investor')) return '/investor/dashboard'
    // Demo founder walks through the product: connected sources first, then the dashboard.
    return DEMO_EMAILS.has(email) ? '/dashboard/integrations' : '/dashboard'
}

function rateLimited(message: string) {
    const wait = message.match(/after (\d+) seconds?/i)
    return wait ? Number(wait[1]) : null
}

async function emailCode(email: string): Promise<Result> {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
    })
    if (error) {
        const wait = rateLimited(error.message)
        if (wait) return { ok: false, error: `Please wait ${wait} seconds before asking for another code.`, retryAfter: wait }
        // Unknown address: behave as if a code was sent, so the form never reveals who has an account.
        if (/signups? not allowed|user not found/i.test(error.message)) return { ok: true, step: 'code' }
        console.error('[login] send code failed:', error.message)
        return { ok: false, error: 'We could not send a code right now. Please try again in a minute.' }
    }
    return { ok: true, step: 'code' }
}

export async function startPasswordSignIn(emailRaw: string, password: string, next?: string | null): Promise<Result> {
    const email = clean(emailRaw)
    if (!EMAIL_RE.test(email) || !password) return { ok: false, error: 'Enter your email address and password.' }

    if (DEMO_EMAILS.has(email)) {
        const supabase = await createClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return { ok: false, error: 'Email or password is incorrect.' }
        return { ok: true, step: 'done', redirectTo: safeNext(next, email) }
    }

    // Check the password with a client that stores nothing in the browser.
    const checker = createStatelessClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
        { auth: { persistSession: false, autoRefreshToken: false } },
    )
    const { data, error } = await checker.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
        if (/email not confirmed/i.test(error?.message ?? '')) {
            return { ok: false, error: 'Please confirm your email address first. Check your inbox for the link we sent.' }
        }
        return { ok: false, error: 'Email or password is incorrect.' }
    }

    // Revoke the throwaway session the password check created (this session only).
    try {
        await createAdminClient().auth.admin.signOut(data.session.access_token, 'local')
    } catch (e) {
        console.error('[login] could not revoke password-check session:', e instanceof Error ? e.message : e)
    }

    return emailCode(email)
}

export async function sendSignInCode(emailRaw: string): Promise<Result> {
    const email = clean(emailRaw)
    if (!EMAIL_RE.test(email)) return { ok: false, error: 'Enter a valid email address.' }
    return emailCode(email)
}

export async function verifySignInCode(emailRaw: string, codeRaw: string, next?: string | null): Promise<Result> {
    const email = clean(emailRaw)
    const code = codeRaw.replace(/\D/g, '')
    if (!EMAIL_RE.test(email) || !CODE_RE.test(code)) return { ok: false, error: 'Enter the code from your email.' }

    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    if (error) {
        return { ok: false, error: 'That code is wrong or has expired. Check the latest email or ask for a new code.' }
    }
    return { ok: true, step: 'done', redirectTo: safeNext(next, email) }
}
