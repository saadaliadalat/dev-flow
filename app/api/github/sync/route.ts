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

        // STEP 1: Fetch user profile
        const { data: profile } = await octokit.users.getAuthenticated()

        // STEP 2: Fetch all repositories
        let allRepos: any[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
            const { data: repos } = await octokit.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100,
                page,
                affiliation: 'owner,collaborator'
            })

            allRepos = [...allRepos, ...repos]
            hasMore = repos.length === 100
            page++

            // Limit to prevent rate limiting
            if (page > 5) break
        }

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

        // Upsert repositories
        const { error: repoError } = await supabase
            .from('repositories')
            .upsert(repoInserts, {
                onConflict: 'github_repo_id',
                ignoreDuplicates: false
            })

        if (repoError) {
            console.error('Repo upsert error:', repoError)
        }

        // STEP 4: Fetch commits for each repo (last 90 days)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const commitsByDay = new Map<string, any>()

        // Process repos in batches to avoid rate limits
        const reposToSync = allRepos.filter(r => !r.fork && !r.archived).slice(0, 30)

        for (const repo of reposToSync) {
            try {
                // Fetch commits from this repo
                const { data: commits } = await octokit.repos.listCommits({
                    owner: repo.owner.login,
                    repo: repo.name,
                    author: profile.login,
                    since: ninetyDaysAgo.toISOString(),
                    per_page: 100
                })

                // Process each commit
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

                    // Fetch commit details for lines changed
                    try {
                        const { data: commitDetails } = await octokit.repos.getCommit({
                            owner: repo.owner.login,
                            repo: repo.name,
                            ref: commit.sha
                        })

                        dayData.lines_added += commitDetails.stats?.additions || 0
                        dayData.lines_deleted += commitDetails.stats?.deletions || 0
                        dayData.files_changed += commitDetails.files?.length || 0
                    } catch (err) {
                        // Silently continue if commit details fail
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

            } catch (error) {
                console.error(`Error processing repo ${repo.name}:`, error)
                continue
            }
        }

        // STEP 5: Store daily stats
        const dailyStatsInserts = Array.from(commitsByDay.values()).map(day => {
            const languages = Object.entries(day.languages).sort((a: any, b: any) => b[1] - a[1])
            const primaryLanguage = languages[0]?.[0] || null

            // Calculate productivity score
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

        const { error: statsError } = await supabase
            .from('daily_stats')
            .upsert(dailyStatsInserts, {
                onConflict: 'user_id,date',
                ignoreDuplicates: false
            })

        if (statsError) {
            console.error('Stats upsert error:', statsError)
        }

        // STEP 6: Update user's aggregate stats
        const totalCommits = Array.from(commitsByDay.values())
            .reduce((sum, day) => sum + day.total_commits, 0)

        await supabase
            .from('users')
            .update({
                last_synced: new Date().toISOString(),
                total_commits: totalCommits,
                public_repos: allRepos.filter(r => !r.private).length,
                private_repos: allRepos.filter(r => r.private).length,
                total_repos: allRepos.length
            })
            .eq('id', userData.id)

        // STEP 7: Calculate streaks
        await calculateStreaks(userData.id)

        // STEP 8: Check for new achievements (async, don't wait)
        checkAndUnlockAchievements(userData.id).catch(err =>
            console.error('Achievement check failed:', err)
        )

        // STEP 9: Generate AI insights (async, don't wait)
        generateInsights(userData.id).catch(err =>
            console.error('Insight generation failed:', err)
        )

        return NextResponse.json({
            success: true,
            message: 'Sync completed successfully',
            stats: {
                repos_synced: allRepos.length,
                days_processed: commitsByDay.size,
                total_commits: totalCommits
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

    if (!stats || stats.length === 0) return

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let previousDate: Date | null = null

    // Sort dates ascending for easier processing
    const sortedStats = [...stats].reverse()

    for (const stat of sortedStats) {
        const currentDate = new Date(stat.date)

        if (!previousDate) {
            tempStreak = 1
        } else {
            const daysDiff = Math.floor(
                (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysDiff === 1) {
                tempStreak++
            } else {
                longestStreak = Math.max(longestStreak, tempStreak)
                tempStreak = 1
            }
        }

        previousDate = currentDate
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    // Check if streak is current (last commit was today or yesterday)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastCommitDate = new Date(stats[0].date)
    const daysSinceLastCommit = Math.floor(
        (today.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    currentStreak = daysSinceLastCommit <= 1 ? tempStreak : 0

    // Update user record
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
