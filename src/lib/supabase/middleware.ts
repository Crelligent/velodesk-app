import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        (process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://trrklkqogomnqvvofhxg.supabase.co"),
        (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycmtsa3FvZ29tbnF2dm9maHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTE5NzcsImV4cCI6MjA4MjAyNzk3N30.pTlTiwFxZPSDgvGojlHotrFhSg0iFhxSp5Ba6uHcypA"),
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect dashboard routes
    if (
        !user &&
        request.nextUrl.pathname.startsWith('/dashboard')
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Protect onboarding route
    if (
        !user &&
        request.nextUrl.pathname.startsWith('/onboarding')
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users from login/signup to dashboard
    // (but only if they're NOT coming from OAuth - check for redirected param)
    if (
        user &&
        (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') &&
        !request.nextUrl.searchParams.has('redirected')
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
