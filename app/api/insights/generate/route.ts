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

        // 1. Fetch user's recent stats (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: stats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: false })

        // 2. Mock Data Check & Summary
        let summary;
        let isMockData = false;

        if (!stats || stats.length === 0) {
            console.log('⚠️ No stats found for user. Using mock data for initial analysis.')
            summary = getMockStats()
            isMockData = true
        } else {
            summary = calculateSummary(stats)
        }

        // 3. Compute Dev Flow Score (Deterministic)
        const scoreComponents = calculateScoreComponents(summary)
        const totalScore = Math.round(
            (scoreComponents.building_ratio * 0.3) +
            (scoreComponents.consistency * 0.25) +
            (scoreComponents.shipping * 0.2) +
            (scoreComponents.focus * 0.15) +
            (scoreComponents.recovery * 0.1)
        )

        // 4. Generate AI Verdict (Probabilistic)
        const aiPrompt = createVerdictPrompt(summary, totalScore, isMockData)
        const aiResponse = await generateAIResponse(aiPrompt)

        // 5. Store Data
        const today = new Date().toISOString().split('T')[0]

        // Store Score
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
                score_change: 0, // Need previous score to calc real change, defaulting 0
                weekly_avg: totalScore, // Simplify for now
                global_avg: 72, // Mock global avg
                percentile: totalScore > 72 ? 20 : 50
            }, { onConflict: 'user_id,date' })

        // Store Verdict
        await supabase
            .from('daily_verdicts')
            .upsert({
                user_id: userId,
                date: today,
                verdict_key: aiResponse.verdict.key || 'neutral_day',
                verdict_text: aiResponse.verdict.text,
                verdict_subtext: aiResponse.verdict.subtext,
                severity: aiResponse.verdict.severity,
                dev_flow_score: totalScore,
                primary_factor: aiResponse.verdict.primary_factor
            }, { onConflict: 'user_id,date' })

        // Also update User profile with latest score
        await supabase.from('users').update({
            dev_flow_score: totalScore,
            archetype: aiResponse.archetype?.type || 'Apprentice'
        }).eq('id', userId)

        return NextResponse.json({
            success: true,
            score: totalScore,
            verdict: aiResponse.verdict
        })

    } catch (error: any) {
        console.error('❌ Intelligence generation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// --- Helpers ---

function calculateSummary(stats: any[]) {
    const totalCommits = stats.reduce((sum, s) => sum + (s.total_commits || 0), 0)
    const activeDays = stats.filter(s => (s.total_commits || 0) > 0).length
    return {
        totalCommits,
        activeDays,
        daysTracked: stats.length || 1,
        commitsPerDay: totalCommits / (stats.length || 1),
        recentTrend: stats.slice(0, 3).reduce((sum, s) => sum + s.total_commits, 0) // last 3 days
    }
}

function calculateScoreComponents(summary: any) {
    // Simple heuristic logic for now
    return {
        building_ratio: Math.min(summary.totalCommits * 2, 100), // Volume
        consistency: Math.min((summary.activeDays / summary.daysTracked) * 100 * 1.5, 100), // Frequency
        shipping: 50, // Placeholder (needs PR data)
        focus: Math.min(summary.commitsPerDay * 20, 100), // Density
        recovery: 80 // Assume good rest
    }
}

function getMockStats() {
    return { totalCommits: 5, activeDays: 1, daysTracked: 1, commitsPerDay: 5, recentTrend: 5 }
}

function createVerdictPrompt(summary: any, score: number, isMock: boolean) {
    return `Analyze developer stats: Score ${score}/100. Commits: ${summary.totalCommits} in ${summary.daysTracked} days.
    ${isMock ? 'This is a NEW USER. Be welcoming but challenging.' : ''}
    
    Return JSON:
    {
        "verdict": {
            "key": "short_snake_case_summary",
            "text": "2-5 word punchy verdict (e.g. 'Shipping Machine', 'Tutorial Hell')",
            "subtext": "One sentence explaining why + emoji",
            "severity": "praise|neutral|warning|critical",
            "primary_factor": "consistency|volume|shipping"
        },
        "archetype": {
            "type": "Builder|Architect|Grinder|Tourist"
        }
    }`
}

async function generateAIResponse(prompt: string) {
    const completion = await groq.chat.completions.create({
        messages: [{ role: "system", content: "You are a harsh but fair engineering coach. JSON only." }, { role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
    })
    return JSON.parse(completion.choices[0]?.message?.content || '{}')
}

