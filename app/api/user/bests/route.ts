import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🏆 PERSONAL BESTS API
 * 
 * Returns user's all-time records and milestones
 */

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const email = session.user.email

        // Get user data
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, current_streak, longest_streak, total_commits, total_prs, created_at')
            .eq('email', email)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get daily stats for calculating best day/week
        const { data: dailyStats } = await supabaseAdmin
            .from('daily_stats')
            .select('date, total_commits')
            .eq('user_id', user.id)
            .order('date', { ascending: true })

        // Calculate most commits in a day
        let mostCommitsInDay = 0
        let mostCommitsInWeek = 0
        let firstCommitDate: string | null = null
        const activeMonthsSet = new Set<string>()

        if (dailyStats && dailyStats.length > 0) {
            // First commit date
            const firstWithCommits = dailyStats.find(d => d.total_commits > 0)
            firstCommitDate = firstWithCommits?.date || null

            // Best day
            for (const stat of dailyStats) {
                if (stat.total_commits > mostCommitsInDay) {
                    mostCommitsInDay = stat.total_commits
                }
                // Track active months
                if (stat.total_commits > 0) {
                    const month = stat.date.substring(0, 7) // YYYY-MM
                    activeMonthsSet.add(month)
                }
            }

            // Best week (rolling 7-day window)
            for (let i = 0; i <= dailyStats.length - 7; i++) {
                const weekSum = dailyStats
                    .slice(i, i + 7)
                    .reduce((sum, d) => sum + (d.total_commits || 0), 0)
                if (weekSum > mostCommitsInWeek) {
                    mostCommitsInWeek = weekSum
                }
            }
        }

        return NextResponse.json({
            longestStreak: user.longest_streak || 0,
            currentStreak: user.current_streak || 0,
            mostCommitsInDay,
            mostCommitsInWeek,
            totalCommits: user.total_commits || 0,
            totalPRs: user.total_prs || 0,
            firstCommitDate: firstCommitDate || user.created_at,
            activeMonths: activeMonthsSet.size,
        })
    } catch (error) {
        console.error('Personal bests error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
