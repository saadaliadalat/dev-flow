import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🔥 STREAK STATUS API
 * 
 * Returns streak status and time until it breaks
 */

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const email = session.user.email

        // Get user streak data
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, current_streak, longest_streak, last_synced')
            .eq('email', email)
            .single()

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get last activity from daily_stats
        const { data: lastActivity } = await supabaseAdmin
            .from('daily_stats')
            .select('date')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(1)
            .single()

        // Calculate hours until streak breaks
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        const lastActivityDate = lastActivity?.date || null

        let hoursUntilStreakBreak = 24

        if (lastActivityDate) {
            const lastActivityDateObj = new Date(lastActivityDate + 'T23:59:59Z')
            const endOfGracePeriod = new Date(lastActivityDateObj)
            endOfGracePeriod.setDate(endOfGracePeriod.getDate() + 1)
            endOfGracePeriod.setHours(23, 59, 59, 999)

            const msUntilBreak = endOfGracePeriod.getTime() - now.getTime()
            hoursUntilStreakBreak = Math.max(0, Math.floor(msUntilBreak / (1000 * 60 * 60)))

            // If last activity is today, streak is safe for the day
            if (lastActivityDate === todayStr) {
                hoursUntilStreakBreak = 24 + (24 - now.getHours())
            }
        }

        return NextResponse.json({
            currentStreak: user.current_streak || 0,
            longestStreak: user.longest_streak || 0,
            lastActivityDate,
            hoursUntilStreakBreak,
        })
    } catch (error) {
        console.error('Streak status error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
