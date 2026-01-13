import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_FREEZE_DAYS = 3

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user by github_id
        const githubId = (session.user as any).githubId
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('id, streak_count, last_activity, current_streak, created_at, freeze_days, freeze_days_used, last_freeze_earned_at, longest_streak')
            .eq('github_id', githubId)
            .single()

        if (fetchError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const userId = user.id
        const now = new Date()
        const lastActivity = new Date(user.last_activity || user.created_at || now)
        const diffTime = Math.abs(now.getTime() - lastActivity.getTime())
        const diffHours = diffTime / (1000 * 60 * 60)

        let streak = user.streak_count || user.current_streak || 0
        let freezeDays = user.freeze_days || 0
        let freezeDaysUsed = user.freeze_days_used || 0
        let lastFreezeEarnedAt = user.last_freeze_earned_at ? new Date(user.last_freeze_earned_at) : null
        let longestStreak = user.longest_streak || 0

        let streaked = false
        let broken = false
        let freezeUsed = false
        let freezeEarned = false

        if (diffHours < 24) {
            // Same day window - no change to streak
        } else if (diffHours < 48) {
            // Yesterday - increment streak
            streak += 1
            streaked = true

            // Update longest streak if current is higher
            if (streak > longestStreak) {
                longestStreak = streak
            }

            // Check if user earned a freeze day (every 7-day streak, max 3)
            if (streak > 0 && streak % 7 === 0 && freezeDays < MAX_FREEZE_DAYS) {
                // Prevent double-earning for the same milestone
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                if (!lastFreezeEarnedAt || lastFreezeEarnedAt < sevenDaysAgo) {
                    freezeDays += 1
                    freezeEarned = true
                    lastFreezeEarnedAt = now

                    // Log the event
                    await supabase.from('freeze_day_events').insert({
                        user_id: userId,
                        event_type: 'earned',
                        streak_at_event: streak,
                        notes: `Earned freeze day at ${streak}-day streak`
                    })
                }
            }
        } else {
            // Would break streak - check for freeze days
            if (freezeDays > 0) {
                // Use a freeze day to protect the streak!
                freezeDays -= 1
                freezeDaysUsed += 1
                freezeUsed = true
                // Streak stays the same, just update last_activity

                // Log the event
                await supabase.from('freeze_day_events').insert({
                    user_id: userId,
                    event_type: 'used',
                    streak_at_event: streak,
                    notes: `Used freeze day to protect ${streak}-day streak`
                })
            } else {
                // No freeze days - streak is broken
                streak = 1
                broken = true
            }
        }

        // Update user record
        const { error: updateError } = await supabase
            .from('users')
            .update({
                streak_count: streak,
                current_streak: streak,
                longest_streak: longestStreak,
                freeze_days: freezeDays,
                freeze_days_used: freezeDaysUsed,
                last_freeze_earned_at: lastFreezeEarnedAt?.toISOString() || null,
                last_activity: now.toISOString()
            })
            .eq('id', userId)

        if (updateError) throw updateError

        return NextResponse.json({
            success: true,
            streak,
            streaked,
            broken,
            freezeUsed,
            freezeEarned,
            freezeDaysRemaining: freezeDays,
            freezeDaysUsedTotal: freezeDaysUsed,
        })

    } catch (error: any) {
        console.error('Streak Update Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

