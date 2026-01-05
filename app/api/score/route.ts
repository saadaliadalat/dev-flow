import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { DailyStats } from '@/types'

// GET: Calculate and return Dev Flow Score
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const score = await calculateDevFlowScore(userId)

        return NextResponse.json({ score })
    } catch (error) {
        console.error('Error calculating score:', error)
        return NextResponse.json({ error: 'Failed to calculate score' }, { status: 500 })
    }
}

async function calculateDevFlowScore(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]

    // Fetch user data
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    // Fetch last 14 days of stats
    const { data: recentStats } = await supabaseAdmin
        .from('daily_stats')
        .select('*')
        .eq('user_id', userId)
        .gte('date', twoWeeksAgo)
        .order('date', { ascending: false })

    const stats = (recentStats as DailyStats[]) || []
    const activeDays = stats.filter((s: DailyStats) => s.total_commits > 0).length
    const totalCommits = stats.reduce((sum: number, s: DailyStats) => sum + (s.total_commits || 0), 0)
    const totalPRs = stats.reduce((sum: number, s: DailyStats) => sum + (s.prs_merged || 0), 0)
    const totalHours = stats.reduce((sum: number, s: DailyStats) => sum + (s.coding_duration_minutes || 0) / 60, 0)

    // 1. Building vs Consuming Ratio (30% weight)
    const shippingScore = Math.min(100, (totalPRs * 20) + (totalCommits * 2))
    const consumingPenalty = (totalHours > 50 && totalCommits < 20) ? 30 : 0
    const buildingRatioScore = Math.max(0, Math.min(100, shippingScore - consumingPenalty))

    // 2. Consistency Score (25% weight)
    const consistencyScore = Math.min(100, Math.round((activeDays / 14) * 100 * 1.2))

    // 3. Shipping Frequency (20% weight)
    const weeklyPRs = totalPRs / 2
    const shippingFreqScore = Math.min(100, Math.round((weeklyPRs / 3) * 100))

    // 4. Focus Depth (15% weight)
    const avgHoursPerDay = activeDays > 0 ? totalHours / activeDays : 0
    const focusScore = Math.min(100, Math.round((avgHoursPerDay / 3) * 100))

    // 5. Recovery Balance (10% weight)
    const restDays = 14 - activeDays
    const idealRestDays = 4
    const restBalance = 1 - Math.abs(restDays - idealRestDays) / idealRestDays
    const recoveryScore = Math.max(0, Math.min(100, Math.round(restBalance * 100)))

    // Calculate weighted total
    const totalScore = Math.round(
        (buildingRatioScore * 0.30) +
        (consistencyScore * 0.25) +
        (shippingFreqScore * 0.20) +
        (focusScore * 0.15) +
        (recoveryScore * 0.10)
    )

    // Anti-gaming detection
    let gamingDetected = false
    let gamingPenalty = 0
    let gamingReason: string | null = null

    if (totalHours > 40 && totalCommits < 10) {
        gamingDetected = true
        gamingPenalty = 10
        gamingReason = 'Long sessions with minimal output detected'
    }

    const burstDay = stats.find((s: DailyStats) => s.total_commits > 20)
    if (burstDay) {
        const hourlyData = burstDay.commits_by_hour || {}
        const peakHour = Math.max(...Object.values(hourlyData).map(v => Number(v) || 0))
        if (peakHour > 15) {
            gamingDetected = true
            gamingPenalty += 5
            gamingReason = 'Commit batching detected'
        }
    }

    const finalScore = Math.max(0, Math.min(100, totalScore - gamingPenalty))

    // Get yesterday's score
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const { data: yesterdayScore } = await supabaseAdmin
        .from('dev_flow_scores')
        .select('total_score')
        .eq('user_id', userId)
        .eq('date', yesterday)
        .single()

    const scoreChange = yesterdayScore ? finalScore - (yesterdayScore.total_score || 50) : 0

    // Get global average for percentile
    const { data: globalData } = await supabaseAdmin
        .from('users')
        .select('dev_flow_score')
        .not('dev_flow_score', 'is', null)

    const allScores = (globalData || []).map((u: any) => u.dev_flow_score).sort((a: number, b: number) => a - b)
    const userRank = allScores.filter((s: number) => s < finalScore).length
    const percentile = allScores.length > 0 ? Math.round((userRank / allScores.length) * 100) : 50
    const globalAvg = allScores.length > 0
        ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
        : 50

    // Calculate weekly average
    const weeklyAvg = Math.round(
        stats.slice(0, 7).reduce((sum: number, s: DailyStats) => sum + (s.productivity_score || 0), 0) / Math.max(1, Math.min(7, stats.length))
    )

    // Save score snapshot
    const scoreData = {
        user_id: userId,
        date: today,
        building_ratio_score: buildingRatioScore,
        consistency_score: consistencyScore,
        shipping_score: shippingFreqScore,
        focus_score: focusScore,
        recovery_score: recoveryScore,
        total_score: finalScore,
        score_change: scoreChange,
        gaming_detected: gamingDetected,
        gaming_penalty: gamingPenalty,
        gaming_reason: gamingReason,
        weekly_avg: weeklyAvg,
        global_avg: globalAvg,
        percentile: percentile,
        computed_at: new Date().toISOString()
    }

    await supabaseAdmin
        .from('dev_flow_scores')
        .upsert(scoreData, { onConflict: 'user_id,date' })

    // Update user's dev_flow_score
    await supabaseAdmin
        .from('users')
        .update({ dev_flow_score: finalScore })
        .eq('id', userId)

    return {
        total_score: finalScore,
        score_change: scoreChange,
        components: {
            building_ratio: buildingRatioScore,
            consistency: consistencyScore,
            shipping: shippingFreqScore,
            focus: focusScore,
            recovery: recoveryScore
        },
        comparisons: {
            yesterday: yesterdayScore?.total_score || null,
            weekly_avg: weeklyAvg,
            global_avg: globalAvg,
            percentile: percentile
        },
        anti_gaming: {
            detected: gamingDetected,
            penalty: gamingPenalty,
            reason: gamingReason
        }
    }
}
