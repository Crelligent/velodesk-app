import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        (process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://trrklkqogomnqvvofhxg.supabase.co"),
        (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycmtsa3FvZ29tbnF2dm9maHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTE5NzcsImV4cCI6MjA4MjAyNzk3N30.pTlTiwFxZPSDgvGojlHotrFhSg0iFhxSp5Ba6uHcypA"),
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        }
    )
}
