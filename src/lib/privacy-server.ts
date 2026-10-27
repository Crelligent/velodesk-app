import type { SupabaseClient } from '@supabase/supabase-js'
import { DEMO_EMAILS } from './demo'

/**
 * True when a real (non-demo) user hasn't seen the "Your data, your control" screen yet.
 * A failed lookup returns false, so a database problem never traps anyone in a redirect loop.
 */
export async function needsPrivacyChoices(supabase: SupabaseClient, user: { id: string; email?: string | null }): Promise<boolean> {
    if (DEMO_EMAILS.has((user.email ?? '').toLowerCase())) return false
    const { data, error } = await supabase.from('privacy_choices').select('user_id').eq('user_id', user.id).maybeSingle()
    return !error && !data
}
