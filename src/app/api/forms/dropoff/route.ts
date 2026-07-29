import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { form_id, session_id, events } = body
        // events: Array of { field_id, event_type, time_spent_ms }

        if (!form_id || !session_id || !events || !Array.isArray(events)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        // Batch insert drop-off telemetry events
        const payload = events.map(evt => ({
            form_id,
            session_id,
            field_id: evt.field_id,
            event_type: evt.event_type,
            time_spent_ms: evt.time_spent_ms || 0
        }))

        const { error } = await supabase
            .from('form_dropoff_events')
            .insert(payload)

        if (error) {
            console.error('Supabase Insert Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
