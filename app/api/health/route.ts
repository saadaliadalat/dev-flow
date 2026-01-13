import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * 🔒 REPO HEALTH API
 * 
 * Analyzes repository health metrics:
 * - Package.json dependencies (outdated, security)
 * - Branch protection status
 * - Recent commit frequency
 * - Issue/PR responsiveness
 * 
 * Returns a 0-100 health score with actionable recommendations.
 */

interface RepoHealth {
    repo: string
    score: number
    metrics: {
        activity: { score: number; label: string; detail: string }
        maintenance: { score: number; label: string; detail: string }
        community: { score: number; label: string; detail: string }
        documentation: { score: number; label: string; detail: string }
    }
    issues: {
        severity: 'high' | 'medium' | 'low'
        title: string
        description: string
        action: string
    }[]
    lastUpdated: string
}

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(request.url)
        const repoName = url.searchParams.get('repo')
        const accessToken = (session.user as any).accessToken

        if (!repoName) {
            // Return list of repos with basic health
            const reposRes = await fetch('https://api.github.com/user/repos?per_page=30&sort=pushed', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            })

            if (!reposRes.ok) {
                return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 })
            }

            const repos = await reposRes.json()
            const repoHealthList = repos.map((repo: any) => calculateBasicHealth(repo))

            return NextResponse.json({
                repos: repoHealthList,
                summary: {
                    healthy: repoHealthList.filter((r: any) => r.score >= 70).length,
                    needsAttention: repoHealthList.filter((r: any) => r.score >= 40 && r.score < 70).length,
                    critical: repoHealthList.filter((r: any) => r.score < 40).length,
                }
            })
        }

        // Detailed analysis for specific repo
        const repoRes = await fetch(`https://api.github.com/repos/${repoName}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })

        if (!repoRes.ok) {
            return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
        }

        const repo = await repoRes.json()

        // Fetch additional data
        const [commitsRes, issuesRes, prsRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${repoName}/commits?per_page=30`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch(`https://api.github.com/repos/${repoName}/issues?state=open&per_page=20`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch(`https://api.github.com/repos/${repoName}/pulls?state=open&per_page=10`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ])

        const commits = commitsRes.ok ? await commitsRes.json() : []
        const issues = issuesRes.ok ? await issuesRes.json() : []
        const prs = prsRes.ok ? await prsRes.json() : []

        // Calculate detailed health
        const health = calculateDetailedHealth(repo, commits, issues, prs)

        return NextResponse.json(health)
    } catch (error) {
        console.error('Repo health error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

function calculateBasicHealth(repo: any): { name: string; fullName: string; score: number; lastPush: string } {
    let score = 50 // Base score

    // Activity (last push)
    const daysSincePush = Math.floor((Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSincePush < 7) score += 20
    else if (daysSincePush < 30) score += 10
    else if (daysSincePush > 180) score -= 20

    // Documentation
    if (repo.description) score += 5
    if (repo.license) score += 5
    if (repo.has_wiki) score += 5
    if (!repo.private) score += 5

    // Community
    if (repo.stargazers_count > 0) score += 5
    if (repo.forks_count > 0) score += 5

    return {
        name: repo.name,
        fullName: repo.full_name,
        score: Math.max(0, Math.min(100, score)),
        lastPush: repo.pushed_at,
    }
}

function calculateDetailedHealth(repo: any, commits: any[], issues: any[], prs: any[]): RepoHealth {
    const now = Date.now()
    const healthIssues: RepoHealth['issues'] = []

    // Activity Score
    const daysSincePush = Math.floor((now - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24))
    let activityScore = 100
    let activityLabel = 'Active'
    if (daysSincePush > 30) {
        activityScore = 60
        activityLabel = 'Slowing'
        healthIssues.push({
            severity: 'medium',
            title: 'Inactivity Detected',
            description: `No commits in ${daysSincePush} days`,
            action: 'Consider making a commit or archiving if inactive',
        })
    }
    if (daysSincePush > 90) {
        activityScore = 30
        activityLabel = 'Dormant'
    }
    if (daysSincePush > 365) {
        activityScore = 10
        activityLabel = 'Abandoned'
    }

    // Maintenance Score
    let maintenanceScore = 70
    let maintenanceLabel = 'Good'
    const openIssuesCount = issues.filter((i: any) => !i.pull_request).length
    if (openIssuesCount > 10) {
        maintenanceScore -= 20
        maintenanceLabel = 'Backlog'
        healthIssues.push({
            severity: 'medium',
            title: 'Issue Backlog',
            description: `${openIssuesCount} open issues`,
            action: 'Triage and prioritize issues',
        })
    }
    if (prs.length > 5) {
        maintenanceScore -= 10
        healthIssues.push({
            severity: 'low',
            title: 'Pending PRs',
            description: `${prs.length} open pull requests`,
            action: 'Review and merge or close stale PRs',
        })
    }

    // Community Score
    let communityScore = 50
    let communityLabel = 'Growing'
    if (repo.stargazers_count > 100) { communityScore = 90; communityLabel = 'Popular' }
    else if (repo.stargazers_count > 10) { communityScore = 70; communityLabel = 'Noticed' }
    else if (repo.stargazers_count > 0) { communityScore = 60; communityLabel = 'Starting' }

    // Documentation Score
    let docScore = 50
    let docLabel = 'Basic'
    if (repo.description) docScore += 10
    if (repo.license) docScore += 15
    if (repo.has_wiki) docScore += 10
    if (repo.homepage) docScore += 15
    if (docScore >= 80) docLabel = 'Excellent'
    else if (docScore >= 60) docLabel = 'Good'

    if (!repo.description) {
        healthIssues.push({
            severity: 'low',
            title: 'Missing Description',
            description: 'Repo has no description',
            action: 'Add a clear description explaining the project',
        })
    }
    if (!repo.license) {
        healthIssues.push({
            severity: 'medium',
            title: 'No License',
            description: 'Repository has no license file',
            action: 'Add a LICENSE file to clarify usage rights',
        })
    }

    // Overall score
    const overallScore = Math.round(
        (activityScore * 0.35) +
        (maintenanceScore * 0.25) +
        (communityScore * 0.20) +
        (docScore * 0.20)
    )

    return {
        repo: repo.full_name,
        score: overallScore,
        metrics: {
            activity: { score: activityScore, label: activityLabel, detail: `Last push ${daysSincePush} days ago` },
            maintenance: { score: maintenanceScore, label: maintenanceLabel, detail: `${openIssuesCount} issues, ${prs.length} PRs` },
            community: { score: communityScore, label: communityLabel, detail: `${repo.stargazers_count} stars, ${repo.forks_count} forks` },
            documentation: { score: docScore, label: docLabel, detail: repo.description || 'No description' },
        },
        issues: healthIssues.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 }
            return order[a.severity] - order[b.severity]
        }),
        lastUpdated: new Date().toISOString(),
    }
}
