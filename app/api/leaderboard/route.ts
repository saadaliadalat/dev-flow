import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'all'

        let query = supabase
            .from('users')
            .select('id, name, username, avatar_url, productivity_score, total_commits, current_streak')
            .eq('show_on_leaderboard', true)
            .order('productivity_score', { ascending: false })
            .limit(50)

        // For time-based filtering, we'd need to join with daily_stats
        // For now, we'll use the all-time scores but this can be enhanced
        if (period === 'daily' || period === 'weekly') {
            // In a real implementation, you'd calculate scores from daily_stats
            // For now, we still use productivity_score but this is where you'd add time filtering
            const days = period === 'daily' ? 1 : 7

            // Fetch from daily_stats for the period
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
        }

        // Default: all-time rankings
        const { data, error } = await query

        if (error) {
            console.error('Leaderboard fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
        }

        // Add rank to each user
        const rankedUsers = (data || []).map((user, index) => ({
            ...user,
            rank: index + 1
        }))

        return NextResponse.json({ users: rankedUsers })
    } catch (error) {
        console.error('Leaderboard API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
