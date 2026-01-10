import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * GET /api/github/repos
 * Returns the user's repositories with commit counts for the Constellation.
 */
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's GitHub access token
        const githubId = (session.user as any).githubId
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('github_access_token, github_username')
            .eq('github_id', githubId)
            .single()

        if (!user?.github_access_token) {
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
            console.error('GitHub repos fetch failed:', await reposRes.text())
            return NextResponse.json({ error: 'GitHub API error' }, { status: 502 })
        }

        const repos = await reposRes.json()

        // Transform to what Constellation needs
        const transformedRepos = repos.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            language: repo.language,
            commits: repo.size, // Approximation - actual commit count requires separate API call
            pushed_at: repo.pushed_at,
            updated_at: repo.updated_at,
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
        }))

        return NextResponse.json({ repos: transformedRepos })
    } catch (error) {
        console.error('Repos API error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
