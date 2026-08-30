import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://trrklkqogomnqvvofhxg.supabase.co"
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycmtsa3FvZ29tbnF2dm9maHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1MTk3NywiZXhwIjoyMDgyMDI3OTc3fQ.8oXwWO28vFjeBRQ4jD692fVtHXBwTo1tcEiG0p-xQW4"
        
        const supabase = createClient(supabaseUrl, serviceRoleKey)

        // 1. Create standard US Demo
        await supabase.auth.admin.createUser({
            email: 'demo@velodesk.com',
            password: 'presentation2026',
            email_confirm: true,
            user_metadata: {
                full_name: 'Demo Founder',
                company_name: 'Acme Industries',
                region: 'US'
            }
        })

        // 2. Create NG Demo
        await supabase.auth.admin.createUser({
            email: 'demo-ng@velodesk.com',
            password: 'presentation2026',
            email_confirm: true,
            user_metadata: {
                full_name: 'Demo Founder NG',
                company_name: 'Dangote Industries',
                region: 'NG'
            }
        })

        // 3. Create US Investor
        await supabase.auth.admin.createUser({
            email: 'investor@velodesk.com',
            password: 'presentation2026',
            email_confirm: true,
            user_metadata: {
                full_name: 'Demo Investor',
                company_name: 'Sequoia Capital',
                region: 'US'
            }
        })

        // 4. Create NG Investor
        await supabase.auth.admin.createUser({
            email: 'investor-ng@velodesk.com',
            password: 'presentation2026',
            email_confirm: true,
            user_metadata: {
                full_name: 'Demo Investor NG',
                company_name: 'Ventures Platform',
                region: 'NG'
            }
        })

        return NextResponse.json({ success: true, message: 'All Demo and Investor accounts generated successfully!' })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
