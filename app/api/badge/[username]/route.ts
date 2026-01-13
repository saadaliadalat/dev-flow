import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * 🏷️ DYNAMIC GITHUB BADGE API
 * 
 * Generates embeddable SVG badges for GitHub READMEs.
 * 
 * Usage in README.md:
 * ![DevFlow Score](https://devflow.app/api/badge/your-username?type=score)
 * ![DevFlow Streak](https://devflow.app/api/badge/your-username?type=streak)
 * 
 * Supports: score, streak, commits, rank
 */

export const runtime = 'edge'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Level definitions for rank display
const LEVELS = [
    { level: 1, name: 'Beginner', minScore: 0 },
    { level: 2, name: 'Contributor', minScore: 500 },
    { level: 3, name: 'Developer', minScore: 1500 },
    { level: 4, name: 'Senior Dev', minScore: 3500 },
    { level: 5, name: 'Lead', minScore: 7000 },
    { level: 6, name: 'Architect', minScore: 15000 },
    { level: 7, name: 'Principal', minScore: 25000 },
    { level: 8, name: 'Distinguished', minScore: 35000 },
    { level: 9, name: 'Fellow', minScore: 60000 },
    { level: 10, name: 'Legend', minScore: 100000 },
]

function getLevel(score: number) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEVELS[i].minScore) return LEVELS[i]
    }
    return LEVELS[0]
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'score'
        const style = searchParams.get('style') || 'flat' // flat, flat-square, plastic

        // Fetch user data from Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('productivity_score, current_streak, total_commits, total_prs, username')
            .eq('username', username)
            .single()

        if (error || !user) {
            // Return a "user not found" badge
            return new Response(generateSVG({
                label: 'DevFlow',
                value: 'not found',
                color: '#6b7280',
                style,
            }), {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=300', // 5 min cache
                },
            })
        }

        // Generate badge based on type
        let label: string
        let value: string
        let color: string

        switch (type) {
            case 'streak':
                label = 'streak'
                value = `🔥 ${user.current_streak || 0} days`
                color = getStreakColor(user.current_streak || 0)
                break
            case 'commits':
                label = 'commits'
                value = formatNumber(user.total_commits || 0)
                color = '#8B5CF6' // Violet
                break
            case 'rank':
                const level = getLevel(user.productivity_score || 0)
                label = 'rank'
                value = level.name
                color = getRankColor(level.level)
                break
            case 'score':
            default:
                label = 'DEV score'
                value = String(user.productivity_score || 0)
                color = getScoreColor(user.productivity_score || 0)
                break
        }

        return new Response(generateSVG({ label, value, color, style }), {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=300', // 5 min cache
            },
        })
    } catch (err) {
        console.error('Badge generation error:', err)
        return new Response(generateSVG({
            label: 'DevFlow',
            value: 'error',
            color: '#ef4444',
            style: 'flat',
        }), {
            headers: { 'Content-Type': 'image/svg+xml' },
        })
    }
}

function generateSVG({
    label,
    value,
    color,
    style
}: {
    label: string
    value: string
    color: string
    style: string
}): string {
    const labelWidth = getTextWidth(label) + 12
    const valueWidth = getTextWidth(value) + 12
    const totalWidth = labelWidth + valueWidth
    const height = 20

    const radius = style === 'flat-square' ? 0 : style === 'plastic' ? 4 : 3

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="${radius}" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="#1f1f2e"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${color}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="14" fill="#a1a1aa">${escapeXml(label)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" fill="#fff" font-weight="bold">${escapeXml(value)}</text>
  </g>
</svg>`
}

function getTextWidth(text: string): number {
    // Rough approximation: ~6.5px per character for 11px Verdana
    return text.length * 7 + 10
}

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return String(num)
}

function getStreakColor(streak: number): string {
    if (streak >= 30) return '#dc2626' // Red hot
    if (streak >= 14) return '#ea580c' // Orange
    if (streak >= 7) return '#d97706' // Amber
    return '#8B5CF6' // Violet default
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#059669' // Emerald
    if (score >= 60) return '#8B5CF6' // Violet
    if (score >= 40) return '#d97706' // Amber
    return '#6b7280' // Gray
}

function getRankColor(level: number): string {
    const colors = [
        '#71717a', // 1: Gray
        '#3b82f6', // 2: Blue
        '#06b6d4', // 3: Cyan
        '#10b981', // 4: Emerald
        '#8B5CF6', // 5: Violet
        '#a855f7', // 6: Purple
        '#ec4899', // 7: Pink
        '#f59e0b', // 8: Amber
        '#f97316', // 9: Orange
        '#fbbf24', // 10: Yellow (Legend)
    ]
    return colors[Math.min(level - 1, colors.length - 1)]
}
