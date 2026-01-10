import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 🔥 ETERNAL FLAME
 * The streak that cannot die. Measures creative presence, not just commits.
 */

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, created_at, current_streak, longest_streak, last_active_date')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Calculate eternal flame days (days since account creation)
        const createdAt = new Date(user.created_at)
        const now = new Date()
        const eternityDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

        // Calculate presence streak (considers any form of engagement)
        // The eternal flame never dies - it just dims
        const lastActive = user.last_active_date ? new Date(user.last_active_date) : createdAt
        const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

        // Flame intensity (1.0 = fully active, 0.1 = ember)
        let intensity = 1.0
        if (daysSinceActive > 0) intensity = Math.max(0.1, 1 - (daysSinceActive * 0.1))

        // Flame status
        let status: 'blazing' | 'burning' | 'glowing' | 'ember'
        if (intensity >= 0.8) status = 'blazing'
        else if (intensity >= 0.5) status = 'burning'
        else if (intensity >= 0.3) status = 'glowing'
        else status = 'ember'

        // Wisdom message based on status
        const messages = {
            blazing: "The flame burns bright. You're fully present.",
            burning: "The fire persists. Keep the warmth alive.",
            glowing: "Embers glow softly. A spark can reignite all.",
            ember: "The flame never truly dies. It waits for you.",
        }

        return NextResponse.json({
            eternityDays,
            intensity,
            status,
            currentStreak: user.current_streak || 0,
            longestStreak: user.longest_streak || 0,
            daysSinceActive,
            message: messages[status],
            createdAt: user.created_at,
        })
    } catch (error) {
        console.error('Eternal flame error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
