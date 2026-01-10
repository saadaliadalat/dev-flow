import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🌸 BURNOUT ORACLE
 * Detects burnout patterns and returns poetic haiku warnings.
 */

// Haiku library organized by burnout type
const HAIKUS = {
    lateNights: [
        "Late commits again—\nthe keyboard knows your tired hands.\nRest writes no errors.",
        "Stars see you working,\nbut code typed in darkness fades.\nSleep fuels tomorrow.",
        "Midnight pulls you in—\nthe screen glows but wisdom says:\nmorning solves it all.",
    ],
    highVelocity: [
        "Sprinting burns the soul,\neven rivers rest in pools.\nSlowness finds the way.",
        "Fast commits stack high,\nbut towers built too quickly\ncrumble in the wind.",
        "The well runs dry slow,\nrefill before the last drop—\ntomorrow needs you.",
    ],
    noBreaks: [
        "Seven days, no pause—\neven mountains erode slow.\nOne day off heals much.",
        "Unbroken streaks shine,\nbut the brightest stars burn out.\nDarkness has its gifts.",
        "Weekends are not waste,\nthey're where your mind finds the paths\ncode alone can't see.",
    ],
    overwork: [
        "Commit after commit—\nyour history writes itself.\nBut who writes for you?",
        "The machine runs hot,\nbut you are not a machine.\nBreathe. Then push again.",
        "Your graph glows so green,\nbut green means nothing if you\nforget to bloom too.",
    ],
    healthy: [
        "Balanced as the tide,\nyour rhythm finds its own way.\nKeep flowing, warrior.",
        "No warnings today—\nyour soul velocity shows\nmastery in motion.",
    ],
}

interface BurnoutPattern {
    type: 'lateNights' | 'highVelocity' | 'noBreaks' | 'overwork' | 'healthy'
    severity: 'none' | 'mild' | 'warning' | 'critical'
    haiku: string
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from DB
        const githubId = (session.user as any).githubId
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get recent daily stats
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]

        const { data: dailyStats } = await supabaseAdmin
            .from('daily_stats')
            .select('*')
            .eq('user_id', session.user.id)
            .gte('date', fourteenDaysAgo)
            .order('date', { ascending: false })

        // Analyze patterns
        const patterns: BurnoutPattern[] = []

        if (!dailyStats || dailyStats.length === 0) {
            // No data = healthy (or no activity)
            patterns.push({
                type: 'healthy',
                severity: 'none',
                haiku: getRandomHaiku('healthy'),
            })
            return NextResponse.json({ patterns, primary: patterns[0] })
        }

        // Check for consecutive days (no breaks)
        const activeDays = dailyStats.filter(d => (d.total_commits || 0) > 0).length
        if (activeDays >= 12) {
            patterns.push({
                type: 'noBreaks',
                severity: activeDays >= 14 ? 'critical' : 'warning',
                haiku: getRandomHaiku('noBreaks'),
            })
        }

        // Check for high velocity (lots of commits recently)
        const recentTotal = dailyStats
            .slice(0, 7)
            .reduce((sum, d) => sum + (d.total_commits || 0), 0)
        if (recentTotal > 50) {
            patterns.push({
                type: 'highVelocity',
                severity: recentTotal > 80 ? 'critical' : 'warning',
                haiku: getRandomHaiku('highVelocity'),
            })
        }

        // If no warning patterns, return healthy
        if (patterns.length === 0) {
            patterns.push({
                type: 'healthy',
                severity: 'none',
                haiku: getRandomHaiku('healthy'),
            })
        }

        // Sort by severity (critical first)
        const severityOrder = { critical: 0, warning: 1, mild: 2, none: 3 }
        patterns.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

        return NextResponse.json({
            patterns,
            primary: patterns[0],
        })
    } catch (error) {
        console.error('Burnout check error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

function getRandomHaiku(type: keyof typeof HAIKUS): string {
    const haikus = HAIKUS[type]
    return haikus[Math.floor(Math.random() * haikus.length)]
}
