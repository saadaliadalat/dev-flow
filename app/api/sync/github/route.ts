import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Octokit } from '@octokit/rest'
import { auth } from '@/lib/auth'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const username = searchParams.get('username') || (session.user as any).username

        // 1. Get GitHub Token (Start with provided header, fallback to system token)
        const authHeader = req.headers.get('Authorization')
        let githubToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : process.env.GITHUB_ACCESS_TOKEN

        // Initialize Octokit
        const octokit = new Octokit({
            auth: githubToken
        })

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 })
        }

        console.log(`🔄 Syncing GitHub data for ${username}...`)

        // 2. Fetch User Data
        const { data: userProfile } = await octokit.users.getByUsername({ username })

        // 3. Fetch Repositories (Public)
        const { data: repos } = await octokit.repos.listForUser({
            username,
            sort: 'updated',
            per_page: 100,
            type: 'all'
        })

        // 4. Calculate Stats
        const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)
        const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0)

        // Calculate Languages
        const languages: Record<string, number> = {}
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1
            }
        })

        // Calculate Streak (Simplified: Check recent events)
        // Note: Exact contribution graph requires GraphQL API or scraping, 
        // using events gives us "recent streak" approximation.
        const { data: events } = await octokit.activity.listPublicEventsForUser({
            username,
            per_page: 100
        })

        let currentStreak = 0
        const today = new Date().toISOString().split('T')[0]
        const eventDates = new Set(events.map(e => (e.created_at ? e.created_at.split('T')[0] : '')))

        // Simple streak logic (check continuous days backwards)
        let checkDate = new Date()
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0]
            if (eventDates.has(dateStr)) {
                currentStreak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else if (dateStr === today && !eventDates.has(today)) {
                // Allow "today not done yet" if yesterday was done
                checkDate.setDate(checkDate.getDate() - 1)
                continue
            } else {
                break
            }
        }

        // 5. Get existing user data for longest_streak comparison
        const { data: existingUser } = await supabase
            .from('users')
            .select('longest_streak, total_commits')
            .eq('email', session.user.email)
            .single()

        // Calculate commits from push events (each push averages ~3 commits)
        const recentPushCount = events.filter(e => e.type === 'PushEvent').length
        const estimatedRecentCommits = recentPushCount * 3

        // Preserve existing total if higher, otherwise add recent activity
        const existingTotal = existingUser?.total_commits || 0
        const newTotalCommits = Math.max(existingTotal, existingTotal + estimatedRecentCommits)

        // Track longest streak properly
        const existingLongest = existingUser?.longest_streak || 0
        const newLongestStreak = Math.max(existingLongest, currentStreak)

        // 6. Update Supabase User with REAL data
        const { error: updateError } = await supabase
            .from('users')
            .update({
                public_repos: userProfile.public_repos,
                followers: userProfile.followers,
                following: userProfile.following,
                total_repos: userProfile.public_repos,
                total_commits: newTotalCommits,
                current_streak: currentStreak, // Real streak, no fake fallback
                longest_streak: newLongestStreak, // Track actual longest
                last_synced: new Date().toISOString()
            })
            .eq('email', session.user.email)

        if (updateError) throw updateError

        return NextResponse.json({
            success: true,
            stats: {
                username,
                repos: repos.length,
                stars: totalStars,
                streak: currentStreak,
                languages
            }
        })

    } catch (error: any) {
        console.error('GitHub Sync Error:', error)
        return NextResponse.json({
            error: 'Failed to sync GitHub data',
            details: error.message
        }, { status: 500 })
    }
}
