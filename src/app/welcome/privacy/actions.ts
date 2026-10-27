'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CONSENT_COOKIE, CONSENT_MAX_AGE, type PrivacyChoices } from '@/lib/privacy'

export type SaveResult = { ok: true } | { ok: false; message: string }

/** Saves the signed-in user's choices (RLS: own row only) and mirrors the analytics choice into the consent cookie. */
export async function savePrivacyChoices(choices: PrivacyChoices): Promise<SaveResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: 'Your session has ended. Sign in again and retry.' }

    const now = new Date().toISOString()
    const { error } = await supabase.from('privacy_choices').upsert({
        user_id: user.id,
        benchmark: choices.benchmark === true,
        product_emails: choices.productEmails === true,
        usage_analytics: choices.usageAnalytics === true,
        updated_at: now,
    }, { onConflict: 'user_id' })
    if (error) {
        console.error('privacy_choices save failed:', error.message)
        return { ok: false, message: 'We couldn\'t save your choices just now. Please try again.' }
    }

    ;(await cookies()).set(CONSENT_COOKIE, choices.usageAnalytics ? 'granted' : 'denied', {
        maxAge: CONSENT_MAX_AGE, path: '/', sameSite: 'lax', secure: true,
    })
    revalidatePath('/dashboard', 'layout')
    return { ok: true }
}
