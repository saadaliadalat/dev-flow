import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
    try {
        const { userId } = await req.json()

        // Fetch user's recent stats
        const { data: stats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(30)

        if (!stats || stats.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Not enough data for insights'
            })
        }

        // Prepare data summary for AI
        const summary = {
            totalDays: stats.length,
            avgCommitsPerDay: stats.reduce((sum, s) => sum + s.total_commits, 0) / stats.length,
            avgProductivityScore: stats.reduce((sum, s) => sum + s.productivity_score, 0) / stats.length,
            mostActiveHours: getMostActiveHours(stats),
            topLanguages: getTopLanguages(stats),
            weekendActivity: stats.filter(s => s.is_weekend && s.total_commits > 0).length,
            restDays: stats.filter(s => s.is_rest_day).length
        }

        // Generate insights using Gemini 2.0 Flash
        const prompt = `You are an expert developer productivity coach. Analyze this developer's coding patterns and provide 3-5 actionable insights.

Data:
- Active days: ${summary.totalDays}
- Average commits/day: ${summary.avgCommitsPerDay.toFixed(1)}
- Productivity score: ${summary.avgProductivityScore.toFixed(0)}/100
- Most active hours: ${summary.mostActiveHours.join(', ')}
- Top languages: ${summary.topLanguages.join(', ')}
- Weekend coding days: ${summary.weekendActivity}
- Rest days: ${summary.restDays}

Provide insights in JSON format:
{
  "insights": [
    {
      "type": "productivity_tip" | "burnout_warning" | "pattern_detected" | "recommendation",
      "severity": "info" | "warning" | "alert" | "success",
      "title": "Short title",
      "message": "Detailed message",
      "actionItems": ["Action 1", "Action 2"]
    }
  ]
}

Focus on:
1. Productivity patterns
2. Work-life balance
3. Skill development
4. Burnout risks
5. Optimization opportunities`

        // Configure Gemini model with JSON response mode
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 2000,
            }
        })

        // Generate content
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse JSON response
        let aiResponse
        try {
            aiResponse = JSON.parse(text)
        } catch (parseError) {
            console.error('JSON parsing error:', parseError)
            console.error('Raw response:', text)
            throw new Error('Failed to parse AI response as JSON')
        }

        // Validate response structure
        if (!aiResponse.insights || !Array.isArray(aiResponse.insights)) {
            throw new Error('Invalid AI response structure')
        }

        // Store insights in database
        const insightInserts = aiResponse.insights.map((insight: any) => ({
            user_id: userId,
            insight_type: insight.type,
            title: insight.title,
            message: insight.message,
            severity: insight.severity,
            action_items: insight.actionItems || [],
            is_actionable: (insight.actionItems?.length || 0) > 0,
            generated_by: 'gemini-2.0-flash',
            confidence_score: 0.85,
            based_on_data: { period: '30 days', stats: summary }
        }))

        const { error } = await supabase
            .from('insights')
            .insert(insightInserts)

        if (error) throw error

        return NextResponse.json({
            success: true,
            insights: aiResponse.insights
        })

    } catch (error: any) {
        console.error('Insight generation error:', error)

        // Handle specific Gemini errors
        let errorMessage = 'Failed to generate insights'
        let statusCode = 500

        if (error.message?.includes('API key')) {
            errorMessage = 'Invalid Gemini API key'
            statusCode = 401
        } else if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate limit') || error.message?.includes('429')) {
            // Quota exceeded - generate fallback insights locally
            console.log('Gemini quota exceeded, generating fallback insights...')

            try {
                const { userId } = await req.json().catch(() => ({ userId: null }))

                if (userId) {
                    const fallbackInsights = [
                        {
                            user_id: userId,
                            insight_type: 'productivity_tip',
                            title: 'Keep Up the Momentum!',
                            message: 'Your coding activity shows consistent engagement. Consider setting specific daily goals to maintain this streak.',
                            severity: 'info',
                            action_items: ['Set a daily commit goal', 'Use time-blocking for focused coding sessions'],
                            is_actionable: true,
                            generated_by: 'fallback',
                            confidence_score: 0.7
                        },
                        {
                            user_id: userId,
                            insight_type: 'recommendation',
                            title: 'Review Your Progress',
                            message: 'Take a moment to review your recent commits and identify patterns in your most productive hours.',
                            severity: 'info',
                            action_items: ['Check your activity chart', 'Optimize your schedule around peak hours'],
                            is_actionable: true,
                            generated_by: 'fallback',
                            confidence_score: 0.6
                        }
                    ]

                    await supabase.from('insights').insert(fallbackInsights)

                    return NextResponse.json({
                        success: true,
                        message: 'Generated fallback insights (AI quota exceeded)',
                        insights: fallbackInsights
                    })
                }
            } catch (fallbackError) {
                console.error('Fallback insight generation failed:', fallbackError)
            }

            errorMessage = 'AI quota exceeded. Try again later or upgrade your Gemini API plan.'
            statusCode = 429
        } else if (error.message?.includes('parse')) {
            errorMessage = 'Failed to parse AI response'
        }

        return NextResponse.json({
            error: errorMessage,
            details: error.message
        }, { status: statusCode })
    }
}

function getMostActiveHours(stats: any[]): number[] {
    const hourCounts: Record<number, number> = {}

    stats.forEach(day => {
        if (day.commits_by_hour) {
            Object.entries(day.commits_by_hour).forEach(([hour, count]: [string, any]) => {
                hourCounts[parseInt(hour)] = (hourCounts[parseInt(hour)] || 0) + count
            })
        }
    })

    return Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => parseInt(hour))
}

function getTopLanguages(stats: any[]): string[] {
    const langCounts: Record<string, number> = {}

    stats.forEach(day => {
        if (day.languages) {
            Object.entries(day.languages).forEach(([lang, count]: [string, any]) => {
                langCounts[lang] = (langCounts[lang] || 0) + count
            })
        }
    })

    return Object.entries(langCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang)
}
