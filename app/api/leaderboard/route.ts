import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

/**
 * Leaderboard API - Computes scores dynamically for fair ranking
 * 
 * Formula: (commits * 10) + (prs * 25) + (issues * 15) + (reviews * 20)
 * This ensures rankings are accurate even if users haven't re-synced
 */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'all'

        // For time-based filtering, aggregate from daily_stats
        if (period === 'daily' || period === 'weekly') {
            const days = period === 'daily' ? 1 : 7

            const endDate = new Date()
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - days)

            const { data: dailyData, error: dailyError } = await supabase
                .from('daily_stats')
                .select('user_id, total_commits, productivity_score')
                .gte('date', startDate.toISOString().split('T')[0])
                .lte('date', endDate.toISOString().split('T')[0])

            if (!dailyError && dailyData) {
                // Aggregate scores by user
                const userScores = dailyData.reduce((acc: Record<string, { commits: number, score: number }>, stat) => {
                    if (!acc[stat.user_id]) {
                        acc[stat.user_id] = { commits: 0, score: 0 }
                    }
                    acc[stat.user_id].commits += stat.total_commits || 0
                    acc[stat.user_id].score += stat.productivity_score || 0
                    return acc
                }, {})

                // Get user details for users with activity
                const userIds = Object.keys(userScores)
                if (userIds.length > 0) {
                    const { data: usersData, error: usersError } = await supabase
                        .from('users')
                        .select('id, name, username, avatar_url, current_streak')
                        .in('id', userIds)
                        .eq('show_on_leaderboard', true)

                    if (!usersError && usersData) {
                        const rankedUsers = usersData
                            .map(user => ({
                                ...user,
                                total_commits: userScores[user.id]?.commits || 0,
                                productivity_score: userScores[user.id]?.score || 0
                            }))
                            .sort((a, b) => b.productivity_score - a.productivity_score)
                            .slice(0, 50)
                            .map((user, index) => ({
                                ...user,
                                rank: index + 1
                            }))

                        return NextResponse.json({ users: rankedUsers })
                    }
                }
            }

            // Fallback to empty if no daily data
            return NextResponse.json({ users: [] })
        }

        // ALL TIME: Fetch all metrics and compute scores dynamically
        const { data, error } = await supabase
            .from('users')
            .select('id, name, username, avatar_url, total_commits, total_prs, total_issues, total_reviews, current_streak')
            .eq('show_on_leaderboard', true)
            .not('github_id', 'is', null)

        if (error) {
            console.error('Leaderboard fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
        }

        // Compute score dynamically for each user
        // Formula: (commits * 10) + (prs * 25) + (issues * 15) + (reviews * 20)
        const scoredUsers = (data || []).map(user => {
            const commits = user.total_commits || 0
            const prs = user.total_prs || 0
            const issues = user.total_issues || 0
            const reviews = user.total_reviews || 0

            // Calculate score using consistent formula
            const calculatedScore = (commits * 10) + (prs * 25) + (issues * 15) + (reviews * 20)

            return {
                ...user,
                productivity_score: calculatedScore,
                total_commits: commits
            }
        })

        // Sort by calculated score (highest first)
        const rankedUsers = scoredUsers
            .sort((a, b) => b.productivity_score - a.productivity_score)
            .slice(0, 50)
            .map((user, index) => ({
                ...user,
                rank: index + 1
            }))

        return NextResponse.json({ users: rankedUsers })
    } catch (error) {
        console.error('Leaderboard API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
