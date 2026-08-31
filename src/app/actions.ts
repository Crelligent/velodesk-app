'use server'

import { createClient } from '@/lib/supabase/server'

export async function signUpUser(email: string, password: string, fullName: string, companyName: string, origin: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                company_name: companyName,
            },
            emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
        },
    })
    
    if (error) {
        return { error: error.message }
    }
    
    return { data: { user: data.user, session: data.session } }
}

export async function signInUser(email: string, password: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    
    if (error) {
        return { error: error.message }
    }
    
    return { success: true }
}
