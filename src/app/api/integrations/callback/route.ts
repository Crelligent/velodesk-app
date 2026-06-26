import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // provider name
    const error = searchParams.get('error')

    if (error) {
        console.error('OAuth error:', error)
        return NextResponse.redirect(
            new URL(`/dashboard/integrations?error=${error}`, request.url)
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
        let tokenData: { access_token: string; refresh_token?: string; expires_at?: string } | null = null

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

        // Store the token
        const { error: dbError } = await supabase.from('integration_tokens').upsert(
            {
                user_id: user.id,
                provider: state,
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_at: tokenData.expires_at,
                created_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,provider' }
        )

        if (dbError) {
            console.error('Error saving token:', dbError)
            throw dbError
        }

        return NextResponse.redirect(
            new URL(`/dashboard/integrations?success=${state}`, request.url)
        )
    } catch (err) {
        console.error('OAuth callback error:', err)
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
        const error = await response.text()
        console.error('HubSpot token exchange failed:', error)
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
        const error = await response.text()
        console.error('Google token exchange failed:', error)
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
        const error = await response.text()
        console.error('Stripe Connect token exchange failed:', error)
        return null
    }

    const data = await response.json()
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
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
        const error = await response.text()
        console.error('Intercom token exchange failed:', error)
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
        const error = await response.text()
        console.error('Salesforce token exchange failed:', error)
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
        const error = await response.text()
        console.error('Zendesk token exchange failed:', error)
        return null
    }

    const data = await response.json()
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
    }
}
