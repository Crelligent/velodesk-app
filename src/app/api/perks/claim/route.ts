import { NextResponse, type NextRequest } from 'next/server'
import { normalisePerk, PERK_COOKIE, PERK_COOKIE_MAX_AGE } from '@/lib/perks'

// GET /api/perks/claim?code=<code>
// Remembers a partner perk (cookie, so it also survives Google sign-up) and sends
// the founder to sign-up. Unknown codes fall through to the normal 14-day sign-up.
export async function GET(request: NextRequest) {
    const code = normalisePerk(request.nextUrl.searchParams.get('code'))
    const target = new URL(code ? `/signup?perk=${code}` : '/signup', request.url)
    const response = NextResponse.redirect(target)
    if (code) {
        response.cookies.set(PERK_COOKIE, code, {
            maxAge: PERK_COOKIE_MAX_AGE,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        })
    }
    return response
}
