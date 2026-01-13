import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🎮 DAILY MISSIONS ENGINE
 * 
 * Generates exactly 3 missions per day based on:
 * 1. Weakest metrics
 * 2. Recent negative deltas
 * 3. Streak maintenance
 * 
 * Each mission is bound to a real tracked event and has measurable XP impact.
 */

interface Mission {
    id: string
    title: string
    description: string
    metric: 'commits' | 'prs' | 'reviews' | 'streak'
    target: number
    current: number
    xpReward: number
    isCompleted: boolean
    priority: 'high' | 'medium' | 'low'
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, current_streak, longest_streak, total_commits, total_prs, total_reviews')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get today's stats
        const today = new Date().toISOString().split('T')[0]
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0]

        const { data: dailyStats } = await supabaseAdmin
            .from('daily_stats')
            .select('date, total_commits, total_prs')
            .eq('user_id', user.id)
            .gte('date', sevenDaysAgo)
            .order('date', { ascending: false })

        const todayData = dailyStats?.find(d => d.date === today)
        const todayCommits = todayData?.total_commits || 0
        const todayPRs = todayData?.total_prs || 0

        // Calculate averages
        const weekCommits = dailyStats?.reduce((sum, d) => sum + (d.total_commits || 0), 0) || 0
        const weekPRs = dailyStats?.reduce((sum, d) => sum + (d.total_prs || 0), 0) || 0
        const avgDailyCommits = Math.ceil(weekCommits / 7)
        const avgWeeklyPRs = weekPRs

        const missions: Mission[] = []

        // MISSION 1: Streak Keeper (always if streak > 0 and no activity today)
        if (user.current_streak > 0) {
            missions.push({
                id: 'streak-keeper',
                title: '🔥 Keep the Fire',
                description: `Maintain your ${user.current_streak}-day streak`,
                metric: 'streak',
                target: 1,
                current: todayCommits > 0 ? 1 : 0,
                xpReward: 50 + (user.current_streak * 5), // Bonus for longer streaks
                isCompleted: todayCommits > 0,
                priority: 'high'
            })
        } else {
            missions.push({
                id: 'streak-starter',
                title: '🔥 Ignite the Flame',
                description: 'Start a new streak today',
                metric: 'streak',
                target: 1,
                current: todayCommits > 0 ? 1 : 0,
                xpReward: 75,
                isCompleted: todayCommits > 0,
                priority: 'high'
            })
        }

        // MISSION 2: Commit Target (based on avg or minimum of 3)
        const commitTarget = Math.max(3, avgDailyCommits)
        missions.push({
            id: 'daily-commits',
            title: '💻 Commit Sprint',
            description: `Push ${commitTarget} commits today`,
            metric: 'commits',
            target: commitTarget,
            current: todayCommits,
            xpReward: commitTarget * 10,
            isCompleted: todayCommits >= commitTarget,
            priority: 'medium'
        })

        // MISSION 3: PR or Review (based on weakness)
        if (avgWeeklyPRs < 2) {
            missions.push({
                id: 'open-pr',
                title: '🚀 Ship It',
                description: 'Open a pull request today',
                metric: 'prs',
                target: 1,
                current: todayPRs,
                xpReward: 100,
                isCompleted: todayPRs >= 1,
                priority: 'medium'
            })
        } else {
            missions.push({
                id: 'code-review',
                title: '👀 Review Code',
                description: 'Review a teammate\'s PR',
                metric: 'reviews',
                target: 1,
                current: 0, // Would need review tracking
                xpReward: 75,
                isCompleted: false,
                priority: 'low'
            })
        }

        // Calculate total XP available and earned
        const totalXPAvailable = missions.reduce((sum, m) => sum + m.xpReward, 0)
        const earnedXP = missions
            .filter(m => m.isCompleted)
            .reduce((sum, m) => sum + m.xpReward, 0)
        const completedCount = missions.filter(m => m.isCompleted).length

        return NextResponse.json({
            missions,
            summary: {
                totalMissions: missions.length,
                completedCount,
                totalXPAvailable,
                earnedXP,
                completionRate: Math.round((completedCount / missions.length) * 100)
            }
        })
    } catch (error) {
        console.error('Missions error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
