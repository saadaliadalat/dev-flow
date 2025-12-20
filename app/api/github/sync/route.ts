import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Rate limit: 1 sync per 5 minutes
const SYNC_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's GitHub token from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('github_access_token, username, id, github_id, email, last_synced')
            .eq('github_id', (session.user as any).githubId)
            .single()

        if (userError || !userData?.github_access_token) {
            return NextResponse.json({ error: 'GitHub token not found' }, { status: 400 })
        }

        // Rate limiting check
        if (userData.last_synced) {
            const lastSyncTime = new Date(userData.last_synced).getTime()
            const timeSinceSync = Date.now() - lastSyncTime
            if (timeSinceSync < SYNC_COOLDOWN_MS) {
                const waitMinutes = Math.ceil((SYNC_COOLDOWN_MS - timeSinceSync) / 60000)
                return NextResponse.json({
                    error: 'Rate limited',
                    message: `Please wait ${waitMinutes} minute(s) before syncing again.`,
                    retryAfter: waitMinutes
                }, { status: 429 })
            }
        }

        const octokit = new Octokit({
            auth: userData.github_access_token
        })

        console.log('=== STARTING ACCURATE GITHUB SYNC ===')

        // STEP 1: Fetch user profile and emails
        const { data: profile } = await octokit.users.getAuthenticated()
        console.log(`Syncing for user: ${profile.login}`)

        // Get all emails associated with GitHub account (for accurate commit matching)
        let userEmails: string[] = []
        try {
            const { data: emails } = await octokit.users.listEmailsForAuthenticatedUser()
            userEmails = emails.map(e => e.email)
            console.log(`User emails for commit matching: ${userEmails.join(', ')}`)
        } catch (e) {
            console.log('Could not fetch emails, will use username only')
        }

        // STEP 2: Fetch ALL repositories (for display purposes)
        let allRepos: any[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
            const { data: repos } = await octokit.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100,
                page,
                affiliation: 'owner,collaborator,organization_member'
            })

            allRepos = [...allRepos, ...repos]
            hasMore = repos.length === 100
            page++
            if (page > 10) break
        }

        console.log(`Found ${allRepos.length} repositories`)

        // Store repositories
        const repoInserts = allRepos.map(repo => ({
            user_id: userData.id,
            github_repo_id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            homepage: repo.homepage,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.watchers_count,
            open_issues: repo.open_issues_count,
            is_fork: repo.fork,
            is_private: repo.private,
            is_archived: repo.archived,
            github_created_at: repo.created_at,
            github_updated_at: repo.updated_at,
            github_pushed_at: repo.pushed_at
        }))

        await supabase.from('repositories').upsert(repoInserts, {
            onConflict: 'github_repo_id',
            ignoreDuplicates: false
        })

        // STEP 3: Use SEARCH API to get ALL commits (most accurate method)
        // This finds commits across ALL repos, including ones where PRs were merged
        const yearStart = new Date(new Date().getFullYear(), 0, 1)
        const yearStartStr = yearStart.toISOString().split('T')[0]

        console.log('=== USING SEARCH API FOR ACCURATE COMMIT COUNT ===')

        let totalCommitsThisYear = 0
        const commitsByDay = new Map<string, any>()
        const reposWithCommits = new Set<string>()

        // Search for commits by username
        let searchPage = 1
        let hasMoreCommits = true

        while (hasMoreCommits && searchPage <= 20) { // Increased to 2000 commits max
            try {
                // GitHub Search API for commits - finds ALL commits by this user
                const { data: searchResult } = await octokit.search.commits({
                    q: `author:${profile.login} committer-date:>=${yearStartStr}`,
                    sort: 'committer-date',
                    order: 'desc',
                    per_page: 100,
                    page: searchPage
                })

                if (searchPage === 1) {
                    console.log(`Search API found ${searchResult.total_count} total commits this year`)
                    // Use the total_count from search API - this is the accurate number!
                    totalCommitsThisYear = searchResult.total_count
                }

                // Process commits for daily stats
                for (const item of searchResult.items) {
                    const commitDate = new Date(item.commit.author?.date || item.commit.committer?.date || '')
                    const dateKey = commitDate.toISOString().split('T')[0]
                    const hour = commitDate.getHours()
                    const repoName = item.repository?.full_name || 'unknown'

                    reposWithCommits.add(repoName)

                    if (!commitsByDay.has(dateKey)) {
                        commitsByDay.set(dateKey, {
                            date: dateKey,
                            total_commits: 0,
                            commits_by_hour: {},
                            repos_contributed: new Set(),
                            languages: {}
                        })
                    }

                    const dayData = commitsByDay.get(dateKey)!
                    dayData.total_commits++
                    dayData.commits_by_hour[hour] = (dayData.commits_by_hour[hour] || 0) + 1
                    dayData.repos_contributed.add(repoName)

                    // Try to get language from repo info
                    if (item.repository?.language) {
                        dayData.languages[item.repository.language] = (dayData.languages[item.repository.language] || 0) + 1
                    }
                }

                hasMoreCommits = searchResult.items.length === 100
                searchPage++

                // Small delay to avoid rate limiting
                if (hasMoreCommits) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                }

            } catch (error: any) {
                console.error('Search API error:', error.message)
                if (error.status === 403) {
                    console.log('Rate limited, waiting...')
                    await new Promise(resolve => setTimeout(resolve, 5000))
                } else {
                    break
                }
            }
        }

        console.log(`Processed commits across ${reposWithCommits.size} repositories`)
        console.log(`Total commits this year (from Search API): ${totalCommitsThisYear}`)

        // STEP 4: Get PRs, Issues, Reviews using Search API (most accurate)
        let totalPRs = 0
        let totalIssues = 0
        let totalReviews = 0

        try {
            // Count PRs - Search API gives accurate total
            const { data: prSearch } = await octokit.search.issuesAndPullRequests({
                q: `author:${profile.login} type:pr created:>=${yearStartStr}`,
                per_page: 1
            })
            totalPRs = prSearch.total_count
            console.log(`PRs this year: ${totalPRs}`)

            // Count Issues
            const { data: issueSearch } = await octokit.search.issuesAndPullRequests({
                q: `author:${profile.login} type:issue created:>=${yearStartStr}`,
                per_page: 1
            })
            totalIssues = issueSearch.total_count
            console.log(`Issues this year: ${totalIssues}`)

            // Count Reviews (search for reviewed PRs)
            const { data: reviewSearch } = await octokit.search.issuesAndPullRequests({
                q: `reviewed-by:${profile.login} type:pr created:>=${yearStartStr}`,
                per_page: 1
            })
            totalReviews = reviewSearch.total_count
            console.log(`PR Reviews this year: ${totalReviews}`)

        } catch (searchError: any) {
            console.error('Search error:', searchError.message)
        }

        // STEP 5: Store daily stats
        const dailyStatsInserts = Array.from(commitsByDay.values()).map(day => {
            const languages = Object.entries(day.languages).sort((a: any, b: any) => b[1] - a[1])
            const primaryLanguage = languages[0]?.[0] || null

            return {
                user_id: userData.id,
                date: day.date,
                total_commits: day.total_commits,
                commits_by_hour: day.commits_by_hour,
                active_hours: Object.keys(day.commits_by_hour).length,
                repos_contributed: Array.from(day.repos_contributed).map(name => ({ name, commits: 1 })),
                unique_repos: day.repos_contributed.size,
                languages: day.languages,
                primary_language: primaryLanguage,
                lines_added: 0,
                lines_deleted: 0,
                net_lines: 0,
                files_changed: 0,
                productivity_score: Math.min(day.total_commits * 10, 100),
                is_weekend: new Date(day.date).getDay() % 6 === 0
            }
        })

        if (dailyStatsInserts.length > 0) {
            const { error: statsError } = await supabase
                .from('daily_stats')
                .upsert(dailyStatsInserts, {
                    onConflict: 'user_id,date',
                    ignoreDuplicates: false
                })

            if (statsError) {
                console.error('Stats upsert error:', statsError)
            }
        }

        // STEP 6: Calculate streak from daily stats
        await calculateStreaks(userData.id)

        // STEP 7: Calculate total contributions (GitHub-style)
        const totalContributions = totalCommitsThisYear + totalPRs + totalIssues + totalReviews

        // STEP 8: Calculate productivity score
        // Formula: commits * 10 + PRs * 25 + issues * 15 + reviews * 20
        const rawScore = (totalCommitsThisYear * 10) + (totalPRs * 25) + (totalIssues * 15) + (totalReviews * 20)
        const productivityScore = Math.min(Math.round((rawScore / 1500) * 100), 100)

        // STEP 9: Update user with accurate stats
        await supabase
            .from('users')
            .update({
                last_synced: new Date().toISOString(),
                total_commits: totalCommitsThisYear,
                total_contributions: totalContributions,
                total_prs: totalPRs,
                total_issues: totalIssues,
                total_reviews: totalReviews,
                total_repos: allRepos.length,
                public_repos: allRepos.filter(r => !r.private).length,
                followers: profile.followers,
                following: profile.following,
                name: profile.name,
                avatar_url: profile.avatar_url,
                bio: profile.bio,
                productivity_score: productivityScore
            })
            .eq('id', userData.id)

        console.log('=== SYNC COMPLETE ===')
        console.log(`Commits: ${totalCommitsThisYear}`)
        console.log(`PRs: ${totalPRs}`)
        console.log(`Issues: ${totalIssues}`)
        console.log(`Reviews: ${totalReviews}`)
        console.log(`Total Contributions: ${totalContributions}`)

        // STEP 10: Background tasks
        checkAndUnlockAchievements(userData.id).catch(console.error)
        generateInsights(userData.id).catch(console.error)

        return NextResponse.json({
            success: true,
            stats: {
                total_commits: totalCommitsThisYear,
                total_contributions: totalContributions,
                total_prs: totalPRs,
                total_issues: totalIssues,
                total_reviews: totalReviews,
                repos_synced: allRepos.length,
                repos_with_commits: reposWithCommits.size,
                days_with_activity: commitsByDay.size,
                productivity_score: productivityScore
            }
        })

    } catch (error: any) {
        console.error('Sync error:', error)
        return NextResponse.json({
            error: 'Sync failed',
            details: error.message
        }, { status: 500 })
    }
}

