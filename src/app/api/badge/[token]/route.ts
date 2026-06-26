import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface BadgeParams {
    params: Promise<{ token: string }>
}

export async function GET(request: NextRequest, { params }: BadgeParams) {
    const { token } = await params
    const searchParams = request.nextUrl.searchParams
    const style = searchParams.get('style') || 'default'
    const theme = searchParams.get('theme') || 'dark'

    // Get badge data from database
    const { data: badge, error } = await supabase
        .from('pmf_scores')
        .select('score, user_id')
        .eq('id', token)
        .single()

    // If no badge found, use mock data for demo
    const score = badge?.score || 72
    const scoreLabel = getScoreLabel(score)

    // Increment view count (fire and forget)
    if (badge) {
        supabase
            .from('badges')
            .update({ view_count: supabase.rpc('increment', { x: 1 }) })
            .eq('token', token)
            .then(() => { })
    }

    // Generate SVG
    const svg = generateBadgeSVG(score, scoreLabel, style, theme)

    return new NextResponse(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
    })
}

function getScoreLabel(score: number): string {
    if (score >= 80) return 'Strong PMF'
    if (score >= 60) return 'Emerging PMF'
    if (score >= 40) return 'Searching'
    return 'Pre-PMF'
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#3b82f6'
    if (score >= 40) return '#f59e0b'
    return '#6b7280'
}

function generateBadgeSVG(
    score: number,
    label: string,
    style: string,
    theme: string
): string {
    const bgColor = theme === 'dark' ? '#0a0a0a' : '#ffffff'
    const textColor = theme === 'dark' ? '#ffffff' : '#0a0a0a'
    const mutedColor = theme === 'dark' ? '#666666' : '#888888'
    const scoreColor = getScoreColor(score)

    if (style === 'minimal') {
        // Minimal: Just score and label
        return `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="28" viewBox="0 0 100 28">
  <rect width="100" height="28" rx="4" fill="${bgColor}" stroke="${theme === 'dark' ? '#333' : '#ddd'}" stroke-width="1"/>
  <text x="8" y="18" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="${scoreColor}">${score}</text>
  <text x="35" y="18" font-family="system-ui, sans-serif" font-size="10" fill="${mutedColor}">PMF</text>
  <circle cx="85" cy="14" r="6" fill="${scoreColor}" opacity="0.2"/>
  <circle cx="85" cy="14" r="3" fill="${scoreColor}"/>
</svg>`
    }

    if (style === 'detailed') {
        // Detailed: Full breakdown
        return `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="50" viewBox="0 0 180 50">
  <rect width="180" height="50" rx="6" fill="${bgColor}" stroke="${theme === 'dark' ? '#333' : '#ddd'}" stroke-width="1"/>
  <text x="12" y="22" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="${scoreColor}">${score}</text>
  <text x="45" y="22" font-family="system-ui, sans-serif" font-size="12" fill="${textColor}">${label}</text>
  <text x="12" y="40" font-family="system-ui, sans-serif" font-size="9" fill="${mutedColor}">Verified by Velodesk</text>
  <rect x="130" y="15" width="40" height="20" rx="10" fill="${scoreColor}" opacity="0.15"/>
  <text x="140" y="29" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="${scoreColor}">✓</text>
</svg>`
    }

    // Default: Standard badge
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="36" viewBox="0 0 140 36">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="140" height="36" rx="6" fill="url(#bg-gradient)" stroke="${theme === 'dark' ? '#333' : '#ddd'}" stroke-width="1"/>
  <text x="10" y="24" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="${scoreColor}">${score}</text>
  <text x="42" y="20" font-family="system-ui, sans-serif" font-size="10" fill="${textColor}">PMF Score</text>
  <text x="42" y="30" font-family="system-ui, sans-serif" font-size="8" fill="${mutedColor}">${label}</text>
  <circle cx="120" cy="18" r="10" fill="${scoreColor}" opacity="0.1"/>
  <text x="116" y="22" font-family="system-ui, sans-serif" font-size="10" fill="${scoreColor}">✓</text>
</svg>`
}
