// app/api/insights/generate/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!
})

interface DailyStats {
    date: string
    total_commits: number
    commits_by_hour: Record<string, number>
    active_hours: number
    repos_contributed: { name: string; commits: number }[]
    unique_repos: number
    languages: Record<string, number>
    primary_language: string | null
    lines_added: number
    lines_deleted: number
    is_weekend: boolean
}

interface UserData {
    id: string
    username: string
    total_commits: number
    total_prs: number
    total_issues: number
    total_reviews: number
    current_streak: number
    longest_streak: number
    productivity_score: number
}

export async function POST(req: Request) {
    try {
        const { userId } = await req.json()

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        // 1. Fetch comprehensive user data
        const { data: userData } = await supabase
            .from('users')
            .select('id, username, total_commits, total_prs, total_issues, total_reviews, current_streak, longest_streak, productivity_score')
            .eq('id', userId)
            .single()

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Fetch detailed stats for multiple time periods
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const { data: recentStats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .gte('date', sevenDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: false })

        const { data: monthlyStats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: false })

        // 3. Perform deep analysis on real data
        const analysis = analyzeUserPatterns(
            userData as UserData,
            (recentStats || []) as DailyStats[],
            (monthlyStats || []) as DailyStats[]
        )

        // 4. Compute Dev Flow Score based on real metrics
        const scoreComponents = calculateRealScoreComponents(analysis)
        const totalScore = Math.round(
            (scoreComponents.building_ratio * 0.3) +
            (scoreComponents.consistency * 0.25) +
            (scoreComponents.shipping * 0.2) +
            (scoreComponents.focus * 0.15) +
            (scoreComponents.recovery * 0.1)
        )

        // 5. Generate AI insights with rich context
        const aiPrompt = createDetailedPrompt(userData as UserData, analysis, totalScore)
        const aiResponse = await generateAIResponse(aiPrompt)

        // 6. Store score data
        const today = now.toISOString().split('T')[0]
        await supabase
            .from('dev_flow_scores')
            .upsert({
                user_id: userId,
                date: today,
                building_ratio_score: scoreComponents.building_ratio,
                consistency_score: scoreComponents.consistency,
                shipping_score: scoreComponents.shipping,
                focus_score: scoreComponents.focus,
                recovery_score: scoreComponents.recovery,
                total_score: totalScore,
                score_change: analysis.weekOverWeekChange,
                weekly_avg: analysis.weeklyAvgCommits,
                global_avg: 72,
                percentile: totalScore > 72 ? 20 : 50
            }, { onConflict: 'user_id,date' })

        // Store Verdict
        await supabase
            .from('daily_verdicts')
            .upsert({
                user_id: userId,
                date: today,
                verdict_key: aiResponse.verdict?.key || 'neutral_day',
                verdict_text: aiResponse.verdict?.text || 'Keep Building',
                verdict_subtext: aiResponse.verdict?.subtext || 'Analyzing your patterns...',
                severity: aiResponse.verdict?.severity || 'neutral',
                dev_flow_score: totalScore,
                primary_factor: aiResponse.verdict?.primary_factor || 'consistency'
            }, { onConflict: 'user_id,date' })

        // Update user profile
        await supabase.from('users').update({
            dev_flow_score: totalScore,
            archetype: aiResponse.archetype?.type || determineArchetype(analysis)
        }).eq('id', userId)

        // 7. Clear old insights and generate new data-driven ones
        await supabase
            .from('insights')
            .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('is_dismissed', false)

        // Generate personalized insights based on real patterns
        const insightsToInsert = generateDataDrivenInsights(userId, userData as UserData, analysis, aiResponse, totalScore)

        if (insightsToInsert.length > 0) {
            const { error: insightError } = await supabase
                .from('insights')
                .insert(insightsToInsert)

            if (insightError) {
                console.error('Failed to insert insights:', insightError)
            }
        }

        return NextResponse.json({
            success: true,
            score: totalScore,
            verdict: aiResponse.verdict,
            insightsGenerated: insightsToInsert.length,
            analysis: {
                peakHours: analysis.peakCodingHours,
                topLanguage: analysis.topLanguage,
                weeklyTrend: analysis.weeklyTrend
            }
        })

    } catch (error: any) {
        console.error('❌ Intelligence generation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// ==================== DEEP ANALYSIS FUNCTIONS ====================

interface UserAnalysis {
    // Activity patterns
    totalCommitsWeek: number
    totalCommitsMonth: number
    weeklyAvgCommits: number
    dailyAvgCommits: number
    activeDaysWeek: number
    activeDaysMonth: number
    consistencyRate: number

    // Trends
    weeklyTrend: 'rising' | 'falling' | 'stable'
    weekOverWeekChange: number
    momentumScore: number

    // Time patterns
    peakCodingHours: string[]
    preferredTimeOfDay: 'early_bird' | 'night_owl' | 'balanced'
    weekendCoder: boolean
    weekendCommitRate: number

    // Languages & focus
    topLanguage: string | null
    languageDiversity: number
    repoFocus: number

    // Streaks
    currentStreak: number
    longestStreak: number
    streakHealth: 'thriving' | 'at_risk' | 'broken'

    // Volume metrics
    totalPRs: number
    totalIssues: number
    totalReviews: number
    collaborationScore: number

    // Warnings
    burnoutRisk: boolean
    inconsistencyWarning: boolean
    stagnationRisk: boolean
}

function analyzeUserPatterns(
    user: UserData,
    recentStats: DailyStats[],
    monthlyStats: DailyStats[]
): UserAnalysis {
    // Calculate weekly stats
    const totalCommitsWeek = recentStats.reduce((sum, s) => sum + (s.total_commits || 0), 0)
    const totalCommitsMonth = monthlyStats.reduce((sum, s) => sum + (s.total_commits || 0), 0)
    const activeDaysWeek = recentStats.filter(s => (s.total_commits || 0) > 0).length
    const activeDaysMonth = monthlyStats.filter(s => (s.total_commits || 0) > 0).length

    // Trend analysis (compare first half vs second half of week)
    const firstHalf = recentStats.slice(Math.floor(recentStats.length / 2))
    const secondHalf = recentStats.slice(0, Math.floor(recentStats.length / 2))
    const firstHalfAvg = firstHalf.reduce((sum, s) => sum + (s.total_commits || 0), 0) / (firstHalf.length || 1)
    const secondHalfAvg = secondHalf.reduce((sum, s) => sum + (s.total_commits || 0), 0) / (secondHalf.length || 1)
    const weekOverWeekChange = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

    // Peak hours analysis
    const hourCounts: Record<number, number> = {}
    recentStats.forEach(stat => {
        if (stat.commits_by_hour) {
            Object.entries(stat.commits_by_hour).forEach(([hour, count]) => {
                hourCounts[parseInt(hour)] = (hourCounts[parseInt(hour)] || 0) + (count as number)
            })
        }
    })
    const sortedHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => formatHour(parseInt(hour)))

    // Time of day preference
    const morningCommits = Object.entries(hourCounts)
        .filter(([h]) => parseInt(h) >= 5 && parseInt(h) < 12)
        .reduce((sum, [_, c]) => sum + c, 0)
    const nightCommits = Object.entries(hourCounts)
        .filter(([h]) => parseInt(h) >= 20 || parseInt(h) < 5)
        .reduce((sum, [_, c]) => sum + c, 0)
    const totalHourlyCommits = Object.values(hourCounts).reduce((sum, c) => sum + c, 0)

    let preferredTimeOfDay: 'early_bird' | 'night_owl' | 'balanced' = 'balanced'
    if (totalHourlyCommits > 0) {
        if (morningCommits / totalHourlyCommits > 0.4) preferredTimeOfDay = 'early_bird'
        else if (nightCommits / totalHourlyCommits > 0.3) preferredTimeOfDay = 'night_owl'
    }

    // Weekend analysis
    const weekendStats = recentStats.filter(s => s.is_weekend)
    const weekendCommits = weekendStats.reduce((sum, s) => sum + (s.total_commits || 0), 0)
    const weekendCommitRate = totalCommitsWeek > 0 ? (weekendCommits / totalCommitsWeek) * 100 : 0

    // Language analysis
    const languageCounts: Record<string, number> = {}
    monthlyStats.forEach(stat => {
        if (stat.languages) {
            Object.entries(stat.languages).forEach(([lang, count]) => {
                languageCounts[lang] = (languageCounts[lang] || 0) + (count as number)
            })
        }
    })
    const topLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
    const languageDiversity = Object.keys(languageCounts).length

    // Streak health
    let streakHealth: 'thriving' | 'at_risk' | 'broken' = 'broken'
    if (user.current_streak >= 7) streakHealth = 'thriving'
    else if (user.current_streak >= 1) streakHealth = 'at_risk'

    // Risk detection
    const burnoutRisk = totalCommitsWeek > 100 || (activeDaysWeek === 7 && totalCommitsWeek > 50)
    const inconsistencyWarning = activeDaysWeek < 3 && totalCommitsMonth > 20
    const stagnationRisk = totalCommitsWeek < 5 && user.total_commits > 100

    // Collaboration score
    const collaborationScore = Math.min(100, (user.total_prs * 3) + (user.total_reviews * 5) + (user.total_issues * 2))

    return {
        totalCommitsWeek,
        totalCommitsMonth,
        weeklyAvgCommits: totalCommitsWeek / 7,
        dailyAvgCommits: totalCommitsMonth / 30,
        activeDaysWeek,
        activeDaysMonth,
        consistencyRate: (activeDaysMonth / 30) * 100,
        weeklyTrend: weekOverWeekChange > 10 ? 'rising' : weekOverWeekChange < -10 ? 'falling' : 'stable',
        weekOverWeekChange: Math.round(weekOverWeekChange),
        momentumScore: Math.min(100, (activeDaysWeek / 7) * 50 + (totalCommitsWeek / 20) * 50),
        peakCodingHours: sortedHours.length > 0 ? sortedHours : ['No data yet'],
        preferredTimeOfDay,
        weekendCoder: weekendCommitRate > 30,
        weekendCommitRate: Math.round(weekendCommitRate),
        topLanguage,
        languageDiversity,
        repoFocus: recentStats.reduce((sum, s) => sum + (s.unique_repos || 0), 0) / (recentStats.length || 1),
        currentStreak: user.current_streak || 0,
        longestStreak: user.longest_streak || 0,
        streakHealth,
        totalPRs: user.total_prs || 0,
        totalIssues: user.total_issues || 0,
        totalReviews: user.total_reviews || 0,
        collaborationScore,
        burnoutRisk,
        inconsistencyWarning,
        stagnationRisk
    }
}

function formatHour(hour: number): string {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

function calculateRealScoreComponents(analysis: UserAnalysis) {
    return {
        building_ratio: Math.min(100, (analysis.totalCommitsWeek / 30) * 100),
        consistency: Math.min(100, analysis.consistencyRate * 1.2),
        shipping: Math.min(100, analysis.totalPRs * 5 + analysis.collaborationScore * 0.3),
        focus: Math.min(100, (1 / (analysis.languageDiversity || 1)) * 50 + (1 / (analysis.repoFocus || 1)) * 50),
        recovery: analysis.burnoutRisk ? 30 : (analysis.weekendCommitRate < 40 ? 90 : 60)
    }
}

function determineArchetype(analysis: UserAnalysis): string {
    if (analysis.consistencyRate > 70 && analysis.totalCommitsWeek > 20) return 'Builder'
    if (analysis.collaborationScore > 50 && analysis.totalPRs > 10) return 'Architect'
    if (analysis.totalCommitsWeek > 40) return 'Grinder'
    if (analysis.languageDiversity > 5) return 'Explorer'
    if (analysis.totalCommitsWeek < 5) return 'Tourist'
    return 'Apprentice'
}

// ==================== INSIGHT GENERATION ====================

function generateDataDrivenInsights(
    userId: string,
    user: UserData,
    analysis: UserAnalysis,
    aiResponse: any,
    totalScore: number
): any[] {
    const insights: any[] = []

    // 1. AI-generated main verdict (always include)
    insights.push({
        user_id: userId,
        insight_type: 'daily_verdict',
        title: aiResponse.verdict?.text || 'Daily Analysis',
        message: aiResponse.verdict?.subtext || 'Your productivity analysis for today.',
        severity: mapSeverity(aiResponse.verdict?.severity),
        action_items: aiResponse.actions || ['Keep shipping', 'Stay consistent'],
        is_actionable: true,
        is_read: false,
        is_dismissed: false
    })

    // 2. Peak productivity hours insight (REAL DATA)
    if (analysis.peakCodingHours[0] !== 'No data yet') {
        insights.push({
            user_id: userId,
            insight_type: 'productivity_pattern',
            title: `Your Peak Hours: ${analysis.peakCodingHours.slice(0, 2).join(' & ')}`,
            message: `You're most productive during ${analysis.peakCodingHours[0]}. Schedule deep work sessions during this time for maximum output.`,
            severity: 'info',
            action_items: [
                `Block ${analysis.peakCodingHours[0]} for focused coding`,
                'Disable notifications during peak hours',
                'Tackle complex problems during your peak window'
            ],
            is_actionable: true,
            is_read: false,
            is_dismissed: false
        })
    }

    // 3. Streak insight (REAL DATA)
    if (analysis.currentStreak > 0) {
        if (analysis.streakHealth === 'thriving') {
            insights.push({
                user_id: userId,
                insight_type: 'streak_praise',
                title: `🔥 ${analysis.currentStreak}-Day Streak!`,
                message: `You're on fire! Your longest streak is ${analysis.longestStreak} days. Keep the momentum going.`,
                severity: 'success',
                action_items: [
                    'Ship something small today to maintain streak',
                    `${analysis.longestStreak - analysis.currentStreak <= 3 ? 'You\'re close to your record!' : 'Keep pushing!'}`
                ],
                is_actionable: false,
                is_read: false,
                is_dismissed: false
            })
        } else if (analysis.streakHealth === 'at_risk') {
            insights.push({
                user_id: userId,
                insight_type: 'streak_warning',
                title: `⚠️ Streak at Risk: ${analysis.currentStreak} days`,
                message: 'Your streak is small but growing. Don\'t break it now! Even a small commit keeps momentum.',
                severity: 'warning',
                action_items: [
                    'Commit something today - even docs or tests count',
                    'Set a daily reminder to ship',
                    'Prepare tomorrow\'s work before ending today'
                ],
                is_actionable: true,
                is_read: false,
                is_dismissed: false
            })
        }
    } else {
        insights.push({
            user_id: userId,
            insight_type: 'streak_broken',
            title: 'Start a New Streak Today',
            message: 'Your streak is at 0. The best time to start is now. Ship something today!',
            severity: 'alert',
            action_items: [
                'Make one commit today to start fresh',
                'Pick your easiest task and finish it',
                'Remember: consistency beats intensity'
            ],
            is_actionable: true,
            is_read: false,
            is_dismissed: false
        })
    }

    // 4. Weekly trend insight (REAL DATA)
    if (analysis.weeklyTrend === 'rising') {
        insights.push({
            user_id: userId,
            insight_type: 'trend_rising',
            title: `📈 Momentum Up ${Math.abs(analysis.weekOverWeekChange)}%`,
            message: `Your activity is increasing week-over-week. You shipped ${analysis.totalCommitsWeek} commits this week vs last week's pace.`,
            severity: 'success',
            action_items: [
                'Channel this energy into high-impact work',
                'Consider tackling that backlog item you\'ve been avoiding'
            ],
            is_actionable: true,
            is_read: false,
            is_dismissed: false
        })
    } else if (analysis.weeklyTrend === 'falling') {
        insights.push({
            user_id: userId,
            insight_type: 'trend_falling',
            title: `📉 Activity Down ${Math.abs(analysis.weekOverWeekChange)}%`,
            message: `Your commit rate dropped this week. Only ${analysis.totalCommitsWeek} commits vs your usual pace. Time to re-engage.`,
            severity: 'warning',
            action_items: [
                'Identify what\'s blocking you',
                'Break down large tasks into smaller pieces',
                'Start with a quick win to build momentum'
            ],
            is_actionable: true,
            is_read: false,
            is_dismissed: false
        })
    }

    // 5. Language focus insight (REAL DATA)
    if (analysis.topLanguage) {
        insights.push({
            user_id: userId,
            insight_type: 'language_focus',
            title: `Primary Stack: ${analysis.topLanguage}`,
            message: `You're focused on ${analysis.topLanguage} with ${analysis.languageDiversity} language${analysis.languageDiversity > 1 ? 's' : ''} in your toolkit. ${analysis.languageDiversity > 4 ? 'Great diversity!' : 'Consider deepening expertise.'}`,
            severity: 'info',
            action_items: analysis.languageDiversity > 4
                ? ['Consider specializing in 2-3 core languages', 'Depth often beats breadth for career growth']
                : ['Your focus is good', 'Consider learning one complementary language'],
            is_actionable: true,
            is_read: false,
            is_dismissed: false
        })
    }

    // 6. Work-life balance insight (REAL DATA)
    if (analysis.burnoutRisk) {
        insights.push({
            user_id: userId,
            insight_type: 'burnout_warning',
            title: '⚠️ Burnout Risk Detected',
            message: `You've coded every day this week with ${analysis.totalCommitsWeek} commits. This pace is unsustainable. Recovery is part of performance.`,
            severity: 'alert',
            action_items: [
                'Take at least one full day off this week',
                'Set boundaries on coding hours',
                'Sleep and exercise boost long-term output'
            ],
            is_actionable: true,
            is_read: false,
            is_dismissed: false
        })
    } else if (analysis.weekendCoder && analysis.weekendCommitRate > 50) {
        insights.push({
            user_id: userId,
            insight_type: 'weekend_balance',
            title: 'Heavy Weekend Coding',
            message: `${analysis.weekendCommitRate}% of your commits are on weekends. Balance is key for long-term productivity.`,
            severity: 'warning',
            action_items: [
                'Consider shifting some work to weekdays',
                'Protect time for rest and hobbies',
                'Burnout prevention is performance optimization'
            ],
            is_actionable: true,
            is_read: false,
            is_dismissed: false
        })
    }

    // 7. Collaboration insight (REAL DATA)
    if (analysis.collaborationScore > 0) {
        const isHighCollaborator = analysis.collaborationScore > 50
        insights.push({
            user_id: userId,
            insight_type: 'collaboration',
            title: isHighCollaborator ? 'Strong Team Player' : 'Solo Builder',
            message: isHighCollaborator
                ? `${analysis.totalPRs} PRs, ${analysis.totalReviews} reviews, ${analysis.totalIssues} issues. You're a team multiplier!`
                : `You've opened ${analysis.totalPRs} PRs and done ${analysis.totalReviews} reviews. Consider more collaboration.`,
            severity: isHighCollaborator ? 'success' : 'info',
            action_items: isHighCollaborator
                ? ['Keep mentoring others', 'Your reviews help the team ship faster']
                : ['Review more PRs to level up', 'Open issues when you spot problems', 'Collaboration compounds your impact'],
            is_actionable: true,
            is_read: false,
            is_dismissed: false
        })
    }

    // 8. Coding time preference (REAL DATA)
    if (analysis.preferredTimeOfDay !== 'balanced') {
        insights.push({
            user_id: userId,
            insight_type: 'time_preference',
            title: analysis.preferredTimeOfDay === 'early_bird' ? '🌅 Early Bird Coder' : '🌙 Night Owl Developer',
            message: analysis.preferredTimeOfDay === 'early_bird'
                ? 'You do your best work in the morning. Protect this time fiercely.'
                : 'You thrive at night. Make sure to get enough sleep to maintain this schedule sustainably.',
            severity: 'info',
            action_items: analysis.preferredTimeOfDay === 'early_bird'
                ? ['Schedule meetings for afternoons', 'Do deep work before lunch']
                : ['Ensure 7-8 hours of sleep', 'Use blue light filters at night'],
            is_actionable: true,
            is_read: false,
            is_dismissed: false
        })
    }

    // Limit to top 5 most relevant insights
    return insights.slice(0, 5)
}

// ==================== AI PROMPT ====================

function createDetailedPrompt(user: UserData, analysis: UserAnalysis, score: number): string {
    return `Analyze this developer's REAL GitHub activity and provide a personalized verdict:

**Developer Profile:**
- Username: ${user.username}
- Total Commits (All Time): ${user.total_commits}
- Current Streak: ${analysis.currentStreak} days
- Longest Streak: ${analysis.longestStreak} days
- Dev Flow Score: ${score}/100

**This Week's Activity:**
- Commits: ${analysis.totalCommitsWeek}
- Active Days: ${analysis.activeDaysWeek}/7
- Weekly Trend: ${analysis.weeklyTrend} (${analysis.weekOverWeekChange > 0 ? '+' : ''}${analysis.weekOverWeekChange}%)
- Peak Hours: ${analysis.peakCodingHours.join(', ')}
- Top Language: ${analysis.topLanguage || 'Unknown'}

**Collaboration:**
- PRs: ${analysis.totalPRs}
- Reviews: ${analysis.totalReviews}
- Issues: ${analysis.totalIssues}

**Risks Detected:**
- Burnout Risk: ${analysis.burnoutRisk ? 'YES' : 'No'}
- Inconsistency Warning: ${analysis.inconsistencyWarning ? 'YES' : 'No'}
- Stagnation Risk: ${analysis.stagnationRisk ? 'YES' : 'No'}

Based on this REAL data, provide a JSON response:
{
    "verdict": {
        "key": "short_snake_case_key",
        "text": "2-5 word punchy verdict based on their actual data",
        "subtext": "One specific sentence referencing their actual stats + emoji",
        "severity": "praise|neutral|warning|critical",
        "primary_factor": "consistency|volume|collaboration|recovery"
    },
    "archetype": {
        "type": "Builder|Architect|Grinder|Explorer|Tourist|Apprentice"
    },
    "actions": ["specific action 1 based on their data", "specific action 2", "specific action 3"]
}

Be direct, data-driven, and give them actionable advice based on their REAL numbers.`
}

// ==================== HELPERS ====================

async function generateAIResponse(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a harsh but fair engineering coach. Analyze real GitHub data and provide specific, actionable feedback. JSON only." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        })
        return JSON.parse(completion.choices[0]?.message?.content || '{}')
    } catch (error) {
        console.error('AI generation error:', error)
        return {
            verdict: {
                key: 'analysis_pending',
                text: 'Keep Building',
                subtext: 'AI analysis temporarily unavailable. Your stats are still being tracked.',
                severity: 'neutral',
                primary_factor: 'consistency'
            },
            archetype: { type: 'Apprentice' },
            actions: ['Keep shipping', 'Stay consistent', 'Check back later']
        }
    }
}

function mapSeverity(severity: string | undefined): 'info' | 'warning' | 'alert' | 'success' {
    switch (severity) {
        case 'praise': return 'success'
        case 'warning': return 'warning'
        case 'critical': return 'alert'
        default: return 'info'
    }
}
