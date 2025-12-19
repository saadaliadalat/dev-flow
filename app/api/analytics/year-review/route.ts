import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId

        // Get user's internal ID
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get year's data (current year)
        const currentYear = new Date().getFullYear()
        const yearStart = `${currentYear}-01-01`
        const yearEnd = `${currentYear}-12-31`

        const { data: yearStats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', yearStart)
            .lte('date', yearEnd)

        if (!yearStats || yearStats.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Not enough data for year review'
            })
        }

        // Calculate aggregated stats
        const totalCommits = yearStats.reduce((sum, day) => sum + (day.total_commits || 0), 0)
        const activeDays = yearStats.filter(day => day.total_commits > 0).length
        const weekendCommits = yearStats.filter(day => day.is_weekend && day.total_commits > 0)
            .reduce((sum, day) => sum + day.total_commits, 0)

        // Top languages
        const languageCounts: Record<string, number> = {}
        yearStats.forEach(day => {
            if (day.languages) {
                Object.entries(day.languages).forEach(([lang, count]) => {
                    languageCounts[lang] = (languageCounts[lang] || 0) + (count as number)
                })
            }
        })

        const topLanguages = Object.entries(languageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([language, commits]) => ({
                language,
                commits,
                percentage: Math.round((commits / totalCommits) * 100)
            }))

        // Most productive hour
        const hourCounts: Record<number, number> = {}
        yearStats.forEach(day => {
            if (day.commits_by_hour) {
                Object.entries(day.commits_by_hour).forEach(([hour, count]) => {
                    hourCounts[parseInt(hour)] = (hourCounts[parseInt(hour)] || 0) + (count as number)
                })
            }
        })

        const mostProductiveHour = parseInt(
            Object.entries(hourCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || '9'
        )

        // Average productivity score
        const avgProductivityScore = Math.round(
            yearStats.reduce((sum, day) => sum + (day.productivity_score || 0), 0) / yearStats.length
        )

        // Calculate percentile (simplified - compare to all users)
        const { data: allUsers } = await supabase
            .from('users')
            .select('productivity_score')
            .order('productivity_score', { ascending: false })

        let percentile = 50
        if (allUsers) {
            const userRank = allUsers.findIndex(u => u.productivity_score <= user.productivity_score) + 1
            percentile = Math.round((1 - (userRank / allUsers.length)) * 100)
        }

        // Get repositories count
        const { data: repos } = await supabase
            .from('repositories')
            .select('id')
            .eq('user_id', user.id)

        return NextResponse.json({
            success: true,
            totalCommits,
            longestStreak: user.longest_streak,
            activeDays,
            weekendCommits,
            topLanguages,
            mostProductiveHour,
            avgProductivityScore,
            percentile,
            totalRepos: repos?.length || 0
        })

    } catch (error: any) {
        console.error('Year review error:', error)
        return NextResponse.json({
            error: 'Failed to generate year review',
            details: error.message
        }, { status: 500 })
    }
}
