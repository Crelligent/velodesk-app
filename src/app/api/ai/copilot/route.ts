import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatWithCopilot, AICopilotMessage } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { messages } = body as { messages: AICopilotMessage[] }

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages required' }, { status: 400 })
        }

        // Get user context
        const { data: profile } = await supabase
            .from('profiles')
            .select('company_name')
            .eq('id', user.id)
            .single()

        const { data: latestScore } = await supabase
            .from('pmf_scores')
            .select('score')
            .eq('user_id', user.id)
            .order('calculated_at', { ascending: false })
            .limit(1)
            .single()

        // Chat with AI copilot
        const response = await chatWithCopilot(messages, {
            companyName: profile?.company_name,
            pmfScore: latestScore?.score,
        })

        return NextResponse.json({ message: response })
    } catch (error) {
        console.error('Copilot error:', error)
        return NextResponse.json(
            { error: 'Copilot unavailable' },
            { status: 500 }
        )
    }
}
