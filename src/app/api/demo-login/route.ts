import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'ng'
        const redirectUrl = searchParams.get('redirect') || '/dashboard/integrations'
        
        let email = 'demo@velodesk.com'
        if (type === 'ng') email = 'demo-ng@velodesk.com'
        if (type === 'investor') email = 'investor@velodesk.com'
        if (type === 'investor-ng') email = 'investor-ng@velodesk.com'

        const password = 'presentation2026'

        const supabase = await createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        const url = new URL(request.url)
        url.pathname = redirectUrl
        url.search = ''
        return NextResponse.redirect(url)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
