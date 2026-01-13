import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

/**
 * 📜 LORE NARRATIVE
 * LLM-generated story from your coding journey.
 * Uses Groq's Llama 3.3 70B for fast, high-quality generation.
 */

interface RepoSummary {
    name: string
    language: string | null
    commits: number
    lastCommitAt: string | null
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId
        if (!githubId) {
            return NextResponse.json({ error: 'No GitHub ID' }, { status: 400 })
        }

        // Fetch user data
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('username, total_commits, total_prs, total_repos, created_at, github_access_token')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch recent repos for context
        let repos: RepoSummary[] = []
        if (user.github_access_token) {
            try {
                const reposRes = await fetch('https://api.github.com/user/repos?per_page=10&sort=pushed', {
                    headers: {
                        Authorization: `Bearer ${user.github_access_token}`,
                        Accept: 'application/vnd.github.v3+json',
                    },
                })
                if (reposRes.ok) {
                    const data = await reposRes.json()
                    repos = data.map((r: any) => ({
                        name: r.name,
                        language: r.language,
                        commits: 0, // We won't fetch counts here for speed
                        lastCommitAt: r.pushed_at,
                    }))
                }
            } catch {
                // Silently fail - we can still generate narrative without repos
            }
        }

        // Calculate journey duration
        const daysSinceJoin = Math.floor(
            (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Get unique languages (use Array.from for TS compatibility)
        const languages = Array.from(new Set(repos.map(r => r.language).filter((l): l is string => l !== null)))

        // Generate narrative with LLM
        const prompt = `Generate a poetic, inspiring developer journey narrative (2-3 sentences max) based on this data:

Developer: ${user.username}
Journey duration: ${daysSinceJoin} days
Total commits: ${user.total_commits || 0}
Total PRs: ${user.total_prs || 0}
Total repos: ${user.total_repos || repos.length}
Recent repos: ${repos.slice(0, 5).map(r => `${r.name} (${r.language || 'Unknown'})`).join(', ') || 'Still beginning'}
Languages: ${languages.join(', ') || 'Exploring'}

Rules:
- Write in second person ("you", "your")
- Be inspiring but not cheesy
- Reference specific languages/projects if available
- Keep it under 50 words
- End with something meaningful about growth

Example style: "From scraping AQI data in Python to building AI apps in Dart, your journey evolves from data warrior to spiritual innovator—29 repos strong."`

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            max_tokens: 100,
            temperature: 0.8,
        })

        const narrative = completion.choices[0]?.message?.content ||
            "Your code journey continues to unfold. Every commit writes a new chapter."

        // Generate a haiku warning if low activity
        let haiku: string | null = null
        if ((user.total_commits || 0) < 10 || daysSinceJoin > 30) {
            const haikuCompletion = await groq.chat.completions.create({
                messages: [{
                    role: 'user',
                    content: `Write a single haiku (5-7-5 syllables) encouraging a developer to code more. Theme: ${(user.total_commits || 0) < 10 ? 'beginning the journey' : 'returning after absence'
                        }. No punctuation, lowercase.`
                }],
                model: 'llama-3.3-70b-versatile',
                max_tokens: 30,
                temperature: 0.9,
            })
            haiku = haikuCompletion.choices[0]?.message?.content || null
        }

        return NextResponse.json({
            narrative: narrative.trim().replace(/^["']|["']$/g, ''), // Remove quotes
            haiku,
            stats: {
                daysSinceJoin,
                totalCommits: user.total_commits || 0,
                totalRepos: user.total_repos || repos.length,
                languages: languages.length,
            },
            generatedAt: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Narrative generation error:', error)
        return NextResponse.json({
            narrative: "Your code tells a story only you can write. Keep building.",
            haiku: null,
            stats: { daysSinceJoin: 0, totalCommits: 0, totalRepos: 0, languages: 0 },
            generatedAt: new Date().toISOString(),
            fallback: true,
        })
    }
}
