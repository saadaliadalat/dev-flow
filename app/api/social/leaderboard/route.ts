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
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') || 'global'
        const period = searchParams.get('period') || 'weekly'

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

        // Fetch users who allow leaderboard display
        const { data: users } = await supabase
            .from('users')
            .select('id, username, avatar_url, productivity_score, total_commits, current_streak')
            .eq('show_on_leaderboard', true)
            .order('productivity_score', { ascending: false })
            .limit(100)

        if (!users) {
            return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
        }

        // Add rank to each user
        const rankings = users.map((u, index) => ({
            rank: index + 1,
            user_id: u.id,
            username: u.username,
            avatar: u.avatar_url,
            score: u.productivity_score,
            total_commits: u.total_commits,
            current_streak: u.current_streak,
            isCurrentUser: u.id === user.id
        }))

        // Find current user's rank
        const currentUserRank = rankings.find(r => r.isCurrentUser)

        return NextResponse.json({
            success: true,
            leaderboard_type: type,
            period,
            rankings,
            currentUser: currentUserRank || null,
            total_users: rankings.length
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to fetch leaderboard',
            details: error.message
        }, { status: 500 })
    }
}
