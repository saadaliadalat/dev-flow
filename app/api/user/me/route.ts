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
        // Formula: commits * 10 + PRs * 25 + issues * 15 + reviews * 20
        if (user.productivity_score === 0 || user.productivity_score === null) {
            const totalCommits = user.total_commits || 0
            const totalPRs = user.total_prs || 0
            const totalIssues = user.total_issues || 0
            const totalReviews = user.total_reviews || 0

            // Productivity score formula: commits * 10 + PRs * 25 + issues * 15 + reviews * 20
            const rawScore = (totalCommits * 10) + (totalPRs * 25) + (totalIssues * 15) + (totalReviews * 20)

            // Normalize to 0-100 scale
            const calculatedScore = Math.min(Math.round((rawScore / 1500) * 100), 100)

            user.productivity_score = calculatedScore
            console.log(`Calculated fallback productivity score: ${calculatedScore} (commits: ${totalCommits}, PRs: ${totalPRs}, issues: ${totalIssues}, reviews: ${totalReviews})`)
        }

        // Ensure all required fields are present with defaults
        const sanitizedUser = {
            ...user,
            total_commits: user.total_commits ?? 0,
            total_prs: user.total_prs ?? 0,
            total_issues: user.total_issues ?? 0,
            total_reviews: user.total_reviews ?? 0,
            total_repos: user.total_repos ?? 0,
            current_streak: user.current_streak ?? 0,
            longest_streak: user.longest_streak ?? 0,
            productivity_score: user.productivity_score ?? 0,
            followers: user.followers ?? 0,
            following: user.following ?? 0
        }

        return NextResponse.json({
            user: sanitizedUser,
            dailyStats: dailyStats || []
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
