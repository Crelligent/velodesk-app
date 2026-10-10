import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
    BASIS_LABELS,
    calculateAndSavePmfScore,
    getScoreLabel,
    METRIC_KEYS,
    type MetricData,
} from '@/lib/pmf-score'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get optional manual input (self-reported; never overrides synced data)
        const body = await request.json().catch(() => ({}))
        const manualMetrics: MetricData = body.metrics || {}

        // Service role: reads secret tokens and writes the score, scoped to the session user
        const result = await calculateAndSavePmfScore(createAdminClient(), user.id, manualMetrics)
        return NextResponse.json(result)
    } catch (error) {
        console.error('PMF calculation error:', error)
        return NextResponse.json(
            { error: 'Failed to calculate PMF score' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get latest PMF score
        const { data: latestScore, error } = await supabase
            .from('pmf_scores')
            .select('*')
            .eq('user_id', user.id)
            .order('calculated_at', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching PMF score:', error)
            return NextResponse.json({ error: 'Failed to fetch score' }, { status: 500 })
        }

        if (!latestScore) {
            return NextResponse.json({ score: null, message: 'No PMF score calculated yet' })
        }

        return NextResponse.json({
            id: latestScore.id,
            score: latestScore.score,
            scoreLabel: getScoreLabel(latestScore.score),
            breakdown: latestScore.breakdown,
            insights: latestScore.insights,
            calculatedAt: latestScore.calculated_at,
            // Added fields; null for scores saved before inputs were tracked
            inputsUsed: latestScore.inputs?.inputsUsed ?? null,
            missing: latestScore.inputs?.missing ?? null,
            signalsUsed: latestScore.inputs?.inputsUsed?.length ?? null,
            signalsTotal: METRIC_KEYS.length,
            sources: latestScore.inputs?.sources ?? null,
            revenue: latestScore.inputs?.revenue ?? null,
            selfReported: latestScore.inputs?.selfReported ?? null,
            basis: latestScore.inputs?.basis ?? null,
            basisLabel: latestScore.inputs?.basis
                ? BASIS_LABELS[latestScore.inputs.basis as keyof typeof BASIS_LABELS] ?? null
                : null,
        })
    } catch (error) {
        console.error('PMF fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch PMF score' },
            { status: 500 }
        )
    }
}
