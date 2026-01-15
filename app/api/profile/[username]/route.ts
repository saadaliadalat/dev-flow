import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

/**
 * GET /api/profile/[username]
 * Get public profile data for a user
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const { username } = params

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 })
        }

        // Get user data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select(`
                id,
                username,
                name,
                avatar_url,
                bio,
                github_url,
                current_streak,
                longest_streak,
                total_commits,
                total_prs,
                productivity_score,
                xp,
                level,
                level_title,
                developer_dna,
                created_at
            `)
            .eq('username', username)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get public profile settings
        const { data: profile } = await supabase
            .from('public_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // If profile exists and is not public, return 404
        if (profile && !profile.is_public) {
            return NextResponse.json({ error: 'Profile is private' }, { status: 404 })
        }

        // Get recent achievements
        const { data: achievements } = await supabase
            .from('achievements')
            .select('id, name, description, icon, tier, unlocked_at')
            .eq('user_id', user.id)
            .eq('unlocked', true)
            .order('unlocked_at', { ascending: false })
            .limit(6)

        // Get activity data (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: activity } = await supabase
            .from('daily_stats')
            .select('date, total_commits, lines_added, lines_deleted')
            .eq('user_id', user.id)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: true })

        // Calculate stats
        const stats = {
            totalCommits: user.total_commits || 0,
            totalPRs: user.total_prs || 0,
            currentStreak: user.current_streak || 0,
            longestStreak: user.longest_streak || 0,
            productivityScore: user.productivity_score || 0,
            xp: user.xp || 0,
            level: user.level || 1,
            levelTitle: user.level_title || 'Newcomer',
            memberSince: user.created_at,
        }

        // Get challenge stats
        const { data: challengeStats } = await supabase
            .from('challenges')
            .select('id, winner_id')
            .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
            .eq('status', 'completed')

        const challengesWon = challengeStats?.filter(c => c.winner_id === user.id).length || 0
        const challengesPlayed = challengeStats?.length || 0

        // Track view (if this was a real page view)
        if (profile) {
            await supabase
                .from('public_profiles')
                .update({ view_count: (profile.view_count || 0) + 1 })
                .eq('user_id', user.id)
        }

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                avatarUrl: user.avatar_url,
                bio: user.bio,
                githubUrl: user.github_url,
                developerDna: user.developer_dna,
            },
            stats,
            achievements: achievements || [],
            activity: activity || [],
            challenges: {
                won: challengesWon,
                played: challengesPlayed,
                winRate: challengesPlayed > 0 ? Math.round((challengesWon / challengesPlayed) * 100) : 0,
            },
            profile: profile ? {
                openToWork: profile.open_to_work,
                openToFreelance: profile.open_to_freelance,
                twitterUrl: profile.twitter_url,
                linkedinUrl: profile.linkedin_url,
                portfolioUrl: profile.portfolio_url,
            } : null,
        })
    } catch (error) {
        console.error('Profile API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
