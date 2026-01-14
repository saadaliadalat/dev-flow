import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🔥 STREAK STATUS API
 * 
 * Calculates REAL-TIME streak from daily_stats (not cached users table)
 * Returns streak status and time until it breaks
 */

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const email = session.user.email

        // Get user data
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, longest_streak')
            .eq('email', email)
            .single()

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Helper: Get local date string YYYY-MM-DD
        const getLocalDateStr = (date: Date): string => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        // Helper: Convert date string to days for comparison
        const dateToDays = (dateStr: string): number => {
            const [year, month, day] = dateStr.split('-').map(Number)
            return Math.floor(new Date(year, month - 1, day).getTime() / (1000 * 60 * 60 * 24))
        }

        // Get all days with activity
        const { data: activityDays } = await supabaseAdmin
            .from('daily_stats')
            .select('date, total_commits')
            .eq('user_id', user.id)
            .gt('total_commits', 0)
            .order('date', { ascending: false })

        const now = new Date()
        const todayStr = getLocalDateStr(now)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = getLocalDateStr(yesterday)

        // Calculate REAL streak from daily_stats
        let currentStreak = 0
        let lastActivityDate: string | null = null

        if (activityDays && activityDays.length > 0) {
            lastActivityDate = activityDays[0].date
            const sortedDates = activityDays.map(d => d.date)
            const mostRecent = sortedDates[0]

            // Only count streak if most recent is today or yesterday
            if (mostRecent === todayStr || mostRecent === yesterdayStr) {
                let expectedDays = dateToDays(mostRecent)

                for (const dateStr of sortedDates) {
                    const dayNum = dateToDays(dateStr)

                    if (dayNum === expectedDays) {
                        currentStreak++
                        expectedDays--
                    } else if (dayNum < expectedDays) {
                        // Gap found
                        break
                    }
                }
            }
        }

        // Calculate hours until streak breaks
        let hoursUntilStreakBreak = 24

        if (lastActivityDate) {
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
                hoursUntilStreakBreak = hoursLeftToday + 24
            }
        }

        // Update the users table with accurate streak (async, don't wait)
        if (currentStreak > 0) {
            const longestStreak = Math.max(user.longest_streak || 0, currentStreak)
            // Fire and forget - don't await
            supabaseAdmin
                .from('users')
                .update({ current_streak: currentStreak, longest_streak: longestStreak })
                .eq('id', user.id)
                .then(() => { /* Updated */ })
        }

        return NextResponse.json({
            currentStreak,
            longestStreak: Math.max(user.longest_streak || 0, currentStreak),
            lastActivityDate,
            hoursUntilStreakBreak,
        })
    } catch (error) {
        console.error('Streak status error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
