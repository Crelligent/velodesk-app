import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateAPIKey, logAPIUsage, checkRateLimit } from '@/lib/api-keys'

// GET /api/v1/metrics - Get user metrics
export async function GET(request: Request) {
    const startTime = Date.now()

    // Get API key from header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Missing or invalid Authorization header' },
            { status: 401 }
        )
    }

    const apiKey = authHeader.replace('Bearer ', '')

    // Validate API key
    const validation = await validateAPIKey(apiKey)
    if (!validation.valid || !validation.apiKey) {
        return NextResponse.json(
            { error: validation.error || 'Invalid API key' },
            { status: 401 }
        )
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(validation.apiKey.id, validation.apiKey.rate_limit)
    if (!rateLimit.allowed) {
        return NextResponse.json(
            {
                error: 'Rate limit exceeded',
                retry_after: rateLimit.resetAt.toISOString(),
            },
            { status: 429 }
        )
    }

    // Check scopes
    if (!validation.apiKey.scopes.includes('read')) {
        return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
        )
    }

    try {
        const supabase = await createClient()

        // Get PMF scores history
        const { data: scores } = await supabase
            .from('pmf_scores')
            .select('*')
            .eq('user_id', validation.apiKey.user_id)
            .order('calculated_at', { ascending: false })
            .limit(30)

        // Get experiments
        const { data: experiments } = await supabase
            .from('experiments')
            .select('*')
            .eq('user_id', validation.apiKey.user_id)
            .order('created_at', { ascending: false })
            .limit(10)

        // Get subscription
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', validation.apiKey.user_id)
            .single()

        const responseTime = Date.now() - startTime
        await logAPIUsage(validation.apiKey.id, '/api/v1/metrics', 'GET', 200, responseTime)

        return NextResponse.json({
            success: true,
            data: {
                pmf_scores: scores?.map(s => ({
                    score: s.score,
                    breakdown: s.breakdown,
                    calculated_at: s.calculated_at,
                })) || [],
                experiments: experiments?.map(e => ({
                    id: e.id,
                    name: e.name,
                    status: e.status,
                    created_at: e.created_at,
                })) || [],
                subscription: subscription ? {
                    plan: subscription.plan,
                    status: subscription.status,
                } : null,
            },
        }, {
            headers: {
                'X-RateLimit-Limit': String(validation.apiKey.rate_limit),
                'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
            }
        })

    } catch (error) {
        const responseTime = Date.now() - startTime
        await logAPIUsage(validation.apiKey.id, '/api/v1/metrics', 'GET', 500, responseTime)

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
