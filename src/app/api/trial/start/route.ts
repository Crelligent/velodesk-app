import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureTrial } from '@/lib/plans'

// POST /api/trial/start: called when onboarding completes.
// Idempotent: creates the 14-day trial once per user, never re-grants.
export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const admin = createAdminClient()
        await ensureTrial(admin, user)

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
