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

    try {
        const githubId = (session.user as any).githubId

        // Get user's internal ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const year = new Date().getFullYear()

        // Fetch entire year's data
        const { data: stats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', `${year}-01-01`)
            .lte('date', `${year}-12-31`)

        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!stats || !userData) {
            return NextResponse.json({ error: 'No data found' }, { status: 404 })
        }

        // Calculate year statistics
        const yearStats = {
            totalCommits: stats.reduce((sum, s) => sum + s.total_commits, 0),
            totalPRs: stats.reduce((sum, s) => sum + (s.prs_merged || 0), 0),
            totalIssues: stats.reduce((sum, s) => sum + (s.issues_closed || 0), 0),
            linesAdded: stats.reduce((sum, s) => sum + s.lines_added, 0),
            linesDeleted: stats.reduce((sum, s) => sum + s.lines_deleted, 0),
            activeDays: stats.filter(s => s.total_commits > 0).length,
            longestStreak: userData.longest_streak,
            topLanguage: getTopLanguage(stats),
            busiestMonth: getBusiestMonth(stats),
            busiestDay: getBusiestDay(stats),
            nightOwlCommits: countLateNightCommits(stats),
            weekendCommits: stats.filter(s => s.is_weekend).reduce((sum, s) => sum + s.total_commits, 0),
            uniqueRepos: getUniqueRepos(stats),
            developerDNA: calculateDeveloperDNA(stats),
            mostProductiveHour: getMostProductiveHour(stats),
            averageProductivityScore: Math.round(
                stats.reduce((sum, s) => sum + s.productivity_score, 0) / stats.length
            )
        }

        // Generate shareable card data
        const cardData = {
            user: {
                username: userData.username,
                avatar: userData.avatar_url,
                name: userData.name
            },
            year,
            stats: yearStats,
            theme: 'dark'
        }

        // Store sharing card
        const shareUrl = `devflow-${user.id}-${year}-${Date.now()}`
        const { data: card } = await supabase
            .from('sharing_cards')
            .insert({
                user_id: user.id,
                card_type: 'year_review',
                card_data: cardData,
                share_url: shareUrl
            })
            .select()
            .single()

        return NextResponse.json({
            success: true,
            card_id: card.id,
            share_url: `${process.env.NEXTAUTH_URL}/share/${shareUrl}`,
            data: cardData
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to generate year review',
            details: error.message
        }, { status: 500 })
    }
}

function getTopLanguage(stats: any[]): string {
    const langCounts: Record<string, number> = {}

    stats.forEach(day => {
        if (day.languages) {
            Object.entries(day.languages).forEach(([lang, count]: [string, any]) => {
                langCounts[lang] = (langCounts[lang] || 0) + count
            })
        }
    })

    return Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
}

function getBusiestMonth(stats: any[]): string {
    const monthCounts: Record<string, number> = {}

    stats.forEach(day => {
        const month = day.date.substring(0, 7)
        monthCounts[month] = (monthCounts[month] || 0) + day.total_commits
    })

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const busiestMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const monthNum = parseInt(busiestMonth?.split('-')[1] || '1')

    return months[monthNum - 1]
}

function getBusiestDay(stats: any[]): string {
    const maxDay = stats.reduce((max, day) =>
        day.total_commits > max.total_commits ? day : max
        , stats[0])

    return new Date(maxDay.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
    })
}

function countLateNightCommits(stats: any[]): number {
    let count = 0
    stats.forEach(day => {
        if (day.commits_by_hour) {
            for (let hour = 0; hour <= 5; hour++) {
                count += day.commits_by_hour[hour] || 0
            }
        }
    })
    return count
}

function getUniqueRepos(stats: any[]): number {
    const repos = new Set<string>()
    stats.forEach(day => {
        if (day.repos_contributed) {
            day.repos_contributed.forEach((r: any) => repos.add(r.name))
        }
    })
    return repos.size
}

function getMostProductiveHour(stats: any[]): number {
    const hourCounts: Record<number, number> = {}

    stats.forEach(day => {
        if (day.commits_by_hour) {
            Object.entries(day.commits_by_hour).forEach(([hour, count]: [string, any]) => {
                hourCounts[parseInt(hour)] = (hourCounts[parseInt(hour)] || 0) + count
            })
        }
    })

    return parseInt(
        Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '9'
    )
}

function calculateDeveloperDNA(stats: any[]): any {
    const totalCommits = stats.reduce((sum, s) => sum + s.total_commits, 0)

    // Calculate traits (0-100 scale)
    const traits = {
        consistency: calculateConsistency(stats),
        intensity: calculateIntensity(stats),
        variety: calculateVariety(stats),
        collaboration: calculateCollaboration(stats),
        nightOwl: calculateNightOwlScore(stats)
    }

    // Assign personality type based on dominant traits
    let personality = 'Balanced Developer'
    if (traits.consistency > 80) personality = 'The Machine'
    else if (traits.intensity > 80) personality = 'The Grinder'
    else if (traits.variety > 80) personality = 'The Explorer'
    else if (traits.nightOwl > 70) personality = 'The Night Owl'

    return {
        personality,
        traits
    }
}

function calculateConsistency(stats: any[]): number {
    const activeDays = stats.filter(s => s.total_commits > 0).length
    return Math.round((activeDays / stats.length) * 100)
}

function calculateIntensity(stats: any[]): number {
    const activeStats = stats.filter(s => s.total_commits > 0)
    if (activeStats.length === 0) return 0

    const avgCommitsPerActiveDay = activeStats.reduce((sum, s) => sum + s.total_commits, 0) / activeStats.length
    return Math.min(Math.round(avgCommitsPerActiveDay * 5), 100)
}

function calculateVariety(stats: any[]): number {
    const allLangs = new Set<string>()
    stats.forEach(day => {
        if (day.languages) {
            Object.keys(day.languages).forEach(l => allLangs.add(l))
        }
    })
    return Math.min(allLangs.size * 15, 100)
}

function calculateCollaboration(stats: any[]): number {
    const avgCollaborators = stats.reduce((sum, s) => sum + (s.collaborators_interacted || 0), 0) / stats.length
    return Math.min(Math.round(avgCollaborators * 10), 100)
}

function calculateNightOwlScore(stats: any[]): number {
    let lateNight = 0
    let total = 0
    stats.forEach(day => {
        if (day.commits_by_hour) {
            for (let h = 0; h <= 5; h++) lateNight += day.commits_by_hour[h] || 0
            total += day.total_commits
        }
    })
    return total > 0 ? Math.round((lateNight / total) * 100) : 0
}
