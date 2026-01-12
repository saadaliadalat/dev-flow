import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🌘 SHADOW SELF
 * The haunting visualization of the version of you that never shipped.
 * Compares actual output vs potential (repos created but not deployed/active).
 */

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, total_commits, total_prs, total_repos, total_reviews, total_issues, created_at')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Calculate "shipped" metrics (actual impact)
        const shipped = {
            commits: user.total_commits || 0,
            prs: user.total_prs || 0,
            reviews: user.total_reviews || 0,
            issues: user.total_issues || 0,
        }

        // Calculate "shadow" metrics (potential that wasn't realized)
        // Get earliest activity date to properly calculate "Shadow" potential
        // If user imported history, their activity might predate their account creation
        const { data: firstStat } = await supabaseAdmin
            .from('daily_stats')
            .select('date')
            .eq('user_id', user.id)
            .order('date', { ascending: true })
            .limit(1)
            .single()

        const createdAt = new Date(user.created_at).getTime()
        const firstActivity = firstStat ? new Date(firstStat.date).getTime() : createdAt
        const startTime = Math.min(createdAt, firstActivity)

        // Shadow = theoretical max based on time vs actual output
        const daysSinceJoin = Math.floor(
            (Date.now() - startTime) / (1000 * 60 * 60 * 24)
        )

        // Theoretical: 2 commits/day, 1 PR/week, 1 review every 2 days
        const shadow = {
            commits: Math.round(daysSinceJoin * 2),            // Could have committed 2x/day
            prs: Math.round(daysSinceJoin / 7),                // Could have opened 1 PR/week
            reviews: Math.round(daysSinceJoin / 2),            // Could have reviewed every 2 days
            issues: Math.round(daysSinceJoin / 14),            // Could have opened issue biweekly
        }

        // Calculate realization ratio (how much of potential was realized)
        const realization = {
            commits: shadow.commits > 0 ? Math.min(1, shipped.commits / shadow.commits) : 1,
            prs: shadow.prs > 0 ? Math.min(1, shipped.prs / shadow.prs) : 1,
            reviews: shadow.reviews > 0 ? Math.min(1, shipped.reviews / shadow.reviews) : 1,
            overall: 0,
        }
        realization.overall = (realization.commits + realization.prs + realization.reviews) / 3

        // Generate confrontation message
        let message: string
        if (realization.overall >= 0.8) {
            message = "Your shadow has almost nothing on you. You've shipped what you started."
        } else if (realization.overall >= 0.5) {
            message = "Your shadow whispers of projects half-done. But you've come far."
        } else if (realization.overall >= 0.2) {
            message = "The shadow holds many drafts. But you chose to ship some. That's what counts."
        } else {
            message = "The shadow is vast. But every ship voyage starts from the shore."
        }

        return NextResponse.json({
            shipped,
            shadow,
            realization,
            daysSinceJoin,
            message,
            // For visualization
            shippedTotal: shipped.commits + shipped.prs * 5 + shipped.reviews * 2,
            shadowTotal: shadow.commits + shadow.prs * 5 + shadow.reviews * 2,
        })
    } catch (error) {
        console.error('Shadow self error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
