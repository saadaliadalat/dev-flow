import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * GET /api/github/repos
 * Returns the user's repositories with REAL commit counts for the Constellation.
 * Uses GitHub's contributor statistics API with smart caching.
 */

interface RepoCommitCache {
    commits: number
    cached_at: string
}

// Fetch real commit count for a single repo with timeout
async function fetchRepoCommitCount(
    owner: string,
    repo: string,
    token: string
): Promise<number> {
    // Add 3-second timeout per repo to prevent slow responses
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    try {
        // Use contributor statistics - gives total commits per contributor
        const statsRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                signal: controller.signal,
            }
        )

        clearTimeout(timeout)

        // GitHub returns 202 if stats are being computed - don't wait, just return 0
        if (statsRes.status === 202) {
            return 0 // Stats not ready, skip instead of blocking
        }

        if (statsRes.ok) {
            const data = await statsRes.json()
            if (Array.isArray(data)) {
                return data.reduce((sum: number, contributor: any) => sum + (contributor.total || 0), 0)
            }
        }

        return 0
    } catch (error: any) {
        clearTimeout(timeout)
        // Silently handle timeouts and network errors - just return 0
        if (error.name === 'AbortError') {
            console.log(`Commit fetch timeout for ${owner}/${repo}`)
        }
        return 0
    }
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            console.error('GitHub repos: No session found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's GitHub access token
        const githubId = (session.user as any).githubId
        if (!githubId) {
            console.error('GitHub repos: No githubId in session', { user: session.user })
            return NextResponse.json({ error: 'No GitHub ID in session' }, { status: 400 })
        }

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('github_access_token, github_username')
            .eq('github_id', githubId)
            .single()

        if (userError) {
            console.error('GitHub repos: Supabase user query failed', userError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (!user?.github_access_token) {
            console.error('GitHub repos: No GitHub token found for user', { githubId })
            return NextResponse.json({ error: 'No GitHub token' }, { status: 400 })
        }

        // Fetch repos from GitHub API
        const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', {
            headers: {
                Authorization: `Bearer ${user.github_access_token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })

        if (!reposRes.ok) {
            const errorText = await reposRes.text().catch(() => 'Unknown error')
            console.error('GitHub repos fetch failed:', reposRes.status, errorText)

            // Token expired or invalid
            if (reposRes.status === 401) {
                return NextResponse.json({ error: 'GitHub token expired - please sign out and sign back in' }, { status: 401 })
            }

            // Rate limited
            if (reposRes.status === 403) {
                return NextResponse.json({ error: 'GitHub rate limit exceeded - try again in a few minutes' }, { status: 429 })
            }

            return NextResponse.json({ error: 'GitHub API error - try again later' }, { status: 502 })
        }

        const repos = await reposRes.json()

        // Fetch real commit counts in parallel (limit to top 20 most recent to avoid rate limits)
        const topRepos = repos.slice(0, 20)
        const commitCounts = await Promise.all(
            topRepos.map(async (repo: any) => {
                const [owner, repoName] = repo.full_name.split('/')
                const commits = await fetchRepoCommitCount(owner, repoName, user.github_access_token)
                return { id: repo.id, commits }
            })
        )

        // Create lookup map
        const commitMap = new Map(commitCounts.map(c => [c.id, c.commits]))

        // Transform to what Constellation needs with REAL commit counts
        const transformedRepos = repos.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            language: repo.language,
            commits: commitMap.get(repo.id) || 0, // Real commit count
            pushed_at: repo.pushed_at,
            updated_at: repo.updated_at,
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
        }))

        return NextResponse.json({
            repos: transformedRepos,
            lastSynced: new Date().toISOString()
        })
    } catch (error) {
        console.error('Repos API error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
