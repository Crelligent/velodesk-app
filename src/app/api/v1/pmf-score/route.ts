import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateAPIKey, logAPIUsage, checkRateLimit } from '@/lib/api-keys'

// GET /api/v1/pmf-score - Get current PMF score
// POST /api/v1/pmf-score - Calculate new PMF score

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
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': String(validation.apiKey.rate_limit),
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
                }
            }
        )
    }

    // Check scopes
    if (!validation.apiKey.scopes.includes('read')) {
        return NextResponse.json(
            { error: 'Insufficient permissions. Required scope: read' },
            { status: 403 }
        )
    }

    try {
        const supabase = await createClient()

        // Get latest PMF score
        const { data: score, error } = await supabase
            .from('pmf_scores')
            .select('*')
            .eq('user_id', validation.apiKey.user_id)
            .order('calculated_at', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            const responseTime = Date.now() - startTime
            await logAPIUsage(validation.apiKey.id, '/api/v1/pmf-score', 'GET', 404, responseTime)

            return NextResponse.json(
                { error: 'No PMF score found' },
                {
                    status: 404,
                    headers: {
                        'X-RateLimit-Limit': String(validation.apiKey.rate_limit),
                        'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
                    }
                }
            )
        }

        const responseTime = Date.now() - startTime
        await logAPIUsage(validation.apiKey.id, '/api/v1/pmf-score', 'GET', 200, responseTime)

        return NextResponse.json({
            success: true,
            data: {
                score: score.score,
                breakdown: score.breakdown,
                insights: score.insights,
                calculated_at: score.calculated_at,
            },
        }, {
            headers: {
                'X-RateLimit-Limit': String(validation.apiKey.rate_limit),
                'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
            }
        })

    } catch (error) {
        const responseTime = Date.now() - startTime
        await logAPIUsage(validation.apiKey.id, '/api/v1/pmf-score', 'GET', 500, responseTime)

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
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
            { error: 'Rate limit exceeded' },
            { status: 429 }
        )
    }

    // Check scopes
    if (!validation.apiKey.scopes.includes('write')) {
        return NextResponse.json(
            { error: 'Insufficient permissions. Required scope: write' },
            { status: 403 }
        )
    }

    try {
        const body = await request.json()
        const { metrics } = body

        if (!metrics) {
            return NextResponse.json(
                { error: 'Missing required field: metrics' },
                { status: 400 }
            )
        }

        // Calculate PMF score from metrics
        const weights = {
            retention: 0.25,
            growth: 0.20,
            engagement: 0.20,
            revenue: 0.20,
            satisfaction: 0.15,
        }

        const breakdown = {
            retention: Math.min(100, Math.max(0, metrics.retention || 0)),
            growth: Math.min(100, Math.max(0, metrics.growth || 0)),
            engagement: Math.min(100, Math.max(0, metrics.engagement || 0)),
            revenue: Math.min(100, Math.max(0, metrics.revenue || 0)),
            satisfaction: Math.min(100, Math.max(0, metrics.satisfaction || 0)),
        }

        const score = Math.round(
            breakdown.retention * weights.retention +
            breakdown.growth * weights.growth +
            breakdown.engagement * weights.engagement +
            breakdown.revenue * weights.revenue +
            breakdown.satisfaction * weights.satisfaction
        )

        const supabase = await createClient()

        // Save score
        const { data: newScore, error } = await supabase
            .from('pmf_scores')
            .insert({
                user_id: validation.apiKey.user_id,
                score,
                breakdown,
            })
            .select()
            .single()

        if (error) {
            const responseTime = Date.now() - startTime
            await logAPIUsage(validation.apiKey.id, '/api/v1/pmf-score', 'POST', 500, responseTime)

            return NextResponse.json(
                { error: 'Failed to save PMF score' },
                { status: 500 }
            )
        }

        const responseTime = Date.now() - startTime
        await logAPIUsage(validation.apiKey.id, '/api/v1/pmf-score', 'POST', 201, responseTime)

        return NextResponse.json({
            success: true,
            data: {
                id: newScore.id,
                score: newScore.score,
                breakdown: newScore.breakdown,
                calculated_at: newScore.calculated_at,
            },
        }, { status: 201 })

    } catch (error) {
        const responseTime = Date.now() - startTime
        await logAPIUsage(validation.apiKey.id, '/api/v1/pmf-score', 'POST', 500, responseTime)

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
