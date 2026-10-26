'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_EMAILS } from '@/lib/demo'
import { INVESTOR_HUBSPOT_PROVIDER, syncInvestorHubSpot, validateInvestorToken, type SyncSummary } from '@/lib/hubspot-investor'

export type ConnectState = { status: 'idle' } | { status: 'ok' } | { status: 'error'; message: string }

async function sessionUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function connectHubSpot(_prev: ConnectState, formData: FormData): Promise<ConnectState> {
    const token = String(formData.get('token') ?? '').trim()
    const user = await sessionUser()
    if (!user) return { status: 'error', message: 'Your session has ended. Sign in again and retry.' }
    if (DEMO_EMAILS.has((user.email ?? '').toLowerCase())) return { status: 'error', message: 'Connecting HubSpot is turned off on demo accounts.' }
    if (!/^pat-[a-z0-9-]{10,200}$/i.test(token)) {
        return { status: 'error', message: 'That doesn\'t look like a HubSpot private app token. It starts with "pat-".' }
    }

    const check = await validateInvestorToken(token)
    if (!check.ok) return { status: 'error', message: check.error }

    const admin = createAdminClient()
    // integration_tokens.user_id references profiles: make sure the investor has one
    await admin.from('profiles').upsert({ id: user.id, email: user.email ?? '' }, { onConflict: 'id', ignoreDuplicates: true })
    const { error } = await admin.from('integration_tokens').upsert({
        user_id: user.id,
        provider: INVESTOR_HUBSPOT_PROVIDER,
        access_token: JSON.stringify({ accessToken: token }),
        status: 'connected',
        updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' })
    if (error) {
        console.error('Investor HubSpot save failed:', error.message)
        return { status: 'error', message: 'We couldn\'t save the connection just now. Please try again.' }
    }
    await syncInvestorHubSpot(admin, user.id)
    revalidatePath('/investor/hubspot')
    return { status: 'ok' }
}

export async function syncNow(): Promise<SyncSummary | null> {
    const user = await sessionUser()
    if (!user || DEMO_EMAILS.has((user.email ?? '').toLowerCase())) return null
    const summary = await syncInvestorHubSpot(createAdminClient(), user.id)
    revalidatePath('/investor/hubspot')
    return summary
}

export async function disconnectHubSpot(): Promise<void> {
    const user = await sessionUser()
    if (!user) return
    await createAdminClient().from('integration_tokens').delete()
        .eq('user_id', user.id).eq('provider', INVESTOR_HUBSPOT_PROVIDER)
    revalidatePath('/investor/hubspot')
}
