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
        // Get activity stats to calculate PERSONALIZED potential
        const { data: dailyStats } = await supabaseAdmin
            .from('daily_stats')
            .select('date, total_commits, total_prs')
            .eq('user_id', user.id)
            .order('date', { ascending: true })

        const createdAt = new Date(user.created_at).getTime()
        const firstActivity = dailyStats?.[0] ? new Date(dailyStats[0].date).getTime() : createdAt
        const startTime = Math.min(createdAt, firstActivity)

        const daysSinceJoin = Math.floor(
            (Date.now() - startTime) / (1000 * 60 * 60 * 24)
        )

        // Calculate user's ACTUAL average daily rate on active days
        const activeDays = dailyStats?.filter(d => (d.total_commits || 0) > 0) || []
        const avgCommitsPerActiveDay = activeDays.length > 0
            ? shipped.commits / activeDays.length
            : 2 // fallback
        const avgPRsPerActiveDay = activeDays.length > 0
            ? shipped.prs / Math.max(activeDays.length / 7, 1)
            : 0.5

        // Shadow = what if they maintained their BEST daily average every day?
        // This makes it personal - not a generic 2/day, but YOUR potential
        const bestDayCommits = Math.max(...(dailyStats?.map(d => d.total_commits || 0) || [1]))
        const sustainablePace = Math.max(avgCommitsPerActiveDay * 1.5, 3) // 50% above average or min 3

        const shadow = {
            commits: Math.round(daysSinceJoin * sustainablePace),
            prs: Math.round(daysSinceJoin / 5),                // 1 PR per 5 days
            reviews: Math.round(daysSinceJoin / 3),            // Review every 3 days
            issues: Math.round(daysSinceJoin / 10),
        }

        // Calculate realization ratio: (actual / potential) × 100
        // Formula: Shadow Self % = (potential - actual) / potential × 100
        const realization = {
            commits: shadow.commits > 0 ? Math.min(1, shipped.commits / shadow.commits) : 1,
            prs: shadow.prs > 0 ? Math.min(1, shipped.prs / shadow.prs) : 1,
            reviews: shadow.reviews > 0 ? Math.min(1, shipped.reviews / shadow.reviews) : 1,
            overall: 0,
        }

        // Weighted average: commits matter most, then PRs, then reviews
        realization.overall = (
            realization.commits * 0.5 +
            realization.prs * 0.3 +
            realization.reviews * 0.2
        )

        // Shadow percentage = what remains unrealized
        const shadowPercentage = Math.round((1 - realization.overall) * 100)

        // Generate confrontation message based on shadow %
        let message: string
        if (shadowPercentage <= 20) {
            message = "Your shadow has almost nothing on you. You've shipped what you started."
        } else if (shadowPercentage <= 40) {
            message = "Your shadow whispers of projects half-done. But you've come far."
        } else if (shadowPercentage <= 60) {
            message = "The shadow holds drafts and dreams. Each commit shrinks its power."
        } else if (shadowPercentage <= 80) {
            message = "The shadow looms large. But every line of code reclaims your potential."
        } else {
            message = "The shadow is vast. But every journey starts from the shore."
        }

        return NextResponse.json({
            shipped,
            shadow,
            realization,
            daysSinceJoin,
            activeDays: activeDays.length,
            avgCommitsPerActiveDay: Math.round(avgCommitsPerActiveDay * 10) / 10,
            bestDayCommits,
            shadowPercentage,
            message,
            // For visualization
            shippedTotal: shipped.commits + shipped.prs * 5 + shipped.reviews * 2,
            shadowTotal: shadow.commits + shadow.prs * 5 + shadow.reviews * 2,
            // Formula explanation
            formula: `Shadow% = (potential_${Math.round(sustainablePace)}×${daysSinceJoin}days - actual_${shipped.commits}) / potential × 100`,
        })
    } catch (error) {
        console.error('Shadow self error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
