import { after, NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getIntegrationByProvider } from '@/lib/integrations'
import { checkIntegrationLimit } from '@/lib/plans'
import { refreshPmfScore } from '@/lib/pmf-score'
import { getProviderModule, parseCredentials } from '@/lib/integrations/registry'
import type { Credentials } from '@/lib/integrations/signals'

const MAX_FIELD_LENGTH = 4000

/**
 * POST /api/integrations/save
 * Body: { provider, credentials: { <field>: string } }  (preferred)
 *   or: { provider, accessToken: string }              (legacy single-key form)
 * Credentials are validated against the provider before being stored (as JSON).
 */
export async function POST(request: NextRequest) {
    try {
        // The user is ALWAYS taken from the session. `userId` in the body is
        // accepted only for backwards compatibility and must match.
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId, provider, accessToken, credentials } = await request.json()
        if (userId && userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const integration = typeof provider === 'string' ? getIntegrationByProvider(provider) : undefined
        const module = integration ? getProviderModule(integration.id) : null
        if (!integration || integration.authType !== 'api_key' || !integration.syncSupported || !module) {
            return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
        }

        // Normalise to { field: value } using the catalog's field list
        const raw: Credentials =
            credentials && typeof credentials === 'object' && !Array.isArray(credentials)
                ? Object.fromEntries(Object.entries(credentials as Record<string, unknown>)
                    .filter((e): e is [string, string] => typeof e[1] === 'string'))
                : parseCredentials(integration.id, typeof accessToken === 'string' ? accessToken : '')

        const fields = integration.credentialFields ?? []
        const clean: Credentials = {}
        for (const field of fields) {
            const value = (raw[field.key] ?? '').trim()
            if (value.length > MAX_FIELD_LENGTH) {
                return NextResponse.json({ error: `${field.label} is too long` }, { status: 400 })
            }
            if (field.options && value && !field.options.some(o => o.value === value)) {
                return NextResponse.json({ error: `Invalid ${field.label}` }, { status: 400 })
            }
            if (value) clean[field.key] = value
            else if (field.options) clean[field.key] = field.options[0].value
            else if (field.required !== false) {
                return NextResponse.json({ error: `${field.label} is required` }, { status: 400 })
            }
        }

        // Live check against the provider's API. Only founder-fixable input problems are
        // shown; provider status / reachability / timeouts are not revealed.
        const check = await module.validate(clean)
        if (!check.ok) {
            return NextResponse.json(
                { error: check.input ? check.error : "Couldn't verify these credentials. Check them and try again." },
                { status: 400 }
            )
        }

        // Service role is needed because authenticated users cannot write secrets
        // directly; every query below is scoped to the session user.
        const admin = createAdminClient()

        const limitError = await checkIntegrationLimit(admin, user.id, integration.id)
        if (limitError) {
            return NextResponse.json({ error: limitError }, { status: 403 })
        }

        const { error } = await admin
            .from('integration_tokens')
            .upsert(
                {
                    user_id: user.id,
                    provider: integration.id,
                    access_token: JSON.stringify(clean),
                    status: 'connected',
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,provider' }
            )

        if (error) {
            console.error('API save error:', error.message)
            return NextResponse.json(
                { error: 'Failed to save integration' },
                { status: 500 }
            )
        }

        // Pull the new data and write a fresh PMF Score after the response is sent
        if (integration.feedsScore) {
            after(() => refreshPmfScore(admin, user.id))
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('API save exception:', error instanceof Error ? error.name : 'unknown')
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
