import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Octokit } from '@octokit/rest'
import { auth } from '@/lib/auth'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GraphQL query for accurate contribution calendar
const CONTRIBUTION_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
`

// Fetch real contribution data from GitHub GraphQL API
async function fetchContributionCalendar(token: string, username: string): Promise<{ date: string, count: number }[]> {
    try {
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: CONTRIBUTION_QUERY,
                variables: { username }
            })
        })

        const data = await response.json()

        if (data.errors) {
            console.error('GraphQL errors:', data.errors)
            return []
        }

        const weeks = data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []
        const contributions: { date: string, count: number }[] = []

        for (const week of weeks) {
            for (const day of week.contributionDays) {
                if (day.contributionCount > 0) {
                    contributions.push({ date: day.date, count: day.contributionCount })
                }
            }
        }

        console.log(`GraphQL fetched ${contributions.length} days with contributions`)
        return contributions
    } catch (error) {
        console.error('GraphQL contribution fetch failed:', error)
        return []
    }
}

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

        // Helper: Get local date string YYYY-MM-DD
        const getLocalDateStr = (date: Date): string => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        // ACCURATE STREAK: Use GraphQL contribution calendar (real GitHub contribution graph data!)
        let contributionDates: Set<string> = new Set()

        // Try GraphQL first (most accurate)
        if (githubToken) {
            const contributions = await fetchContributionCalendar(githubToken, username)
            if (contributions.length > 0) {
                contributions.forEach(c => contributionDates.add(c.date))
                console.log(`✅ Using GraphQL contribution data: ${contributions.length} days with activity`)
            }
        }

        // Fallback to Events API if GraphQL failed
        if (contributionDates.size === 0) {
            console.log('⚠️ GraphQL failed, falling back to Events API...')
            const { data: events } = await octokit.activity.listPublicEventsForUser({
                username,
                per_page: 100
            })

            events
                .filter(e => e.type === 'PushEvent' && e.created_at)
                .forEach(e => {
                    const d = new Date(e.created_at!)
                    contributionDates.add(getLocalDateStr(d))
                })
        }

        // Calculate streak
        let currentStreak = 0
        const today = new Date()
        const todayStr = getLocalDateStr(today)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = getLocalDateStr(yesterday)

        // Sort dates (newest first)
        const sortedDates = Array.from(contributionDates).sort((a, b) => b.localeCompare(a))

        console.log(`Contribution dates (recent 5): ${sortedDates.slice(0, 5).join(', ')}`)
        console.log(`Today: ${todayStr}, Yesterday: ${yesterdayStr}`)

        // Streak logic: check continuous days backwards
        if (sortedDates.length > 0) {
            // Start from most recent contribution
            const mostRecent = sortedDates[0]

            // Only count if most recent is today or yesterday
            if (mostRecent === todayStr || mostRecent === yesterdayStr) {
                let expectedDate = new Date(mostRecent)

                for (const dateStr of sortedDates) {
                    const expectedStr = getLocalDateStr(expectedDate)

                    if (dateStr === expectedStr) {
                        currentStreak++
                        expectedDate.setDate(expectedDate.getDate() - 1)
                    } else if (dateStr < expectedStr) {
                        // Gap found
                        break
                    }
                }
            }
        }

        console.log(`🔥 Calculated streak: ${currentStreak}`)

        // 5. Get existing user data for longest_streak comparison
        const { data: existingUser } = await supabase
            .from('users')
            .select('longest_streak, total_commits')
            .eq('email', session.user.email)
            .single()

        // Preserve existing total commits (accurate count comes from main sync)
        const existingTotal = existingUser?.total_commits || 0
        const newTotalCommits = existingTotal // Don't estimate, let main sync handle this

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
