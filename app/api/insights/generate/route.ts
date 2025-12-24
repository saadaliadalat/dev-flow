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

export async function POST(req: Request) {
    try {
        const { userId } = await req.json()

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        // Note: Frontend has 5-minute cooldown, no server-side rate limit needed

        // Fetch user's recent stats (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: stats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: false })

        let summary;
        let isMockData = false;

        // 2. Mock Data Generation (if no stats found)
        if (!stats || stats.length === 0) {
            console.log('⚠️ No stats found for user. Generating mock data for AI context...')
            summary = getMockStats()
            isMockData = true
        } else {
            // Calculate real summary stats
            const totalCommits = stats.reduce((sum, s) => sum + (s.total_commits || 0), 0)
            const avgProductivity = stats.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / stats.length
            const mostActiveHours = getMostActiveHours(stats)
            const topLanguages = getTopLanguages(stats)
            const activeDays = stats.filter(s => (s.total_commits || 0) > 0).length
            const weekendActivity = stats.filter(s => s.is_weekend && s.total_commits > 0).length
            const restDays = stats.filter(s => s.is_rest_day).length

            summary = {
                totalCommits,
                avgProductivity: Math.round(avgProductivity),
                mostActiveHours,
                topLanguages,
                activeDays,
                daysTracked: stats.length,
                weekendActivity,
                restDays
            }
        }

        console.log('📊 Generating insights for user:', userId)
        console.log('📈 Stats summary:', summary)

        // Create detailed prompt
        const prompt = `You are an expert developer productivity analyst. Analyze this GitHub activity data and provide 5 actionable insights.
${isMockData ? 'NOTE: This is a new user with empty history. Generate "getting started" and "best practice" insights based on these idealized beginner stats.' : ''}

DEVELOPER DATA (Last 30 Days):
- Total Commits: ${summary.totalCommits}
- Average Productivity Score: ${summary.avgProductivity}/100
- Active Days: ${summary.activeDays} out of ${summary.daysTracked}
- Most Active Hours: ${summary.mostActiveHours.length > 0 ? summary.mostActiveHours.join(', ') + ':00' : 'Not enough data'}
- Top Languages: ${summary.topLanguages.length > 0 ? summary.topLanguages.join(', ') : 'Not specified'}
- Weekend Coding Days: ${summary.weekendActivity}
- Rest Days: ${summary.restDays}

Generate EXACTLY 5 insights in this JSON format:
{
  "insights": [
    {
      "type": "productivity|burnout|skill|pattern|optimization",
      "title": "Brief actionable title (max 60 chars)",
      "message": "Detailed insight with specific numbers and context (2-3 sentences)",
      "severity": "info|warning|critical",
      "actionItems": ["Specific action 1", "Specific action 2"]
    }
  ]
}

FOCUS AREAS:
1. Productivity patterns and trends
2. Work-life balance and burnout risk
3. Skill development opportunities
4. Coding habits optimization
5. Performance improvements

REQUIREMENTS:
- Use actual data from the summary above
- Be specific with numbers
- Provide 2-3 actionable items per insight
- Mix severity levels (mostly info, some warning if needed)
- Make insights unique and personalized
- Be encouraging and constructive

Return ONLY valid JSON, no markdown or extra text.`

        // Generate insights with Groq (Llama 3.3 70B)
        console.log('🚀 Calling Groq API...')

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert developer productivity analyst. Always respond with valid JSON only. Be specific, data-driven, and actionable. Focus on being helpful and encouraging."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.9,
            response_format: { type: "json_object" }
        })

        const responseText = completion.choices[0]?.message?.content || '{}'

        console.log('✅ Groq response received')
        console.log('📊 Tokens used:', {
            prompt: completion.usage?.prompt_tokens,
            completion: completion.usage?.completion_tokens,
            total: completion.usage?.total_tokens
        })

        // Parse JSON response
        let aiResponse
        try {
            aiResponse = JSON.parse(responseText)
        } catch (e) {
            console.error('❌ JSON parse error:', responseText.substring(0, 500))
            return NextResponse.json({
                error: 'Failed to parse AI response',
                raw: responseText.substring(0, 500)
            }, { status: 500 })
        }

        // Validate response structure
        if (!aiResponse.insights || !Array.isArray(aiResponse.insights)) {
            console.error('❌ Invalid response format:', aiResponse)
            return NextResponse.json({
                error: 'Invalid AI response format'
            }, { status: 500 })
        }

        // Validate and filter insights
        const validInsights = aiResponse.insights
            .filter((insight: any) =>
                insight.title &&
                insight.message &&
                insight.type &&
                insight.severity
            )
            .slice(0, 5)

        if (validInsights.length === 0) {
            return NextResponse.json({
                error: 'No valid insights generated'
            }, { status: 500 })
        }

        // Delete old insights for this user
        await supabase
            .from('insights')
            .delete()
            .eq('user_id', userId)

        // Store new insights in database
        const insightInserts = validInsights.map((insight: any) => ({
            user_id: userId,
            insight_type: insight.type,
            title: insight.title.substring(0, 100),
            message: insight.message.substring(0, 500),
            severity: insight.severity,
            action_items: Array.isArray(insight.actionItems) ? insight.actionItems : [],
            is_actionable: Array.isArray(insight.actionItems) && insight.actionItems.length > 0,
            generated_by: 'groq-llama-3.3-70b',
            confidence_score: 0.85,
            based_on_data: {
                period: '30 days',
                stats: summary,
                is_mock: isMockData
            }
        }))

        const { error: insertError } = await supabase
            .from('insights')
            .insert(insightInserts)

        if (insertError) {
            console.error('❌ Supabase insert error:', insertError)
            throw insertError
        }

        console.log(`✅ Generated and stored ${validInsights.length} insights successfully`)

        return NextResponse.json({
            success: true,
            insights: validInsights,
            count: validInsights.length,
            generatedBy: 'groq-llama-3.3-70b',
            tokensUsed: completion.usage?.total_tokens || 0,
            isMockData
        })

    } catch (error: any) {
        console.error('❌ Insight generation error:', error)

        // Handle specific Groq errors
        if (error.status === 429) {
            return NextResponse.json({
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please try again in a moment.'
            }, { status: 429 })
        }

        if (error.status === 401) {
            return NextResponse.json({
                error: 'Invalid API key',
                message: 'GROQ_API_KEY is invalid or missing'
            }, { status: 401 })
        }

        return NextResponse.json({
            error: 'Failed to generate insights',
            message: error.message,
            type: error.constructor.name
        }, { status: 500 })
    }
}

