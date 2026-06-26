import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Successfully authenticated - check if user needs onboarding
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Try to get profile, but don't fail if table doesn't exist
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('company_name')
                        .eq('id', user.id)
                        .single()

                    // If no profile or no company name, redirect to onboarding
                    if (!profile || !profile.company_name) {
                        return NextResponse.redirect(`${origin}/onboarding`)
                    }
                } catch {
                    // Profile table might not exist yet, go to onboarding
                    return NextResponse.redirect(`${origin}/onboarding`)
                }
            }

            // Redirect to dashboard or next URL
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            // Auth error - log it and redirect to login with error
            console.error('Auth callback error:', error.message)
            return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
        }
    }

    // No code provided - redirect to login
    return NextResponse.redirect(`${origin}/login?error=no_code`)
}
