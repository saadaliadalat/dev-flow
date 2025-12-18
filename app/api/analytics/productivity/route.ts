import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30' // days
    const userId = searchParams.get('userId') || (session.user as any).githubId

    try {
        // Get user's internal ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', userId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch daily stats for the period
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        const { data: stats, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: true })

        if (error) throw error

        // Calculate aggregated metrics
        const metrics = {
            totalCommits: 0,
            totalPRs: 0,
            totalIssues: 0,
            totalLinesAdded: 0,
            totalLinesDeleted: 0,
            activeDays: stats?.filter(s => s.total_commits > 0).length || 0,
            averageScore: 0,
            trend: 'stable' as 'up' | 'down' | 'stable',
            topLanguages: {} as Record<string, number>,
            mostProductiveHour: 0,
            weekdayVsWeekend: {
                weekday: 0,
                weekend: 0
            }
        }

        if (stats && stats.length > 0) {
            stats.forEach(day => {
                metrics.totalCommits += day.total_commits || 0
                metrics.totalPRs += (day.prs_opened || 0) + (day.prs_merged || 0)
                metrics.totalIssues += day.issues_closed || 0
                metrics.totalLinesAdded += day.lines_added || 0
                metrics.totalLinesDeleted += day.lines_deleted || 0

                // Aggregate languages
                if (day.languages) {
                    Object.entries(day.languages).forEach(([lang, count]) => {
                        metrics.topLanguages[lang] = (metrics.topLanguages[lang] || 0) + (count as number)
                    })
                }

                // Track weekday vs weekend
                if (day.is_weekend) {
                    metrics.weekdayVsWeekend.weekend += day.total_commits
                } else {
                    metrics.weekdayVsWeekend.weekday += day.total_commits
                }
            })

            // Calculate average productivity score
            const scores = stats.map(s => s.productivity_score || 0)
            metrics.averageScore = Math.round(
                scores.reduce((a, b) => a + b, 0) / scores.length
            )

            // Calculate trend (compare first half vs second half)
            const midpoint = Math.floor(scores.length / 2)
            const firstHalf = scores.slice(0, midpoint)
            const secondHalf = scores.slice(midpoint)

            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

            if (secondAvg > firstAvg * 1.1) metrics.trend = 'up'
            else if (secondAvg < firstAvg * 0.9) metrics.trend = 'down'

            // Find most productive hour
            const hourCounts: Record<number, number> = {}
            stats.forEach(day => {
                if (day.commits_by_hour) {
                    Object.entries(day.commits_by_hour).forEach(([hour, count]) => {
                        hourCounts[parseInt(hour)] = (hourCounts[parseInt(hour)] || 0) + (count as number)
                    })
                }
            })
            metrics.mostProductiveHour = parseInt(
                Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '9'
            )
        }

        return NextResponse.json({
            success: true,
            period: parseInt(period),
            metrics,
            dailyStats: stats
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to calculate productivity',
            details: error.message
        }, { status: 500 })
    }
}
