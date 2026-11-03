import { after, NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { freshAccessToken } from '@/lib/integrations/oauth-tokens'
import { getIntegrationByProvider } from '@/lib/integrations'
import { refreshPmfScore } from '@/lib/pmf-score'
import { getProviderModule, parseCredentials } from '@/lib/integrations/registry'
import { describeError } from '@/lib/integrations/http'

interface SyncRequest {
    provider: string
}

/**
 * POST /api/integrations/sync { provider }
 * Pulls real data from the provider and returns its SignalSet (nulls = not measured).
 */
export async function POST(request: NextRequest) {
    try {
        const { provider }: SyncRequest = await request.json()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const catalog = typeof provider === 'string' ? getIntegrationByProvider(provider) : undefined
        const module = catalog?.syncSupported ? getProviderModule(catalog.id) : null
        if (!catalog || !module) {
            return NextResponse.json(
                { error: `Sync not implemented for ${provider}` },
                { status: 400 }
            )
        }

        // Secrets are read server-side only (authenticated users can no longer
        // SELECT access_token, see supabase/2026-10-velodesk-fixes.sql), always
        // scoped to the session user.
        const admin = createAdminClient()
        const { data: integration, error: tokenError } = await admin
            .from('integration_tokens')
            .select('provider, access_token, refresh_token, expires_at, config')
            .eq('user_id', user.id)
            .eq('provider', catalog.id)
            .single()

        const accessToken = integration ? await freshAccessToken(admin, user.id, integration) : null
        if (tokenError || !accessToken) {
            return NextResponse.json(
                { error: 'Integration not connected' },
                { status: 404 }
            )
        }

        let signals
        try {
            signals = await module.sync(
                parseCredentials(catalog.id, accessToken),
                { config: integration.config as Record<string, unknown> | null }
            )
        } catch (error) {
            const message = describeError(error)
            console.error(`Sync failed for ${catalog.id}:`, message)
            return NextResponse.json({ success: false, recordsProcessed: 0, error: message }, { status: 502 })
        }

        // Update last sync timestamp
        await admin
            .from('integration_tokens')
            .update({ updated_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('provider', catalog.id)

        // Successful sync of a scored source -> recalculate after the response is sent
        if (catalog.feedsScore) {
            after(() => refreshPmfScore(admin, user.id))
        }

        return NextResponse.json({ success: true, recordsProcessed: 0, data: signals })
    } catch (error) {
        console.error('Sync error:', describeError(error))
        return NextResponse.json(
            { error: 'Sync failed', success: false },
            { status: 500 }
        )
    }
}
