/**
 * Velodesk AI: structured PMF insights (summary, risks, next steps) from a score.
 * Uses Claude via the Anthropic API when ANTHROPIC_API_KEY is set, otherwise a
 * rule-based fallback. The chat assistant lives in src/lib/velodesk-ai/.
 */
import Anthropic from '@anthropic-ai/sdk'
import { DEFAULT_MODEL, isAIConfigured } from '@/lib/velodesk-ai/agent'

// Types
export interface AIInsightRequest {
    pmfScore: number
    breakdown: {
        retention?: number
        revenueGrowth?: number
        nps?: number
        engagement?: number
        timeToValue?: number
        expansion?: number
        referral?: number
    }
    companyName?: string
    industry?: string
    context?: string
}

export interface AIInsightResponse {
    summary: string
    insights: string[]
    recommendations: string[]
    risks: string[]
    nextSteps: string[]
}


// Generate PMF insights using AI
export async function generatePMFInsights(
    request: AIInsightRequest
): Promise<AIInsightResponse> {
    if (!isAIConfigured()) {
        return generateFallbackInsights(request)
    }

    const prompt = buildInsightPrompt(request)

    try {
        return await callClaude(prompt)
    } catch (error) {
        console.error('AI insight generation failed:', error)
        return generateFallbackInsights(request)
    }
}

// Claude (Anthropic API) call
async function callClaude(prompt: string): Promise<AIInsightResponse> {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const res = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL,
        max_tokens: 1024,
        system: 'You are Velodesk AI, a product-market fit analyst for startups. Base every point only on the metrics given; treat "no data" as unknown and never estimate it. Reply with JSON only.',
        messages: [{ role: 'user', content: prompt }],
    })
    const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
    return parseAIResponse(text)
}

// Build the insight prompt
function buildInsightPrompt(request: AIInsightRequest): string {
    const { pmfScore, breakdown, companyName, industry } = request

    return `Analyze this Product-Market Fit data and provide strategic insights:

Company: ${companyName || 'Startup'}
Industry: ${industry || 'Technology'}
Overall PMF Score: ${pmfScore}/100

Metric Breakdown:
- Retention Rate: ${breakdown.retention ?? 'no data'}${breakdown.retention != null ? '/100' : ''}
- Revenue Growth: ${breakdown.revenueGrowth ?? 'no data'}${breakdown.revenueGrowth != null ? '/100' : ''}
- NPS Score: ${breakdown.nps ?? 'no data'}${breakdown.nps != null ? '/100' : ''}
- Engagement: ${breakdown.engagement ?? 'no data'}${breakdown.engagement != null ? '/100' : ''}
- Time-to-Value: ${breakdown.timeToValue ?? 'no data'}${breakdown.timeToValue != null ? '/100' : ''}
- Expansion Revenue: ${breakdown.expansion ?? 'no data'}${breakdown.expansion != null ? '/100' : ''}
- Referral Rate: ${breakdown.referral ?? 'no data'}${breakdown.referral != null ? '/100' : ''}

Please provide your analysis in the following JSON format:
{
  "summary": "2-3 sentence executive summary",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "risks": ["risk 1", "risk 2"],
  "nextSteps": ["step 1", "step 2", "step 3"]
}

Focus on actionable, specific advice based on the metrics provided.`
}

// Parse AI response into structured format
function parseAIResponse(text: string): AIInsightResponse {
    try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            return {
                summary: parsed.summary || '',
                insights: parsed.insights || [],
                recommendations: parsed.recommendations || [],
                risks: parsed.risks || [],
                nextSteps: parsed.nextSteps || [],
            }
        }
    } catch {
        // Fall back to text parsing
    }

    // Simple text parsing fallback
    const lines = text.split('\n').filter(l => l.trim())
    return {
        summary: lines[0] || 'AI analysis completed.',
        insights: lines.slice(1, 4),
        recommendations: lines.slice(4, 7),
        risks: lines.slice(7, 9),
        nextSteps: lines.slice(9, 12),
    }
}

// Fallback insights when AI is not available
function generateFallbackInsights(request: AIInsightRequest): AIInsightResponse {
    const { pmfScore, breakdown } = request

    const summary = pmfScore >= 70
        ? 'Strong product-market fit indicators suggest readiness for growth investment.'
        : pmfScore >= 50
            ? 'Emerging PMF signals indicate potential - focus on strengthening weak areas.'
            : 'Early-stage metrics suggest continued iteration on product-solution fit is needed.'

    const insights: string[] = []
    const recommendations: string[] = []
    const risks: string[] = []

    // Analyze each metric
    if (breakdown.retention && breakdown.retention >= 70) {
        insights.push('Strong retention indicates users find ongoing value in your product.')
    } else if (breakdown.retention && breakdown.retention < 50) {
        insights.push('Retention needs improvement - users may not be finding sustained value.')
        recommendations.push('Implement onboarding improvements and engagement features.')
    }

    if (breakdown.revenueGrowth && breakdown.revenueGrowth >= 70) {
        insights.push('Revenue growth is healthy - monetization strategy is working.')
    } else if (breakdown.revenueGrowth && breakdown.revenueGrowth < 50) {
        risks.push('Revenue growth is below target - consider pricing or expansion strategies.')
    }

    if (breakdown.nps && breakdown.nps >= 60) {
        insights.push('High NPS suggests strong customer satisfaction and word-of-mouth potential.')
    }

    if (breakdown.referral && breakdown.referral < 40) {
        recommendations.push('Implement a referral program to boost organic growth.')
    }

    return {
        summary,
        insights: insights.length > 0 ? insights : ['Analysis based on current metrics.'],
        recommendations: recommendations.length > 0 ? recommendations : ['Continue monitoring key metrics.'],
        risks: risks.length > 0 ? risks : ['No critical risks identified at this time.'],
        nextSteps: [
            'Review metric trends over the next 30 days.',
            'Focus on improving the weakest metric area.',
            'Schedule monthly PMF score reviews.',
        ],
    }
}

