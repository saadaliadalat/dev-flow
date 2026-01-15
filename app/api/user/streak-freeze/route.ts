import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/db'

/**
 * GET /api/user/streak-freeze
 * Get current streak freeze status
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('streak_freezes, streak_freeze_last_earned, current_streak, longest_streak')
            .eq('id', session.user.id)
            .single()

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Calculate days until next freeze earned (every 7 days of streak)
        const streakDaysForNextFreeze = 7 - (user.current_streak % 7)
        const willEarnFreezeToday = user.current_streak > 0 && user.current_streak % 7 === 0

        return NextResponse.json({
            freezesAvailable: user.streak_freezes || 0,
            maxFreezes: 3,
            currentStreak: user.current_streak || 0,
            longestStreak: user.longest_streak || 0,
            daysUntilNextFreeze: streakDaysForNextFreeze,
            willEarnFreezeToday,
            lastEarned: user.streak_freeze_last_earned,
        })
    } catch (error) {
        console.error('Error fetching streak freeze:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/user/streak-freeze
 * Use or earn a streak freeze
 * 
 * Body: { action: 'use' | 'earn' }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { action } = body

        if (!action || !['use', 'earn'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('streak_freezes, current_streak, streak_freeze_last_earned')
            .eq('id', session.user.id)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const currentFreezes = user.streak_freezes || 0
        const maxFreezes = 3

        if (action === 'use') {
            // Use a freeze to protect streak
            if (currentFreezes <= 0) {
                return NextResponse.json({
                    success: false,
                    error: 'No streak freezes available',
                    freezesAvailable: 0,
                }, { status: 400 })
            }

            // Decrement freezes
            const { error: updateError } = await supabase
                .from('users')
                .update({ streak_freezes: currentFreezes - 1 })
                .eq('id', session.user.id)

            if (updateError) {
                console.error('Error using streak freeze:', updateError)
                return NextResponse.json({ error: 'Failed to use freeze' }, { status: 500 })
            }

            return NextResponse.json({
                success: true,
                action: 'used',
                freezesRemaining: currentFreezes - 1,
                message: 'Streak freeze used! Your streak is protected for today.',
            })
        }

        if (action === 'earn') {
            // Earn a freeze (called when streak hits 7, 14, 21, etc.)
            const today = new Date().toISOString().split('T')[0]

            // Check if already earned today
            if (user.streak_freeze_last_earned === today) {
                return NextResponse.json({
                    success: false,
                    error: 'Already earned a freeze today',
                    freezesAvailable: currentFreezes,
                })
            }

            // Check if at max
            if (currentFreezes >= maxFreezes) {
                return NextResponse.json({
                    success: false,
                    error: 'Maximum freezes reached',
                    freezesAvailable: currentFreezes,
                    maxFreezes,
                })
            }

            // Award the freeze
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    streak_freezes: currentFreezes + 1,
                    streak_freeze_last_earned: today,
                })
                .eq('id', session.user.id)

            if (updateError) {
                console.error('Error earning streak freeze:', updateError)
                return NextResponse.json({ error: 'Failed to earn freeze' }, { status: 500 })
            }

            return NextResponse.json({
                success: true,
                action: 'earned',
                freezesAvailable: currentFreezes + 1,
                message: `Streak freeze earned! You now have ${currentFreezes + 1} freeze${currentFreezes + 1 > 1 ? 's' : ''}.`,
            })
        }
    } catch (error) {
        console.error('Error with streak freeze:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
