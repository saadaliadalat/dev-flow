import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Fetch current user data
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('streak_count, last_activity, current_streak, created_at') // Handle both legacy and new column names
            .eq('id', userId)
            .single()

        if (fetchError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const now = new Date()
        const lastActivity = new Date(user.last_activity || user.created_at || now) // Fallback
        const diffTime = Math.abs(now.getTime() - lastActivity.getTime())
        const diffHours = diffTime / (1000 * 60 * 60)

        // Verify if we should use existing 'current_streak' or new 'streak_count'
        // We'll sync them for now
        let streak = user.streak_count || user.current_streak || 0
        let streaked = false
        let broken = false

        if (diffHours < 24) {
            // Same day window (roughly), actually should check "calendar day" logic if strict
            // But prompt says: if (hoursSince < 24) { // Same day - no change }
            // We'll trust the prompt's logic: "On login OR goal completion"
            // Wait, if I login at 10AM and then 11AM, hoursSince < 1. 24h window?
            // Prompt Logic:
            // if (hoursSince < 24) -> No change (Already counted for today)
            // else if (hoursSince < 48) -> Yesterday - increment
            // else -> Broken - reset
        } else if (diffHours < 48) {
            streak += 1
            streaked = true
        } else {
            streak = 1 // Reset to 1 (today is day 1)
            broken = true
        }

        // Always update last_activity
        const { error: updateError } = await supabase
            .from('users')
            .update({
                streak_count: streak,
                current_streak: streak, // Keep both in sync
                last_activity: now.toISOString()
            })
            .eq('id', userId)

        if (updateError) throw updateError

        return NextResponse.json({
            success: true,
            streak,
            streaked, // Frontend can use this to show confetti
            broken
        })

    } catch (error: any) {
        console.error('Streak Update Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
