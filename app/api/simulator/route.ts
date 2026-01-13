import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🎯 GOAL SIMULATOR API
 * 
 * Predicts future rank, XP, and achievements based on:
 * 1. Current metrics
 * 2. User-defined daily commit target
 * 3. Historical velocity
 * 
 * "If you commit X times today, you'll reach rank Y in Z days"
 */

interface Prediction {
    simulation: {
        daysToNextRank: number
        estimatedNewRank: number
        xpGain: number
        streakBonus: number
    }
    currentState: {
        rank: number
        xp: number
        streak: number
        avgDailyCommits: number
    }
    nextRival: {
        name: string
        xp: number
        gap: number
        commitsToOvertake: number
    } | null
    milestones: {
        title: string
        progress: number
        remaining: number
        estimatedDays: number
    }[]
}

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(request.url)
        const targetCommits = parseInt(url.searchParams.get('commits') || '5')

        const githubId = (session.user as any).githubId

        // Get current user
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, productivity_score, current_streak, total_commits, total_prs, github_username')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get leaderboard position
        const { data: leaderboard } = await supabaseAdmin
            .from('users')
            .select('id, github_username, productivity_score')
            .order('productivity_score', { ascending: false })
            .limit(100)

        const userRank = leaderboard?.findIndex(u => u.id === user.id) ?? -1
        const currentRank = userRank + 1

        // Find next rival
        let nextRival = null
        if (userRank > 0 && leaderboard) {
            const rivalUser = leaderboard[userRank - 1]
            const xpGap = rivalUser.productivity_score - user.productivity_score
            // XP formula: ~10 XP per commit with quality factor
            const commitsToOvertake = Math.ceil(xpGap / 10)
            nextRival = {
                name: rivalUser.github_username || `Rank #${userRank}`,
                xp: rivalUser.productivity_score,
                gap: xpGap,
                commitsToOvertake,
            }
        }

        // Get recent daily stats for velocity calculation
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0]

        const { data: dailyStats } = await supabaseAdmin
            .from('daily_stats')
            .select('total_commits')
            .eq('user_id', user.id)
            .gte('date', sevenDaysAgo)

        const recentCommits = dailyStats?.reduce((sum, d) => sum + (d.total_commits || 0), 0) || 0
        const avgDailyCommits = dailyStats?.length ? recentCommits / 7 : 1

        // Calculate predictions based on target
        const xpPerCommit = 10 * (1 + 0.02 * user.current_streak) // Streak bonus
        const dailyXpGain = targetCommits * xpPerCommit
        const streakBonus = Math.round(targetCommits * 0.02 * user.current_streak)

        // Days to next rank
        let daysToNextRank = 999
        let estimatedNewRank = currentRank
        if (nextRival) {
            daysToNextRank = Math.ceil(nextRival.gap / dailyXpGain)
            if (daysToNextRank <= 30) {
                estimatedNewRank = currentRank - 1
            }
        }

        // Calculate milestones
        const milestones = [
            {
                title: '💯 Centurion (100 commits)',
                progress: Math.min(user.total_commits, 100),
                remaining: Math.max(0, 100 - user.total_commits),
                estimatedDays: Math.ceil(Math.max(0, 100 - user.total_commits) / targetCommits),
            },
            {
                title: '🔥 Streak Master (30 days)',
                progress: Math.min(user.current_streak, 30),
                remaining: Math.max(0, 30 - user.current_streak),
                estimatedDays: Math.max(0, 30 - user.current_streak),
            },
            {
                title: '⚡ Velocity King (1000 commits)',
                progress: Math.min(user.total_commits, 1000),
                remaining: Math.max(0, 1000 - user.total_commits),
                estimatedDays: Math.ceil(Math.max(0, 1000 - user.total_commits) / targetCommits),
            },
        ].filter(m => m.remaining > 0)

        const prediction: Prediction = {
            simulation: {
                daysToNextRank,
                estimatedNewRank,
                xpGain: Math.round(dailyXpGain),
                streakBonus,
            },
            currentState: {
                rank: currentRank,
                xp: user.productivity_score,
                streak: user.current_streak,
                avgDailyCommits: Math.round(avgDailyCommits * 10) / 10,
            },
            nextRival,
            milestones,
        }

        return NextResponse.json(prediction)
    } catch (error) {
        console.error('Goal simulator error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
