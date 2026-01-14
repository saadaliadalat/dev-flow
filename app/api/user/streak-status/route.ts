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

        // Helper: Get local date string YYYY-MM-DD
        const getLocalDateStr = (date: Date): string => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        // Calculate hours until streak breaks
        const now = new Date()
        const todayStr = getLocalDateStr(now)
        const lastActivityDate = lastActivity?.date || null

        let hoursUntilStreakBreak = 24

        if (lastActivityDate) {
            // Parse the date and set to end of day in local time
            const [year, month, day] = lastActivityDate.split('-').map(Number)
            const lastActivityDateObj = new Date(year, month - 1, day, 23, 59, 59, 999)

            // Streak breaks at end of the NEXT day (grace period)
            const endOfGracePeriod = new Date(lastActivityDateObj)
            endOfGracePeriod.setDate(endOfGracePeriod.getDate() + 1)

            const msUntilBreak = endOfGracePeriod.getTime() - now.getTime()
            hoursUntilStreakBreak = Math.max(0, Math.floor(msUntilBreak / (1000 * 60 * 60)))

            // If last activity is today, streak is safe for the day
            if (lastActivityDate === todayStr) {
                const hoursLeftToday = 24 - now.getHours()
                hoursUntilStreakBreak = hoursLeftToday + 24 // Today's remaining + full tomorrow
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