// Helper: Get mock stats for new users
function getMockStats() {
    return {
        totalCommits: 45,
        avgProductivity: 72,
        mostActiveHours: [10, 14, 16],
        topLanguages: ['TypeScript', 'JavaScript', 'Python'],
        activeDays: 12,
        daysTracked: 30,
        weekendActivity: 2,
        restDays: 18
    }
}

// Helper: Get most active coding hours
function getMostActiveHours(stats: any[]): number[] {
    const hourCounts: { [key: number]: number } = {}

    stats.forEach(day => {
        if (day.commits_by_hour && typeof day.commits_by_hour === 'object') {
            Object.entries(day.commits_by_hour).forEach(([hour, count]) => {
                const h = parseInt(hour)
                if (!isNaN(h) && h >= 0 && h <= 23) {
                    hourCounts[h] = (hourCounts[h] || 0) + (count as number)
                }
            })
        }
    })

    return Object.entries(hourCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([hour]) => parseInt(hour))
}

// Helper: Get top programming languages
function getTopLanguages(stats: any[]): string[] {
    const langCounts: { [key: string]: number } = {}

    stats.forEach(day => {
        if (day.languages && typeof day.languages === 'object') {
            Object.entries(day.languages).forEach(([lang, count]) => {
                if (lang && lang !== 'null' && lang !== 'undefined') {
                    langCounts[lang] = (langCounts[lang] || 0) + (count as number)
                }
            })
        }
    })

    return Object.entries(langCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([lang]) => lang)
}
