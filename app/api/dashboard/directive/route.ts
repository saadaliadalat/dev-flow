import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🎯 TODAY'S DIRECTIVE API
 * 
 * Analyzes real user data to detect anomalies, drops, or opportunities.
 * Returns ONE concrete action the user should take today.
 * 
 * NO MOCKS. NO FLUFF. REAL DATA ONLY.
 */

interface Directive {
    headline: string
    subtext: string
    impact: 'low' | 'medium' | 'critical'
    action: string
    metric: string
    delta: {
        previous: number
        current: number
        change: number
    }
    type: 'drop' | 'opportunity' | 'streak' | 'momentum'
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
            .select('id, current_streak, longest_streak, total_commits, total_prs, productivity_score')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch last 14 days of activity
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0]

        const { data: dailyStats } = await supabaseAdmin
            .from('daily_stats')
            .select('date, total_commits, total_prs')
            .eq('user_id', user.id)
            .gte('date', fourteenDaysAgo)
            .order('date', { ascending: false })

        // Calculate this week vs last week
        const today = new Date().toISOString().split('T')[0]
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0]

        const thisWeek = dailyStats?.filter(d => d.date >= sevenDaysAgo) || []
        const lastWeek = dailyStats?.filter(d => d.date < sevenDaysAgo) || []

        const thisWeekCommits = thisWeek.reduce((sum, d) => sum + (d.total_commits || 0), 0)
        const lastWeekCommits = lastWeek.reduce((sum, d) => sum + (d.total_commits || 0), 0)
        const thisWeekPRs = thisWeek.reduce((sum, d) => sum + (d.total_prs || 0), 0)
        const lastWeekPRs = lastWeek.reduce((sum, d) => sum + (d.total_prs || 0), 0)

        // Check for today's activity
        const todayData = thisWeek.find(d => d.date === today)
        const todayCommits = todayData?.total_commits || 0

        // Generate directive based on priority
        let directive: Directive

        // PRIORITY 1: Streak at risk
        if (user.current_streak > 0 && todayCommits === 0) {
            directive = {
                headline: `Your ${user.current_streak}-day streak is at risk`,
                subtext: 'No activity detected today',
                impact: user.current_streak >= 7 ? 'critical' : 'medium',
                action: 'Push 1 commit to keep your streak alive',
                metric: 'streak',
                delta: { previous: user.current_streak, current: user.current_streak, change: 0 },
                type: 'streak'
            }
        }
        // PRIORITY 2: Significant commit drop
        else if (lastWeekCommits > 0 && thisWeekCommits < lastWeekCommits * 0.5) {
            const change = Math.round(((thisWeekCommits - lastWeekCommits) / lastWeekCommits) * 100)
            const commitsNeeded = Math.max(1, Math.ceil(lastWeekCommits / 7) - todayCommits)
            directive = {
                headline: `Commits down ${Math.abs(change)}% this week`,
                subtext: `${thisWeekCommits} this week vs ${lastWeekCommits} last week`,
                impact: change <= -50 ? 'critical' : 'medium',
                action: `Push ${commitsNeeded} commit${commitsNeeded > 1 ? 's' : ''} today to recover`,
                metric: 'commits',
                delta: { previous: lastWeekCommits, current: thisWeekCommits, change },
                type: 'drop'
            }
        }
        // PRIORITY 3: No PRs this week (opportunity)
        else if (thisWeekPRs === 0 && lastWeekPRs > 0) {
            directive = {
                headline: 'No PRs opened this week',
                subtext: `You opened ${lastWeekPRs} last week`,
                impact: 'medium',
                action: 'Open 1 PR to maintain your review flow',
                metric: 'prs',
                delta: { previous: lastWeekPRs, current: 0, change: -100 },
                type: 'opportunity'
            }
        }
        // PRIORITY 4: Positive momentum
        else if (thisWeekCommits > lastWeekCommits) {
            const change = lastWeekCommits > 0
                ? Math.round(((thisWeekCommits - lastWeekCommits) / lastWeekCommits) * 100)
                : 100
            directive = {
                headline: `Momentum: +${change}% commits this week`,
                subtext: `${thisWeekCommits} commits and counting`,
                impact: 'low',
                action: todayCommits === 0 ? 'Keep it going with 1 commit today' : 'You\'re on track. Keep pushing.',
                metric: 'commits',
                delta: { previous: lastWeekCommits, current: thisWeekCommits, change },
                type: 'momentum'
            }
        }
        // DEFAULT: Encourage activity
        else {
            directive = {
                headline: todayCommits > 0 ? `${todayCommits} commits today` : 'Ready to code?',
                subtext: todayCommits > 0 ? 'Good progress so far' : 'Your streak awaits',
                impact: 'low',
                action: todayCommits > 0 ? 'Keep the momentum going' : 'Push your first commit of the day',
                metric: 'commits',
                delta: { previous: lastWeekCommits, current: thisWeekCommits, change: 0 },
                type: 'momentum'
            }
        }

        return NextResponse.json({
            directive,
            stats: {
                todayCommits,
                thisWeekCommits,
                lastWeekCommits,
                currentStreak: user.current_streak,
            }
        })
    } catch (error) {
        console.error('Directive error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
