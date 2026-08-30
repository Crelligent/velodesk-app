import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://trrklkqogomnqvvofhxg.supabase.co"
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycmtsa3FvZ29tbnF2dm9maHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1MTk3NywiZXhwIjoyMDgyMDI3OTc3fQ.8oXwWO28vFjeBRQ4jD692fVtHXBwTo1tcEiG0p-xQW4"
        
        const supabase = createClient(supabaseUrl, serviceRoleKey)

        const { data, error } = await supabase.auth.admin.createUser({
            email: 'demo@velodesk.com',
            password: 'presentation2026',
            email_confirm: true,
            user_metadata: {
                full_name: 'Demo Founder',
                company_name: 'Stark Industries',
            }
        })

        if (error) {
            if (error.message.includes('already registered')) {
                return NextResponse.json({ success: true, message: 'Demo account already exists!' })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Demo account created successfully! You can now log in.' })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
