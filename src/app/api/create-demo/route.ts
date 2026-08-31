import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    try {
        const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || (() => { throw new Error('Missing SUPABASE_URL') })())
        const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || (() => { throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY') })())
        
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
