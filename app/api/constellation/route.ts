import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🌌 CONSTELLATION DATA API
 * 
 * Fetches user's repositories with real metrics for force-directed graph.
 * Each repo becomes a star with mass based on commits + stars.
 */

export interface ConstellationNode {
    id: string
    name: string
    fullName: string
    language: string
    languages: string[]
    commits: number
    stars: number
    forks: number
    mass: number           // commits + stars/10
    lastCommitDate: string
    daysSinceCommit: number
    brightness: number     // 0-1 based on recency
    isPrivate: boolean
}

export interface ConstellationEdge {
    source: string
    target: string
    language: string       // shared language
    strength: number       // 0-1
}

export interface ConstellationData {
    nodes: ConstellationNode[]
    edges: ConstellationEdge[]
    stats: {
        totalStars: number
        totalCommits: number
        uniqueLanguages: number
        activeRepos: number
        dimEmbers: number
    }
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId
        const accessToken = (session.user as any).accessToken

        // Get user from DB
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch repos from GitHub
        const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })

        if (!reposRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 })
        }

        const repos = await reposRes.json()
        const now = Date.now()

        // Process nodes
        const nodes: ConstellationNode[] = repos.map((repo: any) => {
            const lastPush = repo.pushed_at ? new Date(repo.pushed_at).getTime() : now
            const daysSinceCommit = Math.floor((now - lastPush) / (1000 * 60 * 60 * 24))
            const brightness = Math.exp(-daysSinceCommit / 30) // e^(-days/30)

            return {
                id: repo.id.toString(),
                name: repo.name,
                fullName: repo.full_name,
                language: repo.language || 'Unknown',
                languages: repo.language ? [repo.language] : [],
                commits: 0, // Will be populated if we have daily_stats
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                mass: 10 + (repo.stargazers_count || 0) / 10, // Base mass + stars
                lastCommitDate: repo.pushed_at || new Date().toISOString(),
                daysSinceCommit,
                brightness,
                isPrivate: repo.private,
            }
        })

        // Generate edges (connect repos with same primary language)
        const edges: ConstellationEdge[] = []
        const languageGroups = new Map<string, ConstellationNode[]>()

        for (const node of nodes) {
            if (node.language && node.language !== 'Unknown') {
                if (!languageGroups.has(node.language)) {
                    languageGroups.set(node.language, [])
                }
                languageGroups.get(node.language)!.push(node)
            }
        }

        // Create edges within language groups
        const languageEntries = Array.from(languageGroups.entries())
        for (const [language, group] of languageEntries) {
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    edges.push({
                        source: group[i].id,
                        target: group[j].id,
                        language,
                        strength: 0.3 + Math.random() * 0.2, // 0.3-0.5
                    })
                }
            }
        }

        // Calculate stats
        const stats = {
            totalStars: nodes.reduce((sum, n) => sum + n.stars, 0),
            totalCommits: nodes.reduce((sum, n) => sum + n.commits, 0),
            uniqueLanguages: languageGroups.size,
            activeRepos: nodes.filter(n => n.brightness > 0.5).length,
            dimEmbers: nodes.filter(n => n.brightness < 0.1).length,
        }

        return NextResponse.json({
            nodes,
            edges,
            stats,
        } as ConstellationData)
    } catch (error) {
        console.error('Constellation error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
