/**
 * CSRF protection for integration OAuth: a random state is stored in an httpOnly
 * cookie by /api/integrations/oauth-start and must match on the callback.
 */
import { randomBytes, timingSafeEqual } from 'crypto'

export const OAUTH_STATE_COOKIE = 'vd_oauth_state'
export const OAUTH_STATE_MAX_AGE = 10 * 60 // seconds

export const oauthStateCookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/api/integrations',
    maxAge: OAUTH_STATE_MAX_AGE,
}

/** state = "<provider>.<random>"; the provider prefix tells the callback which exchange to run */
export function createOAuthState(provider: string): string {
    return `${provider}.${randomBytes(24).toString('base64url')}`
}

export function verifyOAuthState(
    state: string | null,
    cookieValue: string | undefined
): { provider: string } | null {
    if (!state || !cookieValue) return null
    const a = Buffer.from(state)
    const b = Buffer.from(cookieValue)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    const provider = state.slice(0, state.lastIndexOf('.'))
    return provider ? { provider } : null
}

/** Authorization URLs for providers whose code exchange exists in /api/integrations/callback */
export function buildAuthorizeUrl(provider: string, state: string): string | null {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback`
    const q = (params: Record<string, string | undefined>) =>
        new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]).toString()

    switch (provider) {
        case 'stripe':
            return `https://connect.stripe.com/oauth/authorize?${q({
                response_type: 'code', client_id: process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID,
                scope: 'read_only', redirect_uri: redirectUri, state,
            })}`
        case 'google-analytics':
            return `https://accounts.google.com/o/oauth2/v2/auth?${q({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, redirect_uri: redirectUri,
                response_type: 'code', scope: 'https://www.googleapis.com/auth/analytics.readonly',
                access_type: 'offline', prompt: 'consent', state,
            })}`
        case 'hubspot':
            return `https://app.hubspot.com/oauth/authorize?${q({
                client_id: process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID, redirect_uri: redirectUri,
                scope: 'crm.objects.contacts.read', state,
            })}`
        case 'intercom':
            return `https://app.intercom.com/oauth?${q({
                client_id: process.env.NEXT_PUBLIC_INTERCOM_CLIENT_ID, redirect_uri: redirectUri, state,
            })}`
        case 'salesforce':
            return `https://login.salesforce.com/services/oauth2/authorize?${q({
                response_type: 'code', client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID,
                redirect_uri: redirectUri, state,
            })}`
        case 'zendesk': {
            const subdomain = process.env.NEXT_PUBLIC_ZENDESK_SUBDOMAIN
            if (!subdomain) return null
            return `https://${subdomain}.zendesk.com/oauth/authorizations/new?${q({
                response_type: 'code', client_id: process.env.NEXT_PUBLIC_ZENDESK_CLIENT_ID,
                redirect_uri: redirectUri, scope: 'read', state,
            })}`
        }
        default:
            return null // e.g. quickbooks, xero, typeform: no token exchange implemented yet
    }
}
