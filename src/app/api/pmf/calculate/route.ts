import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPaystackMetrics } from '@/lib/integrations/paystack'
import { getMixpanelMetrics } from '@/lib/integrations/mixpanel'
import { getAmplitudeMetrics } from '@/lib/integrations/amplitude'
import { getHubSpotMetrics } from '@/lib/integrations/hubspot'
import { getGoogleAnalyticsMetrics } from '@/lib/integrations/google-analytics'

// PMF Score weights (from strategy)
const WEIGHTS = {
    retention: 0.25,
    revenueGrowth: 0.20,
    nps: 0.15,
    engagement: 0.15,
    timeToValue: 0.10,
    expansion: 0.10,
    referral: 0.05,
}

interface MetricData {
    retention?: number
    revenueGrowth?: number
    nps?: number
    engagement?: number
    timeToValue?: number
    expansion?: number
    referral?: number
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get optional manual input
        const body = await request.json().catch(() => ({}))
        const manualMetrics: MetricData = body.metrics || {}

        // Fetch data from connected integrations
        const integratedMetrics = await fetchIntegratedMetrics(user.id, supabase)

        // Merge manual and integrated metrics (manual takes precedence)
        const metrics: MetricData = {
            retention: manualMetrics.retention ?? integratedMetrics.retention ?? 50,
            revenueGrowth: manualMetrics.revenueGrowth ?? integratedMetrics.revenueGrowth ?? 50,
            nps: manualMetrics.nps ?? integratedMetrics.nps ?? 50,
            engagement: manualMetrics.engagement ?? integratedMetrics.engagement ?? 50,
            timeToValue: manualMetrics.timeToValue ?? integratedMetrics.timeToValue ?? 50,
            expansion: manualMetrics.expansion ?? integratedMetrics.expansion ?? 50,
            referral: manualMetrics.referral ?? integratedMetrics.referral ?? 50,
        }

        // Calculate weighted PMF score
        const score = calculatePMFScore(metrics)
        const scoreLabel = getScoreLabel(score)

        // Generate AI insights
        const insights = generateInsights(metrics, score)

        // Build breakdown object
        const breakdown = {
            retention: { score: metrics.retention!, weight: WEIGHTS.retention },
            revenueGrowth: { score: metrics.revenueGrowth!, weight: WEIGHTS.revenueGrowth },
            nps: { score: metrics.nps!, weight: WEIGHTS.nps },
            engagement: { score: metrics.engagement!, weight: WEIGHTS.engagement },
            timeToValue: { score: metrics.timeToValue!, weight: WEIGHTS.timeToValue },
            expansion: { score: metrics.expansion!, weight: WEIGHTS.expansion },
            referral: { score: metrics.referral!, weight: WEIGHTS.referral },
        }

        // Save to database
        const { data: savedScore, error } = await supabase
            .from('pmf_scores')
            .insert({
                user_id: user.id,
                score,
                breakdown,
                insights,
                calculated_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving PMF score:', error)
            return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
        }

        return NextResponse.json({
            id: savedScore.id,
            score,
            scoreLabel,
            breakdown,
            insights,
            calculatedAt: savedScore.calculated_at,
        })
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
        })
    } catch (error) {
        console.error('PMF fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch PMF score' },
            { status: 500 }
        )
    }
}

function calculatePMFScore(metrics: MetricData): number {
    const score =
        (metrics.retention || 0) * WEIGHTS.retention +
        (metrics.revenueGrowth || 0) * WEIGHTS.revenueGrowth +
        (metrics.nps || 0) * WEIGHTS.nps +
        (metrics.engagement || 0) * WEIGHTS.engagement +
        (metrics.timeToValue || 0) * WEIGHTS.timeToValue +
        (metrics.expansion || 0) * WEIGHTS.expansion +
        (metrics.referral || 0) * WEIGHTS.referral

    return Math.round(Math.min(100, Math.max(0, score)))
}

function getScoreLabel(score: number): string {
    if (score >= 80) return 'Strong PMF'
    if (score >= 60) return 'Emerging PMF'
    if (score >= 40) return 'Searching'
    return 'Pre-PMF'
}

