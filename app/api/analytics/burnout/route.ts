import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const githubId = (session.user as any).githubId

        // Get user's internal ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch last 30 days of data
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)

        const { data: stats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: true })

        if (!stats || stats.length < 7) {
            return NextResponse.json({
                success: true,
                burnout_risk_score: 0,
                risk_level: 'low',
                message: 'Not enough data for burnout analysis'
            })
        }

        // Calculate burnout risk factors
        const factors = {
            long_hours: calculateLongHoursFactor(stats),
            weekend_work: calculateWeekendFactor(stats),
            late_night: calculateLateNightFactor(stats),
            no_breaks: calculateNoBreaksFactor(stats),
            productivity_decline: calculateProductivityDecline(stats),
            inconsistent_patterns: calculateInconsistencyFactor(stats)
        }

        // Weighted risk score (0-1)
        const burnoutScore = (
            factors.long_hours * 0.25 +
            factors.weekend_work * 0.15 +
            factors.late_night * 0.20 +
            factors.no_breaks * 0.20 +
            factors.productivity_decline * 0.15 +
            factors.inconsistent_patterns * 0.05
        )

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' | 'critical'
        if (burnoutScore < 0.3) riskLevel = 'low'
        else if (burnoutScore < 0.5) riskLevel = 'medium'
        else if (burnoutScore < 0.75) riskLevel = 'high'
        else riskLevel = 'critical'

        // Generate recommendations
        const recommendations = generateRecommendations(factors, riskLevel)

        // Store prediction
        await supabase.from('burnout_predictions').insert({
            user_id: user.id,
            burnout_risk_score: burnoutScore,
            risk_level: riskLevel,
            factors: Object.entries(factors).map(([key, value]) => ({
                factor: key,
                weight: value,
                description: getFactorDescription(key, value)
            })),
            recommendations,
            model_version: 'v1.0',
            confidence: 0.85
        })

        return NextResponse.json({
            success: true,
            burnout_risk_score: burnoutScore,
            risk_level: riskLevel,
            factors,
            recommendations
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Burnout analysis failed',
            details: error.message
        }, { status: 500 })
    }
}

function calculateLongHoursFactor(stats: any[]): number {
    const longDays = stats.filter(s => s.active_hours > 10).length
    return Math.min(longDays / stats.length, 1)
}

function calculateWeekendFactor(stats: any[]): number {
    const weekendDays = stats.filter(s => s.is_weekend && s.total_commits > 0).length
    const totalWeekends = Math.floor(stats.length / 7) * 2
    return totalWeekends > 0 ? Math.min(weekendDays / totalWeekends, 1) : 0
}

function calculateLateNightFactor(stats: any[]): number {
    let lateNightCommits = 0
    let totalCommits = 0

    stats.forEach(day => {
        if (day.commits_by_hour) {
            // Check late night hours: 22, 23 (10pm-midnight)
            for (let hour = 22; hour <= 23; hour++) {
                lateNightCommits += day.commits_by_hour[hour] || 0
            }
            // Check early morning hours: 0, 1, 2 (midnight-3am)
            for (let hour = 0; hour <= 2; hour++) {
                lateNightCommits += day.commits_by_hour[hour] || 0
            }
            totalCommits += day.total_commits
        }
    })

    return totalCommits > 0 ? Math.min(lateNightCommits / totalCommits, 1) : 0
}

function calculateNoBreaksFactor(stats: any[]): number {
    let maxConsecutive = 0
    let current = 0

    stats.forEach(day => {
        if (day.total_commits > 0) {
            current++
            maxConsecutive = Math.max(maxConsecutive, current)
        } else {
            current = 0
        }
    })

    return Math.min(maxConsecutive / 14, 1)
}

function calculateProductivityDecline(stats: any[]): number {
    if (stats.length < 14) return 0

    const midpoint = Math.floor(stats.length / 2)
    const firstHalf = stats.slice(0, midpoint)
    const secondHalf = stats.slice(midpoint)

    const firstAvg = firstHalf.reduce((sum, s) => sum + s.productivity_score, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.productivity_score, 0) / secondHalf.length

    const decline = (firstAvg - secondAvg) / firstAvg

    return Math.max(Math.min(decline, 1), 0)
}

function calculateInconsistencyFactor(stats: any[]): number {
    const scores = stats.map(s => s.productivity_score)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const stdDev = Math.sqrt(variance)

    return Math.min(stdDev / 30, 1)
}

function generateRecommendations(factors: any, riskLevel: string): any[] {
    const recommendations: any[] = []

    if (factors.long_hours > 0.5) {
        recommendations.push({
            action: 'Reduce daily coding hours',
            priority: 'high',
            description: 'Try to limit active coding to 8-9 hours per day'
        })
    }

    if (factors.weekend_work > 0.6) {
        recommendations.push({
            action: 'Take weekends off',
            priority: 'high',
            description: 'Reserve at least one full weekend day for rest'
        })
    }

    if (factors.late_night > 0.4) {
        recommendations.push({
            action: 'Establish a coding cutoff time',
            priority: 'medium',
            description: 'Avoid coding after 10pm to improve sleep quality'
        })
    }

    if (factors.no_breaks > 0.7) {
        recommendations.push({
            action: 'Schedule regular breaks',
            priority: 'critical',
            description: 'Take at least one full rest day per week'
        })
    }

    if (factors.productivity_decline > 0.3) {
        recommendations.push({
            action: 'Address declining productivity',
            priority: 'high',
            description: 'Consider taking a short break to recharge'
        })
    }

    return recommendations
}

function getFactorDescription(factor: string, value: number): string {
    const descriptions: Record<string, string> = {
        long_hours: `You're coding for extended hours ${Math.round(value * 100)}% of the time`,
        weekend_work: `You work on weekends ${Math.round(value * 100)}% of the time`,
        late_night: `${Math.round(value * 100)}% of your commits are late at night`,
        no_breaks: `You've gone ${Math.round(value * 14)} days without a break`,
        productivity_decline: `Your productivity has declined ${Math.round(value * 100)}%`,
        inconsistent_patterns: `Your coding patterns show ${Math.round(value * 100)}% inconsistency`
    }

    return descriptions[factor] || ''
}
