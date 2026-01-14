import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🔥 ETERNAL FLAME
 * Shows the user's actual coding streak
 */

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId
        const email = session.user.email

        // Get user - try by githubId first, fallback to email
        let user = null

        if (githubId) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('id, created_at, current_streak, longest_streak')
                .eq('github_id', githubId)
                .single()
            user = data
        }

        if (!user && email) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('id, created_at, current_streak, longest_streak')
                .eq('email', email)
                .single()
            user = data
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Helper functions
        const getLocalDateStr = (date: Date): string => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        const dateToDays = (dateStr: string): number => {
            const [year, month, day] = dateStr.split('-').map(Number)
            return Math.floor(new Date(year, month - 1, day).getTime() / (1000 * 60 * 60 * 24))
        }

        // Get activity days from daily_stats to calculate REAL streak
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
        let daysSinceActive = 999

        if (activityDays && activityDays.length > 0) {
            const mostRecent = activityDays[0].date
            daysSinceActive = dateToDays(todayStr) - dateToDays(mostRecent)

            // Only count streak if most recent is today or yesterday
            if (mostRecent === todayStr || mostRecent === yesterdayStr) {
                let expectedDays = dateToDays(mostRecent)
                const sortedDates = activityDays.map(d => d.date)

                for (const dateStr of sortedDates) {
                    const dayNum = dateToDays(dateStr)
                    if (dayNum === expectedDays) {
                        currentStreak++
                        expectedDays--
                    } else if (dayNum < expectedDays) {
                        break
                    }
                }
            }
        }

        // Update users table with accurate streak
        if (currentStreak > 0 || currentStreak !== user.current_streak) {
            const longestStreak = Math.max(user.longest_streak || 0, currentStreak)
            supabaseAdmin
                .from('users')
                .update({ current_streak: currentStreak, longest_streak: longestStreak })
                .eq('id', user.id)
                .then(() => { /* fire and forget */ })
        }

        // Flame intensity based on days since last activity
        let intensity = 1.0
        if (daysSinceActive > 0) intensity = Math.max(0.1, 1 - (daysSinceActive * 0.15))

        // Flame status
        let status: 'blazing' | 'burning' | 'glowing' | 'ember'
        if (currentStreak >= 7) status = 'blazing'
        else if (currentStreak >= 3) status = 'burning'
        else if (currentStreak >= 1) status = 'glowing'
        else status = 'ember'

        const messages = {
            blazing: "The flame burns bright. You're on fire! 🔥",
            burning: "The fire persists. Keep building momentum!",
            glowing: "Embers glow softly. Push some code to reignite!",
            ember: "The flame waits for you. Start coding to light it up!",
        }

        return NextResponse.json({
            eternityDays: currentStreak,
            intensity,
            status,
            currentStreak,
            longestStreak: Math.max(user.longest_streak || 0, currentStreak),
            daysSinceActive,
            message: messages[status],
            createdAt: user.created_at,
        })
    } catch (error) {
        console.error('Eternal flame error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
