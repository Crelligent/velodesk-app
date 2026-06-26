import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    try {
        const { userId, provider, accessToken } = await request.json()

        if (!userId || !provider || !accessToken) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Use service role key to bypass RLS for this backend operation
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { error } = await supabase
            .from('integration_tokens')
            .upsert(
                {
                    user_id: userId,
                    provider: provider,
                    access_token: accessToken
                },
                { onConflict: 'user_id,provider' }
            )

        if (error) {
            console.error('API save error:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('API save exception:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
