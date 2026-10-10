import { after, NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkIntegrationLimit } from '@/lib/plans'
import { getIntegrationByProvider } from '@/lib/integrations'
import { refreshPmfScore } from '@/lib/pmf-score'
import { OAUTH_STATE_COOKIE, oauthStateCookieOptions, verifyOAuthState } from '@/lib/oauth-state'

export async function GET(request: NextRequest) {
    // CSRF: state must equal the httpOnly cookie set by /api/integrations/oauth-start
    const verified = verifyOAuthState(
        request.nextUrl.searchParams.get('state'),
        request.cookies.get(OAUTH_STATE_COOKIE)?.value
    )
    const response = verified
        ? await handleCallback(request, verified.provider)
        : NextResponse.redirect(new URL('/dashboard/integrations?error=invalid_state', request.url))

    // One-time use: always clear the state cookie
    response.cookies.set(OAUTH_STATE_COOKIE, '', { ...oauthStateCookieOptions, maxAge: 0 })
    return response
}

async function handleCallback(request: NextRequest, state: string) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        // `error` comes from the provider redirect: log only a short, sanitised code
        console.error(`OAuth error from ${state}:`, error.replace(/[^a-z0-9_.-]/gi, '').slice(0, 64))
        return NextResponse.redirect(
            new URL(`/dashboard/integrations?error=${encodeURIComponent(error)}`, request.url)
        )
    }

    if (!code || !state) {
        return NextResponse.redirect(
            new URL('/dashboard/integrations?error=missing_params', request.url)
        )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
        let tokenData: {
            access_token: string
            refresh_token?: string
            expires_at?: string
            config?: Record<string, unknown>
        } | null = null

        const admin = createAdminClient()
        const limitError = await checkIntegrationLimit(admin, user.id, state)
        if (limitError) {
            return NextResponse.redirect(
                new URL('/dashboard/integrations?error=plan_limit', request.url)
            )
        }

        // Handle different OAuth providers
        switch (state) {
            case 'hubspot':
                tokenData = await exchangeHubSpotCode(code)
                break

            case 'google-analytics':
                tokenData = await exchangeGoogleCode(code)
                break

            case 'stripe':
                tokenData = await exchangeStripeConnectCode(code)
                break

            case 'intercom':
                tokenData = await exchangeIntercomCode(code)
                break

            case 'salesforce':
                tokenData = await exchangeSalesforceCode(code)
                break

            case 'zendesk':
                tokenData = await exchangeZendeskCode(code)
                break

            default:
                throw new Error(`Unknown provider: ${state}`)
        }

        if (!tokenData) {
            throw new Error('Failed to exchange code for token')
        }

        // Store the token (service role: authenticated users cannot read/write secrets directly)
        const { error: dbError } = await admin.from('integration_tokens').upsert(
            {
                user_id: user.id,
                provider: state,
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_at: tokenData.expires_at,
                config: tokenData.config ?? {},
                status: 'connected',
                created_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,provider' }
        )

        if (dbError) {
            console.error(`Error saving ${state} token:`, dbError.code ?? 'db_error')
            throw dbError
        }

        // Pull the new data and write a fresh PMF Score after the redirect is sent
        if (getIntegrationByProvider(state)?.feedsScore) {
            after(() => refreshPmfScore(admin, user.id))
        }

        return NextResponse.redirect(
            new URL(`/dashboard/integrations?success=${state}`, request.url)
        )
    } catch (err) {
        console.error(`OAuth callback error for ${state}:`, err instanceof Error ? err.name : 'unknown')
        return NextResponse.redirect(
            new URL(`/dashboard/integrations?error=oauth_failed`, request.url)
        )
    }
}

// Token exchange functions for each provider

async function exchangeHubSpotCode(code: string) {
    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID!,
            client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback`,
            code,
        }),
    })

    if (!response.ok) {
        // provider + status only: error bodies can echo codes or client details
        console.error('HubSpot token exchange failed: HTTP', response.status)
        return null
    }

    const data = await response.json()
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }
}

async function exchangeGoogleCode(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback`,
            code,
        }),
    })

    if (!response.ok) {
        // provider + status only: error bodies can echo codes or client details
        console.error('Google token exchange failed: HTTP', response.status)
        return null
    }

    const data = await response.json()
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }
}

async function exchangeStripeConnectCode(code: string) {
    const response = await fetch('https://connect.stripe.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_secret: process.env.STRIPE_SECRET_KEY!,
            code,
        }),
    })

    if (!response.ok) {
        // provider + status only: error bodies can echo codes or client details
        console.error('Stripe Connect token exchange failed: HTTP', response.status)
        return null
    }

    const data = await response.json()
    // stripe_user_id is the connected account id (acct_...). Sync uses it with the
    // platform key + Stripe-Account header to read the CUSTOMER's data.
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        config: { stripe_user_id: data.stripe_user_id, livemode: data.livemode },
    }
}

async function exchangeIntercomCode(code: string) {
    const response = await fetch('https://api.intercom.io/auth/eagle/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_INTERCOM_CLIENT_ID!,
            client_secret: process.env.INTERCOM_CLIENT_SECRET!,
            code,
        }),
    })

    if (!response.ok) {
        // provider + status only: error bodies can echo codes or client details
        console.error('Intercom token exchange failed: HTTP', response.status)
        return null
    }

    const data = await response.json()
    return { access_token: data.token }
}

async function exchangeSalesforceCode(code: string) {
    const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID!,
            client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback`,
            code,
        }),
    })

    if (!response.ok) {
        // provider + status only: error bodies can echo codes or client details
        console.error('Salesforce token exchange failed: HTTP', response.status)
        return null
    }

    const data = await response.json()
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
    }
}

async function exchangeZendeskCode(code: string) {
    const subdomain = process.env.NEXT_PUBLIC_ZENDESK_SUBDOMAIN
    const response = await fetch(`https://${subdomain}.zendesk.com/oauth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.NEXT_PUBLIC_ZENDESK_CLIENT_ID,
            client_secret: process.env.ZENDESK_CLIENT_SECRET,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback`,
            code,
            scope: 'read',
        }),
    })

    if (!response.ok) {
        // provider + status only: error bodies can echo codes or client details
        console.error('Zendesk token exchange failed: HTTP', response.status)
        return null
    }

    const data = await response.json()
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
    }
}
