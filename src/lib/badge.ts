/**
 * Velodesk Badge Module
 * Embeddable PMF badge generation and management
 */

import { createClient } from '@/lib/supabase/client'

// =================== TYPES ===================

export interface Badge {
    id: string
    userId: string
    token: string
    score: number
    scoreLabel: string
    style: 'default' | 'minimal' | 'detailed'
    theme: 'dark' | 'light'
    isActive: boolean
    clickCount: number
    viewCount: number
    createdAt: string
    updatedAt: string
}

export interface BadgeCreateOptions {
    style?: 'default' | 'minimal' | 'detailed'
    theme?: 'dark' | 'light'
    refreshInterval?: number // hours
}

export type BadgePosition = 'inline' | 'fixed-bottom-right' | 'fixed-bottom-left'

// =================== BADGE DIMENSIONS ===================

const BADGE_DIMENSIONS = {
    minimal: { width: 100, height: 28 },
    default: { width: 140, height: 36 },
    detailed: { width: 180, height: 50 },
}

// =================== BADGE GENERATION ===================

function generateToken(length = 12): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Create a new badge
 */
export async function createBadge(
    options: BadgeCreateOptions = {}
): Promise<{ badge?: Badge; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Get latest PMF score
    const { data: pmfScore } = await supabase
        .from('pmf_scores')
        .select('score')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single()

    const score = pmfScore?.score || 0
    const scoreLabel = getScoreLabel(score)
    const token = generateToken()

    const badgeData = {
        user_id: user.id,
        token,
        score,
        score_label: scoreLabel,
        style: options.style || 'default',
        theme: options.theme || 'dark',
        is_active: true,
        click_count: 0,
        view_count: 0,
        refresh_interval: options.refreshInterval || 24,
    }

    const { data, error } = await supabase
        .from('badges')
        .insert(badgeData)
        .select()
        .single()

    if (error) {
        console.error('Error creating badge:', error)
        return { error: error.message }
    }

    return {
        badge: {
            id: data.id,
            userId: data.user_id,
            token: data.token,
            score: data.score,
            scoreLabel: data.score_label,
            style: data.style,
            theme: data.theme,
            isActive: data.is_active,
            clickCount: data.click_count,
            viewCount: data.view_count,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        }
    }
}

/**
 * Get all badges for current user
 */
export async function listBadges(): Promise<Badge[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching badges:', error)
        return []
    }

    return (data || []).map(b => ({
        id: b.id,
        userId: b.user_id,
        token: b.token,
        score: b.score,
        scoreLabel: b.score_label,
        style: b.style,
        theme: b.theme,
        isActive: b.is_active,
        clickCount: b.click_count,
        viewCount: b.view_count,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
    }))
}

/**
 * Refresh badge with latest score
 */
export async function refreshBadge(
    badgeId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // Get latest PMF score
    const { data: pmfScore } = await supabase
        .from('pmf_scores')
        .select('score')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single()

    const score = pmfScore?.score || 0
    const scoreLabel = getScoreLabel(score)

    const { error } = await supabase
        .from('badges')
        .update({
            score,
            score_label: scoreLabel,
            updated_at: new Date().toISOString(),
        })
        .eq('id', badgeId)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

/**
 * Delete a badge
 */
export async function deleteBadge(
    badgeId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', badgeId)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// =================== EMBED CODE GENERATION ===================

/**
 * Get badge image URL
 */
export function getBadgeImageUrl(
    token: string,
    style: Badge['style'] = 'default',
    theme: Badge['theme'] = 'dark'
): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://velodesk.app'
    return `${baseUrl}/api/badge/${token}?style=${style}&theme=${theme}`
}

/**
 * Get embed code for a badge
 */
export function getEmbedCode(
    token: string,
    options: {
        style?: Badge['style']
        theme?: Badge['theme']
        position?: BadgePosition
    } = {}
): string {
    const { style = 'default', theme = 'dark', position = 'inline' } = options
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://velodesk.app'

    // Generate the script tag embed
    const scriptEmbed = `<script src="${baseUrl}/badge.js" data-token="${token}" data-style="${style}" data-theme="${theme}" data-position="${position}"></script>`

    return scriptEmbed
}

/**
 * Get simple HTML embed (no JavaScript)
 */
export function getSimpleEmbedCode(
    token: string,
    style: Badge['style'] = 'default',
    theme: Badge['theme'] = 'dark'
): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://velodesk.app'
    const dimensions = BADGE_DIMENSIONS[style]

    return `<a href="${baseUrl}/pmf/${token}" target="_blank" rel="noopener" title="View PMF Report">
  <img src="${baseUrl}/api/badge/${token}?style=${style}&theme=${theme}" alt="Velodesk PMF Score" width="${dimensions.width}" height="${dimensions.height}" />
</a>`
}

/**
 * Get Markdown embed
 */
export function getMarkdownEmbed(token: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://velodesk.app'
    return `[![Velodesk PMF Score](${baseUrl}/api/badge/${token})](${baseUrl}/pmf/${token})`
}

// =================== HELPERS ===================

function getScoreLabel(score: number): string {
    if (score >= 80) return 'Strong PMF'
    if (score >= 60) return 'Emerging PMF'
    if (score >= 40) return 'Searching'
    return 'Pre-PMF'
}

/**
 * Copy embed code to clipboard
 */
export async function copyEmbedCode(
    token: string,
    format: 'script' | 'html' | 'markdown' = 'html'
): Promise<boolean> {
    let code: string

    switch (format) {
        case 'script':
            code = getEmbedCode(token)
            break
        case 'markdown':
            code = getMarkdownEmbed(token)
            break
        default:
            code = getSimpleEmbedCode(token)
    }

    try {
        await navigator.clipboard.writeText(code)
        return true
    } catch {
        return false
    }
}
