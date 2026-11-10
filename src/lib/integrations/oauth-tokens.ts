/**
 * OAuth access tokens that expire (HubSpot: about 30 minutes; Google: about 1 hour) are refreshed here before a sync.
 * Server-only: reads refresh tokens with the service-role client.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v3/token'
/** Scopes the Velodesk HubSpot app requests. Keep in sync with hubspot/src/app/app-hsmeta.json. */
export const HUBSPOT_SCOPES = ['oauth', 'crm.objects.contacts.read', 'crm.objects.deals.read']

/** Refresh this long before expiry so a slow sync never starts with a token about to lapse */
const REFRESH_MARGIN_MS = 5 * 60 * 1000

export interface TokenRow {
    provider: string
    access_token: string | null
    refresh_token?: string | null
    expires_at?: string | null
}

export function hubspotOAuthConfigured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID && process.env.HUBSPOT_CLIENT_SECRET)
}

export function needsRefresh(row: TokenRow, now = Date.now()): boolean {
    if (!row.refresh_token || !row.expires_at) return false // pasted tokens never expire this way
    const expires = Date.parse(row.expires_at)
    return Number.isFinite(expires) && expires - now < REFRESH_MARGIN_MS
}

export async function refreshHubSpotToken(
    refreshToken: string,
    fetchImpl: typeof fetch = fetch
): Promise<{ access_token: string; refresh_token: string; expires_at: string } | null> {
    const res = await fetchImpl(HUBSPOT_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID ?? '',
            client_secret: process.env.HUBSPOT_CLIENT_SECRET ?? '',
            refresh_token: refreshToken,
        }),
    })
    if (!res.ok) {
        console.error('HubSpot token refresh failed: HTTP', res.status)
        return null
    }
    const data = await res.json()
    if (!data?.access_token) return null
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token ?? refreshToken,
        expires_at: new Date(Date.now() + Number(data.expires_in ?? 1800) * 1000).toISOString(),
    }
}

export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
/** Read-only Google scopes, one per Velodesk connection (both from the same Google Cloud OAuth client). */
export const GOOGLE_SCOPES: Record<string, string> = {
    'google-analytics': 'https://www.googleapis.com/auth/analytics.readonly',
    'google-search-console': 'https://www.googleapis.com/auth/webmasters.readonly',
}
export const GOOGLE_PROVIDERS = Object.keys(GOOGLE_SCOPES)

/** Google access tokens last about an hour; the refresh token is kept (Google rarely issues a new one). */
export async function refreshGoogleToken(
    refreshToken: string,
    fetchImpl: typeof fetch = fetch
): Promise<{ access_token: string; refresh_token: string; expires_at: string } | null> {
    const res = await fetchImpl(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
            refresh_token: refreshToken,
        }),
    })
    if (!res.ok) {
        console.error('Google token refresh failed: HTTP', res.status)
        return null
    }
    const data = await res.json()
    if (!data?.access_token) return null
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token ?? refreshToken,
        expires_at: new Date(Date.now() + Number(data.expires_in ?? 3600) * 1000).toISOString(),
    }
}

/**
 * Returns a usable access token for the row, refreshing and saving it first if it is about to expire.
 * On a failed refresh the row is marked 'expired' so the dashboard asks the founder to reconnect.
 */
export async function freshAccessToken(
    admin: SupabaseClient,
    userId: string,
    row: TokenRow,
    fetchImpl: typeof fetch = fetch
): Promise<string | null> {
    if (!needsRefresh(row)) return row.access_token
    const refresher = row.provider === 'hubspot' ? refreshHubSpotToken
        : GOOGLE_PROVIDERS.includes(row.provider) ? refreshGoogleToken
        : null
    if (!refresher) return row.access_token

    const next = await refresher(row.refresh_token!, fetchImpl)
    if (!next) {
        await admin.from('integration_tokens').update({ status: 'expired', updated_at: new Date().toISOString() })
            .eq('user_id', userId).eq('provider', row.provider)
        return null
    }
    await admin.from('integration_tokens').update({
        access_token: next.access_token,
        refresh_token: next.refresh_token,
        expires_at: next.expires_at,
        status: 'connected',
        updated_at: new Date().toISOString(),
    }).eq('user_id', userId).eq('provider', row.provider)
    return next.access_token
}
