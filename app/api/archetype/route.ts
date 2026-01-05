import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ARCHETYPES } from '@/lib/devflow-data'
import { ArchetypeKey, DailyStats } from '@/types'

// GET: Get current archetype or compute if none exists
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id

        // Check if user has a current archetype
        const { data: currentArchetype } = await supabaseAdmin
            .from('archetype_history')
            .select('*')
            .eq('user_id', userId)
            .is('valid_until', null)
            .order('assigned_at', { ascending: false })
            .limit(1)
            .single()

        if (currentArchetype) {
            const definition = ARCHETYPES[currentArchetype.archetype as ArchetypeKey]
            return NextResponse.json({
                archetype: currentArchetype,
                definition,
                can_reveal: false
            })
        }

        // Check if user has enough data
        const { count } = await supabaseAdmin
            .from('daily_stats')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        const hasEnoughData = (count || 0) >= 5

        return NextResponse.json({
            archetype: null,
            definition: null,
            can_reveal: hasEnoughData,
            days_until_reveal: hasEnoughData ? 0 : 5 - (count || 0)
        })
    } catch (error) {
        console.error('Error fetching archetype:', error)
        return NextResponse.json({ error: 'Failed to fetch archetype' }, { status: 500 })
    }
}

// POST: Compute and assign archetype
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const archetype = await computeArchetype(userId)

        if (!archetype) {
            return NextResponse.json({
                error: 'Not enough data to determine archetype',
                days_needed: 5
            }, { status: 400 })
        }

        return NextResponse.json({ archetype, fresh: true })
    } catch (error) {
        console.error('Error computing archetype:', error)
        return NextResponse.json({ error: 'Failed to compute archetype' }, { status: 500 })
    }
}

async function computeArchetype(userId: string) {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]

    // Fetch user stats
    const { data: recentStats } = await supabaseAdmin
        .from('daily_stats')
        .select('*')
        .eq('user_id', userId)
        .gte('date', twoWeeksAgo)
        .order('date', { ascending: false })

    const stats = recentStats as DailyStats[] | null

    if (!stats || stats.length < 5) {
        return null
    }

    // Calculate trigger metrics
    const metrics = {
        total_commits: stats.reduce((sum: number, s: DailyStats) => sum + (s.total_commits || 0), 0),
        total_prs: stats.reduce((sum: number, s: DailyStats) => sum + (s.prs_merged || 0), 0),
        active_days: stats.filter((s: DailyStats) => s.total_commits > 0).length,
        weekend_commits: stats
            .filter((s: DailyStats) => {
                const day = new Date(s.date).getDay()
                return day === 0 || day === 6
            })
            .reduce((sum: number, s: DailyStats) => sum + (s.total_commits || 0), 0),
        weekday_commits: stats
            .filter((s: DailyStats) => {
                const day = new Date(s.date).getDay()
                return day > 0 && day < 6
            })
            .reduce((sum: number, s: DailyStats) => sum + (s.total_commits || 0), 0),
        late_night_commits: stats.reduce((sum: number, s: DailyStats) => {
            const byHour = s.commits_by_hour || {}
            const lateNight = ['22', '23', '0', '1', '2', '3']
            return sum + lateNight.reduce((h: number, hour: string) => h + (Number(byHour[hour]) || 0), 0)
        }, 0),
        max_daily_commits: Math.max(...stats.map((s: DailyStats) => s.total_commits || 0)),
        variance: calculateVariance(stats.map((s: DailyStats) => s.total_commits || 0)),
        avg_hours: stats.reduce((sum: number, s: DailyStats) => sum + (s.coding_duration_minutes || 0), 0) / 60 / stats.length
    }

    // Score each archetype
    const scores: Record<ArchetypeKey, number> = {
        tutorial_addict: 0,
        chaos_coder: 0,
        burnout_sprinter: 0,
        silent_builder: 0,
        momentum_machine: 0,
        consistent_operator: 0,
        overnight_architect: 0,
        weekend_warrior: 0
    }

    // Tutorial Addict: High hours, low output
    if (metrics.avg_hours > 3 && metrics.total_prs < 2) {
        scores.tutorial_addict += 40
    }
    if (metrics.total_commits < 20 && metrics.active_days < 7) {
        scores.tutorial_addict += 30
    }

    // Chaos Coder: High variance
    if (metrics.variance > 50) {
        scores.chaos_coder += 40
    }
    if (metrics.max_daily_commits > 30 && metrics.active_days < 7) {
        scores.chaos_coder += 30
    }

    // Burnout Sprinter: High hours, many days
    if (metrics.avg_hours > 6 && metrics.active_days >= 10) {
        scores.burnout_sprinter += 50
    }

    // Silent Builder: Consistent, low variance
    if (metrics.variance < 20 && metrics.active_days >= 10) {
        scores.silent_builder += 40
    }
    if (metrics.total_prs < 3 && metrics.total_commits > 30) {
        scores.silent_builder += 20
    }

    // Momentum Machine: 7+ day streak, high output
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('current_streak')
        .eq('id', userId)
        .single()

    if ((user?.current_streak || 0) >= 7) {
        scores.momentum_machine += 50
    }
    if (metrics.total_prs >= 3 && metrics.active_days >= 10) {
        scores.momentum_machine += 30
    }

    // Consistent Operator: Low variance, moderate output
    if (metrics.variance < 15 && metrics.active_days >= 10) {
        scores.consistent_operator += 40
    }
    if (metrics.total_commits >= 30 && metrics.total_commits <= 80) {
        scores.consistent_operator += 20
    }

    // Overnight Architect: 60%+ late night
    const lateNightRatio = metrics.total_commits > 0
        ? metrics.late_night_commits / metrics.total_commits
        : 0
    if (lateNightRatio > 0.5) {
        scores.overnight_architect += 60
    } else if (lateNightRatio > 0.3) {
        scores.overnight_architect += 30
    }

    // Weekend Warrior: 60%+ weekend
    const weekendRatio = metrics.total_commits > 0
        ? metrics.weekend_commits / metrics.total_commits
        : 0
    if (weekendRatio > 0.5) {
        scores.weekend_warrior += 60
    } else if (weekendRatio > 0.3) {
        scores.weekend_warrior += 30
    }

    // Find highest scoring archetype
    const sortedArchetypes = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)

    const [winningKey, winningScore] = sortedArchetypes[0]
    const archetypeKey = winningScore > 20 ? winningKey as ArchetypeKey : 'silent_builder'
    const definition = ARCHETYPES[archetypeKey]

    // Mark any existing archetype as superseded
    await supabaseAdmin
        .from('archetype_history')
        .update({ valid_until: new Date().toISOString() })
        .eq('user_id', userId)
        .is('valid_until', null)

    // Insert new archetype
    const { data: newArchetype, error } = await supabaseAdmin
        .from('archetype_history')
        .insert({
            user_id: userId,
            archetype: archetypeKey,
            archetype_name: definition.name,
            strengths: definition.strengths,
            weaknesses: definition.weaknesses,
            description: definition.description,
            trigger_metrics: metrics,
            confidence_score: Math.min(0.95, winningScore / 100),
            assigned_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Failed to save archetype:', error)
        throw error
    }

    // Update user record
    await supabaseAdmin
        .from('users')
        .update({
            archetype: archetypeKey,
            archetype_assigned_at: new Date().toISOString()
        })
        .eq('id', userId)

    return {
        ...newArchetype,
        definition
    }
}

function calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length)
}