// Calculate current and longest streak
async function calculateStreaks(userId: string) {
    const { data: stats } = await supabase
        .from('daily_stats')
        .select('date, total_commits')
        .eq('user_id', userId)
        .gt('total_commits', 0)
        .order('date', { ascending: false })

    if (!stats || stats.length === 0) {
        await supabase.from('users').update({ current_streak: 0, longest_streak: 0 }).eq('id', userId)
        return
    }

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const sortedDates = stats.map(s => s.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Current streak: must have activity today or yesterday
    if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
        let expectedDate = new Date(sortedDates[0])

        for (const dateStr of sortedDates) {
            const expectedStr = expectedDate.toISOString().split('T')[0]

            if (dateStr === expectedStr) {
                tempStreak++
                expectedDate.setDate(expectedDate.getDate() - 1)
            } else {
                break
            }
        }
        currentStreak = tempStreak
    }

    // Longest streak calculation
    tempStreak = 1
    for (let i = 1; i < sortedDates.length; i++) {
        const curr = new Date(sortedDates[i])
        const prev = new Date(sortedDates[i - 1])
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
            tempStreak++
        } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

    console.log(`Streak: current=${currentStreak}, longest=${longestStreak}`)

    await supabase
        .from('users')
        .update({ current_streak: currentStreak, longest_streak: longestStreak })
        .eq('id', userId)
}

async function checkAndUnlockAchievements(userId: string) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    await fetch(`${baseUrl}/api/achievements/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    })
}

async function generateInsights(userId: string) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    await fetch(`${baseUrl}/api/insights/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    })
}
