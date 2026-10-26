'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { DEMO_EMAILS } from '@/lib/demo'
import { sendInvestorAccessEmail } from '@/lib/email'
import { companyDomainFromEmail } from '@/lib/hubspot-investor'

/**
 * Founder-controlled investor access. Runs as the signed-in founder: row-level security
 * on investor_access only lets a founder create and change their own rows.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_ACTIVE = 25

export type ShareState =
    | { status: 'idle' }
    | { status: 'ok'; email: string; emailed: boolean }
    | { status: 'error'; message: string }

export async function shareWithInvestor(_prev: ShareState, formData: FormData): Promise<ShareState> {
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    if (!EMAIL_RE.test(email) || email.length > 254) {
        return { status: 'error', message: 'Enter the investor\'s full email address, for example name@fund.com.' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { status: 'error', message: 'Your session has ended. Sign in again and retry.' }
    if (DEMO_EMAILS.has((user.email ?? '').toLowerCase())) {
        return { status: 'error', message: 'Sharing is turned off on demo accounts. Sign up with your own account to share real scores.' }
    }
    if (email === (user.email ?? '').toLowerCase()) {
        return { status: 'error', message: 'That\'s your own email. Enter the investor\'s address.' }
    }

    const { count } = await supabase
        .from('investor_access')
        .select('id', { count: 'exact', head: true })
        .eq('founder_id', user.id)
        .eq('status', 'active')
    if ((count ?? 0) >= MAX_ACTIVE) {
        return { status: 'error', message: `You can share with up to ${MAX_ACTIVE} investors at once. Remove one first.` }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('company_name, industry, full_name')
        .eq('id', user.id)
        .maybeSingle()

    const { error } = await supabase.from('investor_access').insert({
        founder_id: user.id,
        investor_email: email,
        company_name: profile?.company_name || null,
        industry: profile?.industry || null,
        company_domain: companyDomainFromEmail(user.email),
    })
    if (error) {
        if (error.code === '23505') return { status: 'error', message: 'You already share your scores with this investor.' }
        console.error('investor_access insert failed:', error.message)
        return { status: 'error', message: 'We couldn\'t save that just now. Please try again.' }
    }

    const companyName = profile?.company_name || 'A Velodesk company'
    const emailed = await sendInvestorAccessEmail(email, {
        companyName,
        founderName: profile?.full_name || user.email || 'The founder',
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://velodesk.crelligent.com'}/login?next=/investor/dashboard`,
    }).catch(() => false)

    revalidatePath('/dashboard/investors')
    return { status: 'ok', email, emailed }
}

export async function revokeInvestor(formData: FormData): Promise<void> {
    const id = String(formData.get('id') ?? '')
    if (!/^[0-9a-f-]{36}$/i.test(id)) return
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
        .from('investor_access')
        .update({ status: 'revoked', revoked_at: new Date().toISOString() })
        .eq('id', id)
        .eq('founder_id', user.id)
    if (error) console.error('investor_access revoke failed:', error.message)
    revalidatePath('/dashboard/investors')
}
