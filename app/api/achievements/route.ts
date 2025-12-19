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
            .select('id, total_commits, current_streak, longest_streak, productivity_score')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch user's unlocked achievements
        const { data: userAchievements } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', user.id)

        // Calculate summary stats
        const unlocked = userAchievements?.filter(a => a.is_unlocked) || []
        const pending = userAchievements?.filter(a => !a.is_unlocked && a.current_progress > 0) || []

        return NextResponse.json({
            success: true,
            achievements: userAchievements || [],
            stats: {
                total: userAchievements?.length || 0,
                unlocked: unlocked.length,
                pending: pending.length,
                locked: (userAchievements?.length || 0) - unlocked.length
            }
        })

    } catch (error: any) {
        console.error('Achievements fetch error:', error)
        return NextResponse.json({
            error: 'Failed to fetch achievements',
            details: error.message
        }, { status: 500 })
    }
}
