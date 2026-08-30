import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://trrklkqogomnqvvofhxg.supabase.co")
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycmtsa3FvZ29tbnF2dm9maHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTE5NzcsImV4cCI6MjA4MjAyNzk3N30.pTlTiwFxZPSDgvGojlHotrFhSg0iFhxSp5Ba6uHcypA")
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { form_id, session_id, answers, duration_seconds } = body

        if (!form_id || !answers) {
            return NextResponse.json({ error: 'Missing form_id or answers' }, { status: 400 })
        }

        // 1. Insert Final Submission
        const { error: insertError } = await supabase
            .from('form_submissions')
            .insert({
                form_id,
                answers,
                duration_seconds: duration_seconds || 0
            })

        if (insertError) {
            console.error('Submission Error:', insertError)
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        // 2. Clear Partial Submission State (if it exists)
        if (session_id) {
            await supabase
                .from('form_partial_submissions')
                .delete()
                .match({ form_id, session_id })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
