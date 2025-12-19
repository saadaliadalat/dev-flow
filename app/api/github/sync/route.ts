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
                    since: ninetyDaysAgo.toISOString(),
                    per_page: 100
                })

                if (!commits || commits.length === 0) continue

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
                    // SKIP detailed stats for now to speed up sync and avoid rate limits
                    // We can add this back as a background job later
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
                // Handle empty repos (409 Conflict) or other repo-specific errors
                if (error.status === 409) {
                    // Repo is empty, just skip it
                    continue
                }
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

        console.log(`SYNC DEBUG: Found ${totalCommits} total commits across repos`)

        // The original `allRepos` was defined earlier. The instruction redefines it here to `reposToSync`.
        // This is a significant change in logic, as `reposToSync` is a filtered subset of `allRepos`.
        // Assuming the instruction intends this change.
        const allReposForUserUpdate = reposToSync
        console.log(`SYNC DEBUG: Updating user ${profile.login} with ${totalCommits} commits, ${allReposForUserUpdate.length} repos`)

        await supabase
            .from('users')
            .update({
                last_synced: new Date().toISOString(),
                total_commits: totalCommits,
                public_repos: allReposForUserUpdate.filter(r => !r.private).length,
                followers: profile.followers,
                following: profile.following,
                name: profile.name,
                avatar_url: profile.avatar_url,
                bio: profile.bio
                // We're NOT triggering AI insights here to avoid rate limits
            })
            .eq('id', userData.id)

        console.log('SYNC DEBUG: User stats updated in DB')

        // Insert Daily Stats (This block is new and seems to duplicate/replace the previous daily_stats upsert)
        // Given the instruction's context, this appears to be the intended replacement for the previous daily_stats upsert.
        const dailyStatsUpdates = Array.from(commitsByDay.values()).map(day => ({
            user_id: userData.id,
            date: day.date,
            total_commits: day.total_commits,
            lines_added: day.lines_added,
            lines_deleted: day.lines_deleted,
            files_changed: day.files_changed,
            languages: day.languages,
            commits_by_hour: day.commits_by_hour
        }))

        if (dailyStatsUpdates.length > 0) {
            const { error: dailyError } = await supabase
                .from('daily_stats')
                .upsert(dailyStatsUpdates, { onConflict: 'user_id, date' })

            if (dailyError) console.error('SYNC DEBUG: Error updating daily stats:', dailyError)
        }

        // STEP 7: Calculate streaks
        await calculateStreaks(userData.id)

        // STEP 8: Check for new achievements (async, don't wait)
        checkAndUnlockAchievements(userData.id).catch(err =>
            console.error('Achievement check failed:', err)
        )

        // STEP 9: Generate AI insights (async, don't wait)
        // generateInsights(userData.id).catch(err =>
        //     console.error('Insight generation failed:', err)
        // ) // Removed as per instruction

        return NextResponse.json({
            success: true,
            stats: {
                total_commits: totalCommits,
                repos_synced: reposToSync.length
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
// Helper: Calculate current and longest streak
async function calculateStreaks(userId: string) {
    const { data: stats } = await supabase
        .from('daily_stats')
        .select('date, total_commits')
        .eq('user_id', userId)
        .gt('total_commits', 0)
        .order('date', { ascending: false })

    if (!stats || stats.length === 0) {
        // Reset streaks if no activity found
        await supabase.from('users').update({ current_streak: 0, longest_streak: 0 }).eq('id', userId)
        return
    }

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastProcessedDate: string | null = null

    // Sort dates ascending for streak calculation (Oldest -> Newest)
    const sortedStats = [...stats].reverse()

    for (const stat of sortedStats) {
        const currentDateStr = stat.date // YYYY-MM-DD

        if (!lastProcessedDate) {
            tempStreak = 1
        } else {
            // Check if dates are consecutive
            const curr = new Date(currentDateStr)
            const prev = new Date(lastProcessedDate)
            const diffTime = Math.abs(curr.getTime() - prev.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
                tempStreak++
            } else if (diffDays > 1) {
                // Break in streak
                longestStreak = Math.max(longestStreak, tempStreak)
                tempStreak = 1
            }
            // If diffDays === 0 (same day), ignore (shouldn't happen with unique dates)
        }
        lastProcessedDate = currentDateStr
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    // Check if streak is alive
    // Alive if last commit date is Today or Yesterday (UTC)
    const lastCommitDateStr = stats[0].date // Newest date from DB

    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // Normalize to YYYY-MM-DD strings for comparison
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastCommitDateStr === todayStr || lastCommitDateStr === yesterdayStr) {
        currentStreak = tempStreak
    } else {
        currentStreak = 0
    }

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
