/**
 * Velodesk Reports Module
 * PMF Report generation and sharing
 */

import { createClient } from '@/lib/supabase/client'

// =================== TYPES ===================

export interface PMFBreakdown {
    retention: { score: number; value?: number; trend?: string }
    revenueGrowth: { score: number; value?: number; trend?: string }
    nps: { score: number; value?: number; trend?: string }
    engagement: { score: number; value?: number; trend?: string }
    timeToValue: { score: number; value?: number; trend?: string }
    expansion: { score: number; value?: number; trend?: string }
    referral: { score: number; value?: number; trend?: string }
}

export interface PMFReport {
    id: string
    userId: string
    score: number
    scoreLabel: string
    companyName: string
    tagline?: string
    companyLogo?: string
    breakdown: PMFBreakdown
    aiSummary?: string
    aiInsights?: string[]
    benchmarkPercentile?: number
    stage?: string
    industry?: string
    shareToken: string
    isPublic: boolean
    viewedCount: number
    createdAt: string
    updatedAt: string
}

export interface ReportGenerateOptions {
    includeAI?: boolean
    isPublic?: boolean
    customTitle?: string
    expiresIn?: number // days
}

// =================== PMF SCORE CALCULATION ===================

const WEIGHTS = {
    retention: 0.25,
    revenueGrowth: 0.20,
    nps: 0.15,
    engagement: 0.15,
    timeToValue: 0.10,
    expansion: 0.10,
    referral: 0.05,
}

export function calculatePMFScore(breakdown: Partial<PMFBreakdown>): number {
    let score = 0

    if (breakdown.retention) score += breakdown.retention.score * WEIGHTS.retention
    if (breakdown.revenueGrowth) score += breakdown.revenueGrowth.score * WEIGHTS.revenueGrowth
    if (breakdown.nps) score += breakdown.nps.score * WEIGHTS.nps
    if (breakdown.engagement) score += breakdown.engagement.score * WEIGHTS.engagement
    if (breakdown.timeToValue) score += breakdown.timeToValue.score * WEIGHTS.timeToValue
    if (breakdown.expansion) score += breakdown.expansion.score * WEIGHTS.expansion
    if (breakdown.referral) score += breakdown.referral.score * WEIGHTS.referral

    return Math.round(score)
}

export function getScoreLabel(score: number): string {
    if (score >= 80) return 'Strong PMF'
    if (score >= 60) return 'Emerging PMF'
    if (score >= 40) return 'Searching'
    return 'Pre-PMF'
}

export function getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#3b82f6'
    if (score >= 40) return '#f59e0b'
    return '#6b7280'
}

// =================== REPORT GENERATION ===================

function generateToken(length = 12): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Generate a new PMF report
 */
export async function generateReport(
    options: ReportGenerateOptions = {}
): Promise<{ report?: PMFReport; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('company_name, industry, team_size')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: 'Profile not found' }

    // Get latest PMF score
    const { data: pmfScore } = await supabase
        .from('pmf_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single()

    // Build breakdown from PMF score or use defaults
    const breakdown: PMFBreakdown = pmfScore?.breakdown || {
        retention: { score: 65 },
        revenueGrowth: { score: 55 },
        nps: { score: 70 },
        engagement: { score: 60 },
        timeToValue: { score: 50 },
        expansion: { score: 45 },
        referral: { score: 40 },
    }

    const score = pmfScore?.score || calculatePMFScore(breakdown)
    const shareToken = generateToken()

    // Generate AI insights if requested
    let aiSummary: string | undefined
    let aiInsights: string[] | undefined

    if (options.includeAI) {
        // In production, call an AI API
        aiSummary = `${profile.company_name} demonstrates ${getScoreLabel(score).toLowerCase()} with a PMF score of ${score}. Key strengths include strong retention metrics and customer satisfaction.`
        aiInsights = [
            'Retention rate is above industry average for your stage',
            'Consider focusing on time-to-value optimization',
            'NPS trending positively over the last 30 days',
            'Revenue expansion could be improved with upsell motions'
        ]
    }

    // Calculate benchmark percentile (mock for now)
    const benchmarkPercentile = Math.min(95, Math.max(20, score + Math.round((Math.random() - 0.5) * 20)))

    const reportData = {
        user_id: user.id,
        score,
        score_label: getScoreLabel(score),
        company_name: options.customTitle || profile.company_name,
        industry: profile.industry,
        stage: profile.team_size,
        breakdown,
        ai_summary: aiSummary,
        ai_insights: aiInsights,
        benchmark_percentile: benchmarkPercentile,
        share_token: shareToken,
        is_public: options.isPublic ?? true,
        viewed_count: 0,
        expires_at: options.expiresIn
            ? new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000).toISOString()
            : null,
    }

    const { data, error } = await supabase
        .from('pmf_reports')
        .insert(reportData)
        .select()
        .single()

    if (error) {
        console.error('Error creating report:', error)
        return { error: error.message }
    }

    return {
        report: {
            id: data.id,
            userId: data.user_id,
            score: data.score,
            scoreLabel: data.score_label,
            companyName: data.company_name,
            breakdown: data.breakdown,
            aiSummary: data.ai_summary,
            aiInsights: data.ai_insights,
            benchmarkPercentile: data.benchmark_percentile,
            stage: data.stage,
            industry: data.industry,
            shareToken: data.share_token,
            isPublic: data.is_public,
            viewedCount: data.viewed_count,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        }
    }
}

/**
 * Get all reports for current user
 */
export async function listReports(): Promise<PMFReport[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('pmf_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching reports:', error)
        return []
    }

    return (data || []).map(r => ({
        id: r.id,
        userId: r.user_id,
        score: r.score,
        scoreLabel: r.score_label,
        companyName: r.company_name,
        breakdown: r.breakdown,
        aiSummary: r.ai_summary,
        aiInsights: r.ai_insights,
        benchmarkPercentile: r.benchmark_percentile,
        stage: r.stage,
        industry: r.industry,
        shareToken: r.share_token,
        isPublic: r.is_public,
        viewedCount: r.viewed_count,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }))
}

/**
 * Update a report
 */
export async function updateReport(
    reportId: string,
    updates: Partial<Pick<PMFReport, 'isPublic' | 'companyName' | 'tagline'>>
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()

    const { error } = await supabase
        .from('pmf_reports')
        .update({
            is_public: updates.isPublic,
            company_name: updates.companyName,
            tagline: updates.tagline,
            updated_at: new Date().toISOString(),
        })
        .eq('id', reportId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()

    const { error } = await supabase
        .from('pmf_reports')
        .delete()
        .eq('id', reportId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// =================== SHARING ===================

export function getShareUrl(shareToken: string): string {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/pmf/${shareToken}`
}

export async function copyShareUrl(shareToken: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(getShareUrl(shareToken))
        return true
    } catch {
        return false
    }
}

export function getEmbedCode(shareToken: string): string {
    const url = getShareUrl(shareToken)
    return `<a href="${url}" target="_blank" rel="noopener"><img src="${url}/badge" alt="PMF Score - Velodesk Verified" /></a>`
}
