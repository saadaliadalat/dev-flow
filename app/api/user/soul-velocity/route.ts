import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * GET /api/user/soul-velocity
 * Returns the user's Soul Velocity metrics (Depth, Learning, Risk).
 */
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from DB
        const githubId = (session.user as any).githubId
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get user's recent commits from daily_stats
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]

        const { data: dailyStats } = await supabaseAdmin
            .from('daily_stats')
            .select('*')
            .eq('user_id', session.user.id)
            .gte('date', thirtyDaysAgo)
            .order('date', { ascending: false })

        // Calculate metrics based on available data
        // For now, using simplified heuristics

        let depth = 50
        let learning = 50
        let risk = 50

        if (dailyStats && dailyStats.length > 0) {
            // Depth: consistency of commits (not too scattered)
            const totalCommits = dailyStats.reduce((sum, d) => sum + (d.total_commits || 0), 0)
            const activeDays = dailyStats.filter(d => (d.total_commits || 0) > 0).length
            const avgPerActiveDay = activeDays > 0 ? totalCommits / activeDays : 0
            depth = Math.min(100, Math.round(40 + avgPerActiveDay * 8))

            // Learning: variety in activity (commits + PRs + issues)
            const prDays = dailyStats.filter(d => (d.total_prs || 0) > 0).length
            const diversityRatio = prDays / Math.max(activeDays, 1)
            learning = Math.min(100, Math.round(35 + diversityRatio * 50 + activeDays * 2))

            // Risk: new activity patterns (recent uptick)
            const recentWeek = dailyStats.slice(0, 7)
            const olderWeek = dailyStats.slice(7, 14)
            const recentTotal = recentWeek.reduce((sum, d) => sum + (d.total_commits || 0), 0)
            const olderTotal = olderWeek.reduce((sum, d) => sum + (d.total_commits || 0), 0)
            const growthRatio = olderTotal > 0 ? recentTotal / olderTotal : 1
            risk = Math.min(100, Math.round(40 + (growthRatio - 1) * 30 + Math.min(activeDays, 14) * 3))
        }

        // Ensure bounds
        depth = Math.max(0, Math.min(100, depth))
        learning = Math.max(0, Math.min(100, learning))
        risk = Math.max(0, Math.min(100, risk))

        const combined = Math.round(depth * 0.3 + learning * 0.4 + risk * 0.3)

        return NextResponse.json({
            depth,
            learning,
            risk,
            combined,
            message: getSoulMessage(combined),
        })
    } catch (error) {
        console.error('Soul velocity error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

function getSoulMessage(score: number): string {
    if (score >= 80) return "You're in flow state. The code speaks through you."
    if (score >= 60) return "Solid velocity. You're building something meaningful."
    if (score >= 40) return "Steady progress. Consider taking a creative risk."
    if (score >= 20) return "Warming up. Every commit is a step forward."
    return "The journey begins with a single push."
}
