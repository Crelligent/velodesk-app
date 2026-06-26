import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePMFInsights } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { pmfScore, breakdown } = body

        if (pmfScore === undefined) {
            return NextResponse.json({ error: 'PMF score required' }, { status: 400 })
        }

        // Get user profile for context
        const { data: profile } = await supabase
            .from('profiles')
            .select('company_name, industry')
            .eq('id', user.id)
            .single()

        // Generate AI insights
        const insights = await generatePMFInsights({
            pmfScore,
            breakdown: breakdown || {},
            companyName: profile?.company_name,
            industry: profile?.industry,
        })

        return NextResponse.json(insights)
    } catch (error) {
        console.error('AI insights error:', error)
        return NextResponse.json(
            { error: 'Failed to generate insights' },
            { status: 500 }
        )
    }
}