function generateInsights(metrics: MetricData, score: number): string[] {
    const insights: string[] = []

    // Find strongest metric
    const metricScores = Object.entries(metrics) as [keyof MetricData, number][]
    const sorted = metricScores.sort((a, b) => (b[1] || 0) - (a[1] || 0))
    const strongest = sorted[0]
    const weakest = sorted[sorted.length - 1]

    if (strongest && strongest[1] >= 70) {
        insights.push(`Strong ${formatMetricName(strongest[0])} (${strongest[1]}) is driving your PMF score`)
    }

    if (weakest && weakest[1] < 50) {
        insights.push(`Focus on improving ${formatMetricName(weakest[0])} (${weakest[1]}) for the biggest impact`)
    }

    // Score-specific insights
    if (score >= 80) {
        insights.push('Your PMF metrics indicate you\'re ready for aggressive growth investment')
    } else if (score >= 60) {
        insights.push('Emerging PMF suggests continued iteration before major scaling')
    } else if (score >= 40) {
        insights.push('Focus on finding repeatable customer segments before expanding')
    } else {
        insights.push('Prioritize customer discovery and problem-solution fit')
    }

    // Retention-specific
    if (metrics.retention && metrics.retention >= 75) {
        insights.push('High retention indicates strong product value delivery')
    }

    // Growth-specific
    if (metrics.revenueGrowth && metrics.revenueGrowth >= 70) {
        insights.push('Strong revenue growth momentum - consider expansion opportunities')
    }

    return insights.slice(0, 4)
}

function formatMetricName(key: string): string {
    const names: Record<string, string> = {
        retention: 'Retention Rate',
        revenueGrowth: 'Revenue Growth',
        nps: 'NPS Score',
        engagement: 'Engagement',
        timeToValue: 'Time-to-Value',
        expansion: 'Expansion Revenue',
        referral: 'Referral Rate',
    }
    return names[key] || key
}

async function fetchIntegratedMetrics(userId: string, supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never): Promise<Partial<MetricData>> {
    const metrics: Partial<MetricData> = {}

    // Get connected integrations
    const { data: integrations, error } = await supabase
        .from('integration_tokens')
        .select('provider, access_token')
        .eq('user_id', userId)
        .eq('status', 'connected')

    if (error || !integrations || integrations.length === 0) {
        return metrics
    }

    // Process Paystack
    const paystackInt = integrations.find(i => i.provider === 'paystack')
    if (paystackInt && paystackInt.access_token) {
        const paystackMetrics = await getPaystackMetrics(paystackInt.access_token)
        if (paystackMetrics) {
            // Rough conversion logic for MVP: scale MRR relative to a target to get a 0-100 score
            // E.g., if target is $10k MRR, $10k = 100 score. (Using a dynamic baseline later)
            // For now, let's just map it directly if MRR > 0
            const mrrScore = paystackMetrics.mrr > 0 ? Math.min(100, (paystackMetrics.mrr / 5000) * 100) : 0
            
            // Churn is inverse: 0% churn = 100 score. 10% churn = 0 score.
            const churnScore = Math.max(0, 100 - (paystackMetrics.churnRate * 10))

            metrics.revenueGrowth = mrrScore
            metrics.retention = churnScore
        }
    }

    // Process Mixpanel
    const mixpanelInt = integrations.find(i => i.provider === 'mixpanel')
    if (mixpanelInt && mixpanelInt.access_token) {
        const mixpanelMetrics = await getMixpanelMetrics(mixpanelInt.access_token)
        if (mixpanelMetrics) {
            metrics.retention = mixpanelMetrics.retentionRate;
            metrics.engagement = mixpanelMetrics.engagementScore;
        }
    }

    // Process Amplitude
    const amplitudeInt = integrations.find(i => i.provider === 'amplitude')
    if (amplitudeInt && amplitudeInt.access_token) {
        const amplitudeMetrics = await getAmplitudeMetrics(amplitudeInt.access_token)
        if (amplitudeMetrics) {
            // Amplitude overrides Mixpanel if both are present (or we could average them, but override is simpler for MVP)
            metrics.retention = amplitudeMetrics.retentionRate;
            metrics.engagement = amplitudeMetrics.engagementScore;
        }
    }

    // Process HubSpot
    const hubspotInt = integrations.find(i => i.provider === 'hubspot')
    if (hubspotInt && hubspotInt.access_token) {
        const hubspotMetrics = await getHubSpotMetrics(hubspotInt.access_token)
        if (hubspotMetrics) {
            // CRM lead conversion maps strongly to expansion/growth
            metrics.expansion = hubspotMetrics.leadConversionRate * 4; // Arbitrary MVP multiplier to map 0-100 score
            if (metrics.expansion > 100) metrics.expansion = 100;
        }
    }

    // Process Google Analytics
    const gaInt = integrations.find(i => i.provider === 'google-analytics')
    if (gaInt && gaInt.access_token) {
        const gaMetrics = await getGoogleAnalyticsMetrics(gaInt.access_token)
        if (gaMetrics) {
            // High goal conversion boosts referral/expansion signals
            const conversionScore = Math.min(100, gaMetrics.goalConversionRate * 10)
            
            // Low bounce rate means high engagement (100 - bounceRate)
            const trafficEngagement = Math.max(0, 100 - gaMetrics.bounceRate)

            // If we don't have Mixpanel/Amplitude, fallback to GA for engagement
            if (!metrics.engagement) {
                metrics.engagement = trafficEngagement
            }
            
            metrics.referral = conversionScore
        }
    }

    return metrics
}
