import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// POST /auth/signout (the "Sign out" button submits a form here).
// - 303 so the browser follows with a GET; the old 307 re-POSTed to /login, which failed,
//   so the user stayed signed in.
// - The auth cookies are cleared on the redirect response itself.
// - Redirects to the same site the request came from (no NEXT_PUBLIC_APP_URL fallback to localhost).
export async function POST(request: NextRequest) {
    const response = NextResponse.redirect(new URL('/login', request.url), { status: 303 })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        },
    )
    await supabase.auth.signOut()

    // Belt and braces: expire any Supabase auth cookie that is still present.
    for (const { name } of request.cookies.getAll()) {
        if (name.startsWith('sb-') && name.includes('-auth-token')) {
            response.cookies.set(name, '', { path: '/', maxAge: 0 })
        }
    }
    return response
}
