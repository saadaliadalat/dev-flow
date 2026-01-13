import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 🧊 FREEZE STATUS API
 * 
 * Returns the current freeze day status for a user.
 * Used by the FreezeDayBanner component.
 */
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId
        const { data: user, error } = await supabase
            .from('users')
            .select('id, freeze_days, freeze_days_used, last_activity, current_streak')
            .eq('github_id', githubId)
            .single()

        if (error || !user) {
            return NextResponse.json({
                freezeDays: 0,
                freezeDaysUsed: 0,
                streakProtected: false,
                justEarned: false
            })
        }

        // Check recent freeze events to see if something just happened
        const { data: recentEvents } = await supabase
            .from('freeze_day_events')
            .select('event_type, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const recentEvent = recentEvents?.created_at && new Date(recentEvents.created_at) > fiveMinutesAgo
            ? recentEvents
            : null

        return NextResponse.json({
            freezeDays: user.freeze_days || 0,
            freezeDaysUsed: user.freeze_days_used || 0,
            currentStreak: user.current_streak || 0,
            streakProtected: recentEvent?.event_type === 'used',
            justEarned: recentEvent?.event_type === 'earned',
        })
    } catch (error) {
        console.error('Freeze status error:', error)
        return NextResponse.json({
            freezeDays: 0,
            freezeDaysUsed: 0,
            streakProtected: false,
            justEarned: false
        })
    }
}
