import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const period = searchParams.get('period') || 'all-time'
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Get session to identify current user (optional)
        const session = await auth()
        let currentUserId = null

        if (session?.user) {
            const githubId = (session.user as any).githubId
            const { data: user } = await supabase
                .from('users')
                .select('id')
                .eq('github_id', githubId)
                .single()
            currentUserId = user?.id
        }

        // Build query - filter by show_on_leaderboard OR current user
        let query = supabase
            .from('users')
            .select('id, name, username, avatar_url, productivity_score, total_commits, current_streak, show_on_leaderboard')
            .eq('show_on_leaderboard', true)
            .order('productivity_score', { ascending: false })
            .range(offset, offset + limit - 1)

        const { data: users, error } = await query

        if (error) throw error

        // Calculate current user's rank if authenticated
        let userRank = null
        if (currentUserId) {
            const { data: rankData } = await supabase
                .from('users')
                .select('id, productivity_score')
                .eq('show_on_leaderboard', true)
                .order('productivity_score', { ascending: false })

            const rank = rankData?.findIndex(u => u.id === currentUserId)
            if (rank !== undefined && rank !== -1) {
                userRank = rank + 1
            }
        }

        return NextResponse.json({
            success: true,
            users: users || [],
            total: users?.length || 0,
            userRank,
            period
        })

    } catch (error: any) {
        console.error('Leaderboard fetch error:', error)
        return NextResponse.json({
            error: 'Failed to fetch leaderboard',
            details: error.message
        }, { status: 500 })
    }
}
