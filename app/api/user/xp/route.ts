import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/db'
import { calculateLevel, calculateSyncXp, formatXp, getNextMilestone } from '@/lib/xp'

/**
 * GET /api/user/xp
 * Get current user's XP, level, and progress
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('xp, level, level_title, streak_freezes, current_streak, total_commits, total_prs')
            .eq('id', session.user.id)
            .single()

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const levelInfo = calculateLevel(user.xp || 0)
        const nextMilestone = getNextMilestone(user.xp || 0)

        // Get recent XP transactions
        const { data: recentTransactions } = await supabase
            .from('xp_transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        // Calculate XP earned today
        const today = new Date().toISOString().split('T')[0]
        const { data: todayTransactions } = await supabase
            .from('xp_transactions')
            .select('amount')
            .eq('user_id', session.user.id)
            .gte('created_at', `${today}T00:00:00Z`)

        const xpToday = todayTransactions?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0

        return NextResponse.json({
            xp: user.xp || 0,
            xpFormatted: formatXp(user.xp || 0),
            xpToday,
            level: levelInfo.level,
            title: levelInfo.title,
            color: levelInfo.color,
            progress: levelInfo.progress,
            xpForCurrentLevel: levelInfo.xpForCurrentLevel,
            xpForNextLevel: levelInfo.xpForNextLevel,
            nextMilestone,
            streakFreezes: user.streak_freezes || 0,
            currentStreak: user.current_streak || 0,
            recentTransactions: recentTransactions || [],
        })
    } catch (error) {
        console.error('Error fetching XP:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/user/xp
 * Award XP to user (called after sync or actions)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { source, amount, description, metadata } = body

        if (!source || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Invalid XP data' }, { status: 400 })
        }

        // Get current user XP
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('xp, level')
            .eq('id', session.user.id)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const previousLevel = user.level || 1
        const newXp = (user.xp || 0) + amount

        // Update user XP
        const { error: updateError } = await supabase
            .from('users')
            .update({ xp: newXp })
            .eq('id', session.user.id)

        if (updateError) {
            console.error('Error updating XP:', updateError)
            return NextResponse.json({ error: 'Failed to update XP' }, { status: 500 })
        }

        // Log transaction
        await supabase
            .from('xp_transactions')
            .insert({
                user_id: session.user.id,
                amount,
                source,
                description: description || `Earned ${amount} XP`,
                metadata: metadata || {},
            })

        // Check for level up
        const newLevelInfo = calculateLevel(newXp)
        const leveledUp = newLevelInfo.level > previousLevel

        return NextResponse.json({
            success: true,
            xpAwarded: amount,
            newTotalXp: newXp,
            previousLevel,
            newLevel: newLevelInfo.level,
            newTitle: newLevelInfo.title,
            leveledUp,
            progress: newLevelInfo.progress,
        })
    } catch (error) {
        console.error('Error awarding XP:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
