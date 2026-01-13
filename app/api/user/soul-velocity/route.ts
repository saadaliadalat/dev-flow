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

        // IMPORTANT: Use dbUser.id (Supabase UUID), NOT session.user.id (NextAuth ID)
        const { data: dailyStats } = await supabaseAdmin
            .from('daily_stats')
            .select('*')
            .eq('user_id', dbUser.id)
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

        // Calculate streak multiplier (up to 30% bonus for 15+ day streak)
        const streak = dailyStats?.filter((d: any) => (d.total_commits || 0) > 0).length || 0
        const streakMultiplier = Math.min(1 + streak * 0.02, 1.3)

        // Recency weight (higher if active recently)
        const mostRecentActivity = dailyStats?.[0]?.date
        let recencyWeight = 1
        if (mostRecentActivity) {
            const daysSince = (Date.now() - new Date(mostRecentActivity).getTime()) / (1000 * 60 * 60 * 24)
            recencyWeight = Math.max(0.5, 1 - daysSince * 0.03) // Decay 3% per day inactive
        }

        // New formula: (0.4×Depth + 0.4×Learning + 0.2×Risk) × recency × streak
        const baseScore = depth * 0.4 + learning * 0.4 + risk * 0.2
        const combined = Math.round(Math.min(100, baseScore * recencyWeight * streakMultiplier))

        // Build history array (last 14 days of estimated velocity)
        const history = dailyStats?.slice(0, 14).map((d: any) => {
            const commits = d.total_commits || 0
            const prs = d.total_prs || 0
            // Simple daily score estimate
            return Math.min(100, Math.round(30 + commits * 5 + prs * 10))
        }) || []

        return NextResponse.json({
            depth,
            learning,
            risk,
            combined,
            history,
            streak,
            recencyWeight: Math.round(recencyWeight * 100) / 100,
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
