import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Octokit } from '@octokit/rest'
import { createClient } from '@supabase/supabase-js'
import { calculateLevel, XP_REWARDS } from '@/lib/xp'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Rate limit reduced for debugging (1 minute)
const SYNC_COOLDOWN_MS = 1 * 60 * 1000

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

        console.log('=== STARTING ACCURATE GITHUB SYNC (ALL TIME) ===')

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

        // Batch repos upsert just in case
        for (let i = 0; i < repoInserts.length; i += 100) {
            const batch = repoInserts.slice(i, i + 100)
            await supabase.from('repositories').upsert(batch, {
                onConflict: 'github_repo_id',
                ignoreDuplicates: false
            })
        }

        // STEP 3: Use SEARCH API to get ALL commits (most accurate method)
        // We use 2015 as a safe "All Time" starting point to capture full history
        const yearStart = new Date('2015-01-01')
        const yearStartStr = yearStart.toISOString().split('T')[0]

        console.log('=== USING SEARCH API FOR ACCURATE COMMIT COUNT (2015+) ===')

        let totalCommits = 0
        const commitsByDay = new Map<string, any>()
        const reposWithCommits = new Set<string>()

        // Search for commits by username
        let searchPage = 1
        let hasMoreCommits = true

        // Increased limit to 50 pages (5000 commits detailed stats max)
        while (hasMoreCommits && searchPage <= 50) {
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
                    console.log(`Search API found ${searchResult.total_count} total commits since 2015`)
                    // Use the total_count from search API - this is the accurate All Time number!
                    totalCommits = searchResult.total_count
                }

                // Process commits for daily stats
                for (const item of searchResult.items) {
                    const commitDate = new Date(item.commit.author?.date || item.commit.committer?.date || '')
                    // Use local date to ensure consistency with streak calculation
                    const year = commitDate.getFullYear()
                    const month = String(commitDate.getMonth() + 1).padStart(2, '0')
                    const day = String(commitDate.getDate()).padStart(2, '0')
                    const dateKey = `${year}-${month}-${day}`
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
        console.log(`Total commits (All Time): ${totalCommits}`)

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
            console.log(`PRs: ${totalPRs}`)

            // Count Issues
            const { data: issueSearch } = await octokit.search.issuesAndPullRequests({
                q: `author:${profile.login} type:issue created:>=${yearStartStr}`,
                per_page: 1
            })
            totalIssues = issueSearch.total_count
            console.log(`Issues: ${totalIssues}`)

            // Count Reviews (search for reviewed PRs)
            const { data: reviewSearch } = await octokit.search.issuesAndPullRequests({
                q: `reviewed-by:${profile.login} type:pr created:>=${yearStartStr}`,
                per_page: 1
            })
            totalReviews = reviewSearch.total_count
            console.log(`PR Reviews: ${totalReviews}`)

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
                productivity_score: day.total_commits * 10, // Uncapped score based on volume
                is_weekend: new Date(day.date).getDay() % 6 === 0
            }
        })

        if (dailyStatsInserts.length > 0) {
            // Batch upserts to avoid payload limits
            const batchSize = 100
            for (let i = 0; i < dailyStatsInserts.length; i += batchSize) {
                const batch = dailyStatsInserts.slice(i, i + batchSize)
                const { error: statsError } = await supabase
                    .from('daily_stats')
                    .upsert(batch, {
                        onConflict: 'user_id,date',
                        ignoreDuplicates: false
                    })

                if (statsError) {
                    console.error('Stats upsert error:', statsError)
                }
            }
        }

        // STEP 6: Calculate streak from daily stats
        await calculateStreaks(userData.id)

        // STEP 7: Calculate total contributions (GitHub-style)
        const totalContributions = totalCommits + totalPRs + totalIssues + totalReviews

        // STEP 8: Calculate productivity score (Uncapped)
        // Formula: commits * 10 + PRs * 25 + issues * 15 + reviews * 20
        const productivityScore = (totalCommits * 10) + (totalPRs * 25) + (totalIssues * 15) + (totalReviews * 20)

        // STEP 9: Update user with accurate stats
        await supabase
            .from('users')
            .update({
                last_synced: new Date().toISOString(),
                total_commits: totalCommits, // Shows All Time
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
                productivity_score: productivityScore // Uncapped
            })
            .eq('id', userData.id)

        // STEP 10: CALCULATE AND AWARD XP
        // Get current streak from database (calculated in step 6)
        const { data: updatedUserData } = await supabase
            .from('users')
            .select('current_streak, xp')
            .eq('id', userData.id)
            .single()

        const currentStreak = updatedUserData?.current_streak || 0
        const previousXp = updatedUserData?.xp || 0

        // Calculate XP based on all-time activity (retroactive calculation)
        // This ensures veteran users get proper XP even if they never synced before
        let calculatedXp = 0

        // Commits: 10 XP each (capped at 100 XP per day, ~10 commits/day max reward)
        // For simplicity, we use total commits with a reasonable multiplier
        const commitXp = Math.min(totalCommits * XP_REWARDS.DAILY_COMMIT, totalCommits * 10)
        calculatedXp += commitXp

        // PRs: 50 XP each (merged PRs are valuable)
        const prXp = totalPRs * XP_REWARDS.PR_MERGED
        calculatedXp += prXp

        // Streak bonus: 5 XP per day of current streak
        const streakXp = currentStreak * XP_REWARDS.STREAK_MULTIPLIER
        calculatedXp += streakXp

        // Perfect weeks bonus: Estimate based on active days in daily stats
        const activeDaysCount = commitsByDay.size
        const estimatedPerfectWeeks = Math.floor(activeDaysCount / 7)
        const perfectWeekXp = estimatedPerfectWeeks * XP_REWARDS.WEEK_SHIPPED
        calculatedXp += perfectWeekXp

        // Calculate level from XP
        const levelInfo = calculateLevel(calculatedXp)

        console.log(`XP Calculation: commits=${commitXp}, PRs=${prXp}, streak=${streakXp}, perfectWeeks=${perfectWeekXp}`)
        console.log(`Total XP: ${calculatedXp} (was ${previousXp}), Level: ${levelInfo.level} (${levelInfo.title})`)

        // Update user with XP and level
        await supabase
            .from('users')
            .update({
                xp: calculatedXp,
                level: levelInfo.level,
                level_title: levelInfo.title
            })
            .eq('id', userData.id)

        console.log('=== SYNC COMPLETE ===')
        console.log(`Commits: ${totalCommits}`)
        console.log(`Total Contributions: ${totalContributions}`)
        console.log(`Score: ${productivityScore}`)
        console.log(`XP: ${calculatedXp} | Level: ${levelInfo.level} (${levelInfo.title})`)

        // STEP 11: Background tasks
        checkAndUnlockAchievements(userData.id).catch(console.error)
        generateInsights(userData.id).catch(console.error)
        updateChallengeScores().catch(console.error)

        return NextResponse.json({
            success: true,
            stats: {
                total_commits: totalCommits,
                total_contributions: totalContributions,
                total_prs: totalPRs,
                total_issues: totalIssues,
                total_reviews: totalReviews,
                repos_synced: allRepos.length,
                repos_with_commits: reposWithCommits.size,
                days_with_activity: commitsByDay.size,
                productivity_score: productivityScore,
                xp: calculatedXp,
                level: levelInfo.level,
                level_title: levelInfo.title
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

    // Helper: Get local date string YYYY-MM-DD (user's timezone approximation)
    // Since we don't have user timezone, we use server local time which is good enough
    const getLocalDateStr = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Helper: Parse date string to comparable number (days since epoch)
    const dateToDays = (dateStr: string): number => {
        const [year, month, day] = dateStr.split('-').map(Number)
        return new Date(year, month - 1, day).getTime() / (1000 * 60 * 60 * 24)
    }

    const today = new Date()
    const todayStr = getLocalDateStr(today)

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = getLocalDateStr(yesterday)

    // Get unique sorted dates (newest first)
    const sortedDates = Array.from(new Set(stats.map(s => s.date))).sort((a, b) => dateToDays(b) - dateToDays(a))

    console.log(`Streak calc: today=${todayStr}, yesterday=${yesterdayStr}, lastActivity=${sortedDates[0]}`)

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Current streak: must have activity today or yesterday to count
    const mostRecentActivity = sortedDates[0]
    if (mostRecentActivity === todayStr || mostRecentActivity === yesterdayStr) {
        // Count consecutive days backwards from most recent activity
        let expectedDays = dateToDays(mostRecentActivity)

        for (const dateStr of sortedDates) {
            const dayNum = dateToDays(dateStr)

            if (dayNum === expectedDays) {
                tempStreak++
                expectedDays-- // Move to previous day
            } else if (dayNum < expectedDays) {
                // Gap found, streak broken
                break
            }
            // Skip duplicate days (dayNum > expectedDays shouldn't happen with sorted data)
        }
        currentStreak = tempStreak
    }

    // Longest streak calculation
    tempStreak = 1
    for (let i = 1; i < sortedDates.length; i++) {
        const currDays = dateToDays(sortedDates[i])
        const prevDays = dateToDays(sortedDates[i - 1])
        const diffDays = prevDays - currDays

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

async function updateChallengeScores() {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    await fetch(`${baseUrl}/api/challenges/update-scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
}
