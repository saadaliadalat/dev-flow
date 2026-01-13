import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Groq from 'groq-sdk'

/**
 * 🤖 AI COACH API
 * 
 * Analyzes user's recent commits and provides actionable suggestions
 * for improvement. Uses Groq's Llama 3.3 70B for intelligent analysis.
 */

interface CoachInsight {
    category: 'quality' | 'productivity' | 'learning' | 'habit'
    title: string
    observation: string
    suggestion: string
    impact: 'high' | 'medium' | 'low'
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId
        const accessToken = (session.user as any).accessToken
        const userName = session.user.name || 'Developer'

        // Get user from DB
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id, total_commits, total_prs, current_streak, productivity_score')
            .eq('github_id', githubId)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch recent activity from GitHub
        const eventsRes = await fetch(`https://api.github.com/users/${(session.user as any).username}/events?per_page=30`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })

        let recentEvents: any[] = []
        if (eventsRes.ok) {
            recentEvents = await eventsRes.json()
        }

        // Analyze patterns
        const pushEvents = recentEvents.filter(e => e.type === 'PushEvent')
        const prEvents = recentEvents.filter(e => e.type === 'PullRequestEvent')
        const commitCount = pushEvents.reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0)

        // Get commit times
        const commitTimes = pushEvents.flatMap(e =>
            (e.payload?.commits || []).map(() => new Date(e.created_at).getHours())
        )
        const lateNightCommits = commitTimes.filter(h => h >= 22 || h <= 5).length
        const avgCommitsPerPush = pushEvents.length > 0 ? commitCount / pushEvents.length : 0

        // Get languages used
        const repos = new Set(pushEvents.map(e => e.repo?.name).filter(Boolean))

        // Generate insights using LLM
        const groqApiKey = process.env.GROQ_API_KEY
        let aiInsights: CoachInsight[] = []

        if (groqApiKey) {
            const groq = new Groq({ apiKey: groqApiKey })

            const prompt = `You are a senior developer coach analyzing a developer's recent GitHub activity. Generate 3 personalized, actionable insights.

DEVELOPER PROFILE:
- Name: ${userName}
- Total commits: ${dbUser.total_commits}
- Total PRs: ${dbUser.total_prs}
- Current streak: ${dbUser.current_streak} days
- Productivity score: ${dbUser.productivity_score}

RECENT ACTIVITY (last 7 days):
- Push events: ${pushEvents.length}
- Total commits: ${commitCount}
- PR events: ${prEvents.length}
- Avg commits per push: ${avgCommitsPerPush.toFixed(1)}
- Late night commits (10pm-5am): ${lateNightCommits}
- Active repos: ${repos.size}

Generate exactly 3 insights in this JSON format:
[
  {
    "category": "quality|productivity|learning|habit",
    "title": "Short title (max 6 words)",
    "observation": "What you noticed (1 sentence)",
    "suggestion": "Actionable recommendation (1-2 sentences)",
    "impact": "high|medium|low"
  }
]

Focus on:
1. Commit patterns (size, frequency, timing)
2. PR habits (if they create PRs or just push)
3. Work-life balance (late night coding)
4. Consistency and streak maintenance

Be encouraging but honest. Make suggestions specific and actionable.
Return ONLY valid JSON array, no other text.`

            try {
                const completion = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 800,
                })

                const content = completion.choices[0]?.message?.content || ''
                const jsonMatch = content.match(/\[[\s\S]*\]/)
                if (jsonMatch) {
                    aiInsights = JSON.parse(jsonMatch[0])
                }
            } catch (llmError) {
                console.error('LLM error:', llmError)
            }
        }

        // Fallback insights if LLM fails
        if (aiInsights.length === 0) {
            aiInsights = generateFallbackInsights(commitCount, lateNightCommits, avgCommitsPerPush, dbUser.current_streak)
        }

        return NextResponse.json({
            insights: aiInsights,
            stats: {
                recentCommits: commitCount,
                recentPRs: prEvents.length,
                avgCommitsPerPush: Math.round(avgCommitsPerPush * 10) / 10,
                lateNightCommits,
                activeRepos: repos.size,
            },
        })
    } catch (error) {
        console.error('AI Coach error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

function generateFallbackInsights(commits: number, lateNight: number, avgPerPush: number, streak: number): CoachInsight[] {
    const insights: CoachInsight[] = []

    if (avgPerPush > 10) {
        insights.push({
            category: 'quality',
            title: 'Consider Smaller Commits',
            observation: `You average ${Math.round(avgPerPush)} commits per push.`,
            suggestion: 'Breaking work into smaller commits improves code review and makes it easier to track changes.',
            impact: 'medium',
        })
    }

    if (lateNight > 3) {
        insights.push({
            category: 'habit',
            title: 'Watch Your Night Coding',
            observation: `${lateNight} commits were made between 10pm-5am.`,
            suggestion: 'Late night code often has more bugs. Consider setting a cutoff time for focused work.',
            impact: 'high',
        })
    }

    if (streak > 7) {
        insights.push({
            category: 'productivity',
            title: 'Streak Momentum Strong',
            observation: `${streak}-day streak shows excellent consistency.`,
            suggestion: 'Keep this momentum! Consider increasing complexity gradually.',
            impact: 'low',
        })
    } else if (streak === 0) {
        insights.push({
            category: 'productivity',
            title: 'Time to Start Fresh',
            observation: 'Your streak has reset.',
            suggestion: 'Start with a small commit today to rebuild momentum. Even a README update counts!',
            impact: 'high',
        })
    }

    // Ensure we have 3 insights
    while (insights.length < 3) {
        insights.push({
            category: 'learning',
            title: 'Explore New Territory',
            observation: 'Growth comes from challenging yourself.',
            suggestion: 'Try contributing to an open-source project or learning a new framework this week.',
            impact: 'medium',
        })
    }

    return insights.slice(0, 3)
}
