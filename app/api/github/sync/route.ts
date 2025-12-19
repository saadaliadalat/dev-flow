import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { createClient } from '@supabase/supabase-js'

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

        // Get user's GitHub token from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('github_access_token, username, id, github_id')
            .eq('github_id', (session.user as any).githubId)
            .single()

        if (userError || !userData?.github_access_token) {
            return NextResponse.json({ error: 'GitHub token not found' }, { status: 400 })
        }

        const octokit = new Octokit({
            auth: userData.github_access_token
        })

        console.log('=== STARTING COMPREHENSIVE GITHUB SYNC ===')

        // STEP 1: Fetch user profile
        const { data: profile } = await octokit.users.getAuthenticated()
        console.log(`Syncing for user: ${profile.login}`)

        // STEP 2: Fetch ALL repositories (no limit)
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

            // Remove limit - sync ALL repos
            if (page > 10) break // Safety limit: 1000 repos max
        }

        console.log(`Found ${allRepos.length} total repositories`)

        // STEP 3: Store repositories
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

        const { error: repoError } = await supabase
            .from('repositories')
            .upsert(repoInserts, {
                onConflict: 'github_repo_id',
                ignoreDuplicates: false
            })

        if (repoError) {
            console.error('Repo upsert error:', repoError)
        }

        // STEP 4: Fetch ALL GitHub Events (includes commits, PRs, issues, etc.)
        // This better matches GitHub's contribution graph
        let allEvents: any[] = []
        page = 1
        hasMore = true

        while (hasMore && page <= 10) {
            try {
                const { data: events } = await octokit.activity.listEventsForAuthenticatedUser({
                    username: profile.login,
                    per_page: 100,
                    page
                })

                allEvents = [...allEvents, ...events]
                hasMore = events.length === 100
                page++
            } catch (e) {
                console.error('Events fetch error:', e)
                break
            }
        }

        console.log(`Found ${allEvents.length} GitHub events`)

        // STEP 5: Fetch commits for EACH repo (year-to-date for accurate count)
        const yearStart = new Date(new Date().getFullYear(), 0, 1) // Jan 1st of current year
        const commitsByDay = new Map<string, any>()
        let totalCommitsThisYear = 0

        // Process ALL repos that aren't forks (to match GitHub's contribution count)
        const reposToSync = allRepos.filter(r => !r.fork && !r.archived)
        console.log(`Processing ${reposToSync.length} non-fork, non-archived repos...`)

        for (const repo of reposToSync) {
            try {
                // Fetch commits authored by this user for this year
                const { data: commits } = await octokit.repos.listCommits({
                    owner: repo.owner.login,
                    repo: repo.name,
                    author: profile.login, // Only this user's commits
                    since: yearStart.toISOString(),
                    per_page: 100
                })

                if (!commits || commits.length === 0) continue

                totalCommitsThisYear += commits.length

                // Process each commit for daily stats
                for (const commit of commits) {
                    const commitDate = new Date(commit.commit.author!.date!)
                    const dateKey = commitDate.toISOString().split('T')[0]
                    const hour = commitDate.getHours()

                    if (!commitsByDay.has(dateKey)) {
                        commitsByDay.set(dateKey, {
                            date: dateKey,
                            total_commits: 0,
                            commits_by_hour: {},
                            repos_contributed: new Set(),
                            languages: {},
                            lines_added: 0,
                            lines_deleted: 0,
                            files_changed: 0
                        })
                    }

                    const dayData = commitsByDay.get(dateKey)!
                    dayData.total_commits++
                    dayData.commits_by_hour[hour] = (dayData.commits_by_hour[hour] || 0) + 1
                    dayData.repos_contributed.add(repo.name)

                    if (repo.language) {
                        dayData.languages[repo.language] = (dayData.languages[repo.language] || 0) + 1
                    }
                }

                // Update repo commit count
                await supabase
                    .from('repositories')
                    .update({
                        user_commits: commits.length,
                        last_commit_date: commits[0]?.commit.author?.date
                    })
                    .eq('github_repo_id', repo.id)

            } catch (error: any) {
                if (error.status === 409) continue // Empty repo
                if (error.status === 403) {
                    console.log('Rate limit approaching, pausing...')
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
                continue
            }
        }

        console.log(`Total commits this year: ${totalCommitsThisYear}`)

        // STEP 6: Count other contributions from events (PRs, Issues, Reviews)
        let totalPRs = 0
        let totalIssues = 0
        let totalReviews = 0

        for (const event of allEvents) {
            if (event.type === 'PullRequestEvent') totalPRs++
            if (event.type === 'IssuesEvent') totalIssues++
            if (event.type === 'PullRequestReviewEvent') totalReviews++
        }

        console.log(`PRs: ${totalPRs}, Issues: ${totalIssues}, Reviews: ${totalReviews}`)

        // STEP 7: Store daily stats
        const dailyStatsInserts = Array.from(commitsByDay.values()).map(day => {
            const languages = Object.entries(day.languages).sort((a: any, b: any) => b[1] - a[1])
            const primaryLanguage = languages[0]?.[0] || null

            const productivityScore = calculateProductivityScore({
                total_commits: day.total_commits,
                lines_added: day.lines_added,
                lines_deleted: day.lines_deleted,
                unique_repos: day.repos_contributed.size,
                active_hours: Object.keys(day.commits_by_hour).length
            })

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
                lines_added: day.lines_added,
                lines_deleted: day.lines_deleted,
                net_lines: day.lines_added - day.lines_deleted,
                files_changed: day.files_changed,
                productivity_score: productivityScore,
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

        // STEP 8: Calculate streak
        await calculateStreaks(userData.id)

        // STEP 9: Calculate total contributions (commits + PRs + issues + reviews)
        const totalContributions = totalCommitsThisYear + totalPRs + totalIssues + totalReviews

        // STEP 10: Calculate productivity score
        const avgProductivityScore = dailyStatsInserts.length > 0
            ? Math.round(dailyStatsInserts.reduce((sum, d) => sum + d.productivity_score, 0) / dailyStatsInserts.length)
            : calculateProductivityScore({
                total_commits: totalCommitsThisYear,
                lines_added: 0,
                lines_deleted: 0,
                unique_repos: reposToSync.length,
                active_hours: 8
            })

        // STEP 11: Update user record with ALL stats
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
                productivity_score: avgProductivityScore
            })
            .eq('id', userData.id)

        console.log(`=== SYNC COMPLETE: ${totalCommitsThisYear} commits, ${totalContributions} total contributions ===`)

        // STEP 12: Check achievements
        checkAndUnlockAchievements(userData.id).catch(console.error)

        // STEP 13: Generate insights (if quota available)
        generateInsights(userData.id).catch(console.error)

        return NextResponse.json({
            success: true,
            stats: {
                total_commits: totalCommitsThisYear,
                total_contributions: totalContributions,
                total_prs: totalPRs,
                total_issues: totalIssues,
                repos_synced: reposToSync.length,
                days_with_activity: commitsByDay.size,
                productivity_score: avgProductivityScore
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

// Helper: Calculate productivity score
function calculateProductivityScore(data: {
    total_commits: number
    lines_added: number
    lines_deleted: number
    unique_repos: number
    active_hours: number
}): number {
    const {
        total_commits,
        lines_added,
        lines_deleted,
        unique_repos,
        active_hours
    } = data

    // Weighted scoring algorithm
    const commitScore = Math.min(total_commits * 5, 30)
    const volumeScore = Math.min(Math.log10(lines_added + 1) * 10, 25)
    const diversityScore = Math.min(unique_repos * 10, 20)
    const consistencyScore = Math.min(active_hours * 5, 25)

    const rawScore = commitScore + volumeScore + diversityScore + consistencyScore
    return Math.min(Math.round(rawScore), 100)
}

// Helper: Calculate current and longest streak
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

    // Get today and yesterday in local timezone
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Sort dates from newest to oldest
    const sortedDates = stats.map(s => s.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let expectedDate = new Date(todayStr)

    // Check if there's activity today or yesterday to start a streak
    if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
        // Start from the most recent activity date
        expectedDate = new Date(sortedDates[0])

        for (const dateStr of sortedDates) {
            const date = new Date(dateStr)
            const expectedStr = expectedDate.toISOString().split('T')[0]

            if (dateStr === expectedStr) {
                tempStreak++
                expectedDate.setDate(expectedDate.getDate() - 1)
            } else {
                // Gap in streak
                break
            }
        }
        currentStreak = tempStreak
    }

    // Calculate longest streak ever
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

    console.log(`Streak calculation: current=${currentStreak}, longest=${longestStreak}`)

    await supabase
        .from('users')
        .update({
            current_streak: currentStreak,
            longest_streak: longestStreak
        })
        .eq('id', userId)
}

// Helper: Check and unlock achievements
async function checkAndUnlockAchievements(userId: string) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    await fetch(`${baseUrl}/api/achievements/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    })
}

// Helper: Generate AI insights
async function generateInsights(userId: string) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    await fetch(`${baseUrl}/api/insights/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    })
}
