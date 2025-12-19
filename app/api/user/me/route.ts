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

        // Priority 1: Fetch by GitHub ID (Most reliable)
        const githubId = (session.user as any).githubId
        let user = null

        if (githubId) {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('github_id', githubId)
                .single()
            user = data
        }

        // Priority 2: Fetch by Email
        if (!user && session.user.email) {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('email', session.user.email)
                .single()
            user = data
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
        }

        // Fetch Daily Stats (Last 7 Days)
        const { data: dailyStats } = await supabase
            .from('daily_stats')
            .select('date, total_commits')
            .eq('user_id', user.id)
            .order('date', { ascending: false }) // Get NEWEST first
            .limit(7)

        // Calculate productivity score if it's 0 (fallback)
        if (user.productivity_score === 0 && dailyStats && dailyStats.length > 0) {
            const totalCommits = dailyStats.reduce((sum: number, d: any) => sum + (d.total_commits || 0), 0)
            const avgCommitsPerDay = totalCommits / dailyStats.length

            // Simple productivity calculation based on activity
            const calculatedScore = Math.min(Math.round(
                (avgCommitsPerDay * 10) + // Commits weight
                (user.current_streak * 2) + // Streak bonus
                (user.total_repos * 0.5)   // Repo diversity
            ), 100)

            user.productivity_score = calculatedScore
            console.log(`Calculated fallback productivity score: ${calculatedScore}`)
        }

        return NextResponse.json({
            user,
            dailyStats: dailyStats || []
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
