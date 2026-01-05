import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { VERDICT_TEMPLATES } from '@/lib/devflow-data'
import type { DailyStats } from '@/types'

// GET: Fetch today's verdict for the current user
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const today = new Date().toISOString().split('T')[0]

        // Try to get existing verdict for today
        const { data: verdict, error } = await supabaseAdmin
            .from('daily_verdicts')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        // If no verdict exists, compute one
        if (!verdict) {
            const computedVerdict = await computeVerdict(userId)
            return NextResponse.json({ verdict: computedVerdict, fresh: true })
        }

        const template = VERDICT_TEMPLATES[verdict.verdict_key]
        return NextResponse.json({
            verdict: { ...verdict, emoji: template?.emoji || '📊' },
            fresh: false
        })
    } catch (error) {
        console.error('Error fetching verdict:', error)
        return NextResponse.json({ error: 'Failed to fetch verdict' }, { status: 500 })
    }
}

// POST: Force recompute today's verdict
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const verdict = await computeVerdict((session.user as any).id)
        return NextResponse.json({ verdict, recomputed: true })
    } catch (error) {
        console.error('Error computing verdict:', error)
        return NextResponse.json({ error: 'Failed to compute verdict' }, { status: 500 })
    }
}

async function computeVerdict(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

    // Fetch user data
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('current_streak, longest_streak, total_commits, dev_flow_score')
        .eq('id', userId)
        .single()

    // Fetch recent daily stats
    const { data: recentStats } = await supabaseAdmin
        .from('daily_stats')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekAgo)
        .order('date', { ascending: false })

    const stats = recentStats as DailyStats[] | null
    const todayStats = stats?.find((s: DailyStats) => s.date === today)
    const yesterdayStats = stats?.find((s: DailyStats) => s.date === yesterday)

    // Analyze patterns to determine verdict
    let verdictKey = 'average_day'
    let primaryFactor = 'general_activity'

    const streak = user?.current_streak || 0
    const todayCommits = todayStats?.total_commits || 0
    const todayPRs = (todayStats?.prs_opened || 0) + (todayStats?.prs_merged || 0)
    const weekCommits = stats?.reduce((sum: number, s: DailyStats) => sum + (s.total_commits || 0), 0) || 0
    const activeDays = stats?.filter((s: DailyStats) => s.total_commits > 0).length || 0
    const isWeekend = [0, 6].includes(new Date().getDay())

    // Decision tree for verdict
    if (streak >= 7 && todayCommits > 0) {
        if (streak >= 14) {
            verdictKey = 'streak_milestone'
            primaryFactor = 'streak'
        } else {
            verdictKey = 'momentum_building'
            primaryFactor = 'streak'
        }
    } else if (todayPRs > 0) {
        verdictKey = 'shipped_real_progress'
        primaryFactor = 'shipping'
    } else if (todayCommits > 5) {
        verdictKey = 'shipped_real_progress'
        primaryFactor = 'commits'
    } else if (isWeekend && todayCommits > 0) {
        verdictKey = 'showed_up'
        primaryFactor = 'weekend_work'
    } else if (todayCommits === 0 && streak === 0 && user?.current_streak && user.current_streak > 0) {
        verdictKey = 'streak_dead'
        primaryFactor = 'lost_streak'
    } else if (todayCommits === 0 && activeDays < 2) {
        if (!stats?.length) {
            verdictKey = 'prolonged_absence'
            primaryFactor = 'inactivity'
        } else {
            verdictKey = 'inconsistent'
            primaryFactor = 'consistency'
        }
    } else if (todayCommits === 0) {
        verdictKey = 'rest_day'
        primaryFactor = 'recovery'
    } else if (activeDays >= 5 && weekCommits < 10) {
        verdictKey = 'busy_not_productive'
        primaryFactor = 'low_output'
    }

    // Get template
    const template = VERDICT_TEMPLATES[verdictKey] || VERDICT_TEMPLATES.average_day

    // Process template variables
    let verdictText = template.text
        .replace('{streak}', String(streak))
        .replace('{streak + 1}', String(streak + 1))
        .replace('{days}', String(Math.max(1, 7 - activeDays)))
        .replace('{lostStreak}', String(user?.current_streak || 0))

    let verdictSubtext = template.subtext
        ?.replace('{streak}', String(streak))
        .replace('{streak + 1}', String(streak + 1))
        .replace('{lastWeek}', String(weekCommits))
        .replace('{thisWeek}', String(todayCommits))
        .replace('{lostStreak}', String(user?.current_streak || 0))

    // Calculate score change
    const currentScore = user?.dev_flow_score || 50
    const scoreChange = todayCommits > 0 ? Math.min(5, Math.floor(todayCommits / 2)) : -2

    // Upsert verdict
    const verdictData = {
        user_id: userId,
        date: today,
        verdict_key: verdictKey,
        verdict_text: verdictText,
        verdict_subtext: verdictSubtext,
        severity: template.severity,
        dev_flow_score: currentScore,
        score_change: scoreChange,
        primary_factor: primaryFactor,
        computed_at: new Date().toISOString()
    }

    const { data: savedVerdict, error } = await supabaseAdmin
        .from('daily_verdicts')
        .upsert(verdictData, { onConflict: 'user_id,date' })
        .select()
        .single()

    if (error) {
        console.error('Failed to save verdict:', error)
        return { ...verdictData, id: 'temp', emoji: template.emoji }
    }

    return { ...savedVerdict, emoji: template.emoji }
}
