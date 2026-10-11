import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAIConfigured, runVelodeskAgent, type ChatMessage } from '@/lib/velodesk-ai/agent'

// Tool calls + model time can take a while
export const maxDuration = 60

const MAX_MESSAGES = 20
const MAX_CHARS = 4000

function dailyLimit() {
    const n = Number(process.env.AI_DAILY_MESSAGE_LIMIT)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 40
}

function cleanMessages(raw: unknown): ChatMessage[] | null {
    if (!Array.isArray(raw)) return null
    const msgs = raw
        .filter((m): m is ChatMessage =>
            !!m && typeof m === 'object' &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' && m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
        .slice(-MAX_MESSAGES)
    // The conversation must start with the user and end with a new user message
    while (msgs.length && msgs[0].role !== 'user') msgs.shift()
    if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return null
    return msgs
}

/** POST /api/ai/copilot  { messages: [{ role, content }] } -> { message, steps, sources } */
export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

    if (!isAIConfigured()) {
        return NextResponse.json(
            { error: 'Velodesk AI is not switched on yet.', code: 'not_configured' },
            { status: 503 }
        )
    }

    const body = await request.json().catch(() => null)
    const messages = cleanMessages(body?.messages)
    if (!messages) return NextResponse.json({ error: 'Please type a question.' }, { status: 400 })

    // Daily limit per user (usage log is service-role only)
    const admin = createAdminClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await admin
        .from('ai_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', since)
    if (countError) console.error('[velodesk-ai] usage count failed', countError)
    const limit = dailyLimit()
    if ((count ?? 0) >= limit) {
        return NextResponse.json(
            { error: `You've reached today's limit of ${limit} questions. It resets within 24 hours.`, code: 'rate_limited' },
            { status: 429 }
        )
    }

    const { data: profile } = await supabase.from('profiles').select('company_name').eq('id', user.id).maybeSingle()

    try {
        const reply = await runVelodeskAgent({
            supabase,
            userId: user.id,
            companyName: profile?.company_name,
            messages,
        })

        const { error: logError } = await admin.from('ai_usage').insert({
            user_id: user.id,
            model: reply.model,
            input_tokens: reply.usage.inputTokens,
            output_tokens: reply.usage.outputTokens,
            tool_calls: reply.steps.length,
        })
        if (logError) console.error('[velodesk-ai] usage log failed', logError)

        return NextResponse.json({ message: reply.text, steps: reply.steps, sources: reply.sources })
    } catch (error) {
        console.error('[velodesk-ai] request failed', error)
        const status = (error as { status?: number })?.status
        const busy = status === 429 || status === 529
        return NextResponse.json(
            { error: busy ? 'Velodesk AI is busy right now. Please try again in a minute.' : 'Velodesk AI hit a problem. Please try again.' },
            { status: busy ? 503 : 500 }
        )
    }
}

/** GET /api/ai/copilot -> { configured } so the chat can say upfront whether AI is on. */
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
    return NextResponse.json({ configured: isAIConfigured() })
}
