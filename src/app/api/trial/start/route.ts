import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureTrial } from '@/lib/plans'
import { cookies } from 'next/headers'
import { PERK_COOKIE } from '@/lib/perks'

// POST /api/trial/start: called when onboarding completes.
// Idempotent: creates the trial (14 days, or the partner perk length) once per user, never re-grants.
export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const admin = createAdminClient()
        await ensureTrial(admin, user, (await cookies()).get(PERK_COOKIE)?.value)

        const { data: sub } = await admin
            .from('subscriptions')
            .select('plan, status, trial_ends_at')
            .eq('user_id', user.id)
            .maybeSingle()

        return NextResponse.json({ success: true, subscription: sub })
    } catch (error) {
        console.error('Trial start error:', error)
        return NextResponse.json({ error: 'Failed to start trial' }, { status: 500 })
    }
}
