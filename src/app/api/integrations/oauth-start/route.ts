import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getIntegrationByProvider } from '@/lib/integrations'
import {
    buildAuthorizeUrl,
    createOAuthState,
    OAUTH_STATE_COOKIE,
    oauthStateCookieOptions,
} from '@/lib/oauth-state'

/**
 * GET /api/integrations/oauth-start?provider=stripe
 * Sets a random CSRF state in an httpOnly cookie and 302s to the provider.
 */
export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const provider = request.nextUrl.searchParams.get('provider') || ''
    // Only providers the catalog lists as connectable via OAuth (today: Stripe)
    const catalog = getIntegrationByProvider(provider)
    const state = createOAuthState(provider)
    const authorizeUrl = catalog?.authType === 'oauth' && catalog.syncSupported
        ? buildAuthorizeUrl(provider, state)
        : null
    if (!authorizeUrl) {
        return NextResponse.redirect(
            new URL('/dashboard/integrations?error=oauth_not_supported', request.url)
        )
    }

    const response = NextResponse.redirect(authorizeUrl)
    response.cookies.set(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions)
    return response
}
