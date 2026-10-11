/**
 * Velodesk AI: read-only tools the agent can call to look up the signed-in user's own data.
 *
 * Every query runs through the USER-SCOPED Supabase client, so row-level security limits
 * results to that user. No tool writes anything, and no tool can see credentials.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { INTEGRATIONS } from '@/lib/integrations'
import { getScoreLabel } from '@/lib/pmf-score'

export const SIGNAL_LABELS: Record<string, string> = {
    retention: 'Retention',
    revenueGrowth: 'Revenue growth',
    nps: 'Customer satisfaction (NPS)',
    engagement: 'Engagement',
    timeToValue: 'Time to value',
    expansion: 'Expansion',
    referral: 'Referral',
}

const WEIGHTS: Record<string, number> = {
    retention: 25,
    revenueGrowth: 20,
    nps: 15,
    engagement: 15,
    timeToValue: 10,
    expansion: 10,
    referral: 5,
}

const providerName = (id: string | null | undefined) => {
    if (!id) return null
    if (id === 'self_reported') return 'Self-reported'
    return INTEGRATIONS.find((i) => i.id === id)?.name ?? id
}

type Breakdown = Record<string, { score: number | null; source?: string | null; selfReported?: boolean } | number | null>

function signalRows(breakdown: Breakdown | null) {
    return Object.keys(SIGNAL_LABELS).map((key) => {
        const raw = breakdown?.[key]
        const score = typeof raw === 'number' ? raw : raw && typeof raw === 'object' ? raw.score : null
        const source = raw && typeof raw === 'object' ? providerName(raw.source) : null
        const selfReported = raw && typeof raw === 'object' ? Boolean(raw.selfReported) : false
        return {
            signal: SIGNAL_LABELS[key],
            weightPercent: WEIGHTS[key],
            score: typeof score === 'number' ? Math.round(score) : null,
            status: typeof score === 'number' ? 'measured' : 'no data (excluded from the score)',
            source,
            selfReported,
        }
    })
}

// ---------------------------------------------------------------------------
// Tool definitions (Anthropic tool-use format)
// ---------------------------------------------------------------------------

export const TOOL_DEFINITIONS = [
    {
        name: 'get_current_score',
        description:
            "Get the user's latest PMF Score: the score (0-100), its band, when it was calculated, each of the seven signals with its score, weight and data source, which signals have no data, whether any input is self-reported, revenue (MRR) if a payment tool is connected, and which connected tools failed to sync on the last run.",
        input_schema: { type: 'object' as const, properties: {}, required: [] as string[] },
    },
    {
        name: 'get_score_history',
        description:
            "Get the user's past PMF Scores, newest first, each with its date and per-signal scores. Use it to explain how and why the score changed over time.",
        input_schema: {
            type: 'object' as const,
            properties: {
                limit: { type: 'integer', description: 'How many past scores to return (1-30). Default 10.', minimum: 1, maximum: 30 },
            },
            required: [] as string[],
        },
    },
    {
        name: 'list_data_sources',
        description:
            "List the tools the user has connected (status and when connected), which signals each one feeds, and which supported tools are not connected yet, grouped by the signals they would add.",
        input_schema: { type: 'object' as const, properties: {}, required: [] as string[] },
    },
    {
        name: 'list_experiments',
        description: "List the user's experiments: name, hypothesis, status, target metric, dates and result.",
        input_schema: { type: 'object' as const, properties: {}, required: [] as string[] },
    },
    {
        name: 'get_scoring_method',
        description:
            'Explain how Velodesk calculates the PMF Score: the seven signals and their weights, how missing signals are handled, and the score bands.',
        input_schema: { type: 'object' as const, properties: {}, required: [] as string[] },
    },
]

/** Short, human-readable description of each tool call, shown in the chat as a step. */
export const TOOL_STEP_LABELS: Record<string, string> = {
    get_current_score: 'Checked your current PMF Score',
    get_score_history: 'Checked your PMF Score history',
    list_data_sources: 'Checked your connected tools',
    list_experiments: 'Checked your experiments',
    get_scoring_method: 'Checked how the score is calculated',
}

/** What each tool counts as a "source" for the answer. */
export const TOOL_SOURCE_LABELS: Record<string, string> = {
    get_current_score: 'Current PMF Score',
    get_score_history: 'PMF Score history',
    list_data_sources: 'Connected tools',
    list_experiments: 'Experiments',
    get_scoring_method: 'Velodesk scoring method',
}

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

export interface ToolResult {
    data: unknown
    /** Extra source names found in the data (e.g. "Paystack"), shown as citations. */
    sources: string[]
}

