/**
 * Velodesk AI Module
 * AI-powered insights using Google Gemini or OpenAI
 */

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

export interface AICopilotMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

// Provider detection
export function getAIProvider(): 'gemini' | 'openai' | null {
    if (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        return 'gemini'
    }
    if (process.env.OPENAI_API_KEY) {
        return 'openai'
    }
    return null
}

// Generate PMF insights using AI
export async function generatePMFInsights(
    request: AIInsightRequest
): Promise<AIInsightResponse> {
    const provider = getAIProvider()

    if (!provider) {
        return generateFallbackInsights(request)
    }

    const prompt = buildInsightPrompt(request)

    try {
        if (provider === 'gemini') {
            return await callGemini(prompt)
        } else {
            return await callOpenAI(prompt)
        }
    } catch (error) {
        console.error('AI insight generation failed:', error)
        return generateFallbackInsights(request)
    }
}

// Gemini API call
async function callGemini(prompt: string): Promise<AIInsightResponse> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        }
    )

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return parseAIResponse(text)
}

// OpenAI API call
async function callOpenAI(prompt: string): Promise<AIInsightResponse> {
    const apiKey = process.env.OPENAI_API_KEY

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a startup advisor specializing in product-market fit analysis. Provide actionable, data-driven insights.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1024,
        }),
    })

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

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
- Retention Rate: ${breakdown.retention || 'N/A'}/100
- Revenue Growth: ${breakdown.revenueGrowth || 'N/A'}/100
- NPS Score: ${breakdown.nps || 'N/A'}/100
- Engagement: ${breakdown.engagement || 'N/A'}/100
- Time-to-Value: ${breakdown.timeToValue || 'N/A'}/100
- Expansion Revenue: ${breakdown.expansion || 'N/A'}/100
- Referral Rate: ${breakdown.referral || 'N/A'}/100

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

// AI Copilot for chat-based assistance
export async function chatWithCopilot(
    messages: AICopilotMessage[],
    context?: { pmfScore?: number; companyName?: string }
): Promise<string> {
    const provider = getAIProvider()

    if (!provider) {
        return "AI Copilot is not configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to your environment variables."
    }

    const systemMessage = `You are Velodesk AI Copilot, an expert startup advisor helping founders achieve product-market fit. 
${context?.companyName ? `You're advising ${context.companyName}.` : ''}
${context?.pmfScore ? `Their current PMF score is ${context.pmfScore}/100.` : ''}
Be concise, actionable, and data-driven in your responses.`

    try {
        if (provider === 'gemini') {
            const prompt = `${systemMessage}\n\nConversation:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
            const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
                    }),
                }
            )

            const data = await response.json()
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, I could not generate a response.'
        } else {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemMessage },
                        ...messages,
                    ],
                    temperature: 0.8,
                    max_tokens: 512,
                }),
            })

            const data = await response.json()
            return data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.'
        }
    } catch (error) {
        console.error('Copilot error:', error)
        return 'I encountered an error. Please try again.'
    }
}