export async function runTool(
    supabase: SupabaseClient,
    userId: string,
    name: string,
    input: Record<string, unknown>
): Promise<ToolResult> {
    switch (name) {
        case 'get_current_score': {
            const { data, error } = await supabase
                .from('pmf_scores')
                .select('score, breakdown, inputs, calculated_at')
                .eq('user_id', userId)
                .order('calculated_at', { ascending: false })
                .limit(1)
                .maybeSingle()
            if (error) throw error
            if (!data) {
                return {
                    data: { hasScore: false, note: 'No PMF Score yet. The user needs to connect a data source, then the score is calculated after the first sync.' },
                    sources: [],
                }
            }
            const signals = signalRows(data.breakdown as Breakdown)
            const inputs = (data.inputs ?? {}) as {
                basis?: string
                revenue?: { mrr: number; currency: string; bySource?: Array<{ source: string; currency: string; mrr: number }> } | null
                sourceErrors?: Record<string, string>
            }
            const used = signals.filter((s) => s.score !== null)
            return {
                data: {
                    hasScore: true,
                    score: Math.round(data.score),
                    band: getScoreLabel(data.score),
                    calculatedAt: data.calculated_at,
                    signalsUsed: used.length,
                    signalsTotal: signals.length,
                    signals,
                    basis: inputs.basis ?? 'measured',
                    revenue: inputs.revenue
                        ? {
                            mrr: inputs.revenue.mrr,
                            currency: inputs.revenue.currency,
                            bySource: (inputs.revenue.bySource ?? []).map((s) => ({ ...s, source: providerName(s.source) })),
                        }
                        : null,
                    toolsThatFailedLastSync: Object.keys(inputs.sourceErrors ?? {}).map(providerName),
                },
                sources: [...new Set(used.map((s) => s.source).filter((s): s is string => Boolean(s)))],
            }
        }

        case 'get_score_history': {
            const limit = Math.min(30, Math.max(1, Number(input.limit) || 10))
            const { data, error } = await supabase
                .from('pmf_scores')
                .select('score, breakdown, calculated_at')
                .eq('user_id', userId)
                .order('calculated_at', { ascending: false })
                .limit(limit)
            if (error) throw error
            const rows = (data ?? []).map((r) => ({
                calculatedAt: r.calculated_at,
                score: Math.round(r.score),
                band: getScoreLabel(r.score),
                signals: Object.fromEntries(signalRows(r.breakdown as Breakdown).map((s) => [s.signal, s.score])),
            }))
            return { data: { count: rows.length, scores: rows }, sources: [] }
        }

        case 'list_data_sources': {
            const { data, error } = await supabase
                .from('integration_tokens')
                .select('provider, status, created_at, updated_at')
                .eq('user_id', userId)
            if (error) throw error
            const connected = (data ?? []).map((t) => {
                const meta = INTEGRATIONS.find((i) => i.id === t.provider)
                return {
                    tool: meta?.name ?? t.provider,
                    category: meta?.category ?? null,
                    status: t.status,
                    connectedAt: t.created_at,
                    lastUpdated: t.updated_at,
                    feedsSignals: meta?.signals ?? [],
                    countsTowardScore: meta?.feedsScore ?? false,
                }
            })
            const connectedIds = new Set((data ?? []).map((t) => t.provider))
            const notConnected = INTEGRATIONS.filter((i) => i.syncSupported && !connectedIds.has(i.id)).map((i) => ({
                tool: i.name,
                category: i.category,
                wouldAddSignals: i.signals ?? [],
            }))
            return {
                data: { connected, availableButNotConnected: notConnected },
                sources: connected.filter((c) => c.status === 'connected').map((c) => c.tool),
            }
        }

        case 'list_experiments': {
            const { data, error } = await supabase
                .from('experiments')
                .select('name, hypothesis, status, target_metric, start_date, end_date, control_value, test_value, confidence, result, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20)
            if (error) throw error
            return { data: { count: data?.length ?? 0, experiments: data ?? [] }, sources: [] }
        }

        case 'get_scoring_method':
            return {
                data: {
                    signals: Object.entries(WEIGHTS).map(([k, w]) => ({ signal: SIGNAL_LABELS[k], weightPercent: w })),
                    missingSignals:
                        'A signal with no connected data is left out, never guessed. The score is calculated from the remaining signals and rescaled to 0-100.',
                    selfReported: 'Numbers typed in by the user, or from founder-run surveys, are labelled self-reported.',
                    bands: [
                        { range: '80-100', label: 'Strong PMF' },
                        { range: '60-79', label: 'Emerging PMF' },
                        { range: '40-59', label: 'Searching' },
                        { range: '0-39', label: 'Pre-PMF' },
                    ],
                },
                sources: [],
            }

        default:
            throw new Error(`Unknown tool: ${name}`)
    }
}
