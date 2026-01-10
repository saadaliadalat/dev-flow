import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 💬 WHISPER NETWORK
 * Anonymous, poetic messages from your future/senior self.
 */

// Whisper library - organized by context
const WHISPERS = {
    earlyJourney: [
        "In three years, you'll understand why this struggle matters.",
        "The confusion you feel now becomes wisdom later.",
        "Every error message is a teacher in disguise.",
        "The repository you're building today will surprise you.",
    ],
    midJourney: [
        "You've come further than you realize. Look back sometimes.",
        "The patterns are starting to reveal themselves to you.",
        "Your future self thanks you for not giving up here.",
        "The code you wrote last year taught you what this year needed.",
    ],
    veteran: [
        "You now see what was invisible before. That's growth.",
        "The junior devs will ask you questions you once asked.",
        "Your constellation is vast. Not everyone can say that.",
        "What felt impossible once is now your daily toolkit.",
    ],
    encouragement: [
        "The best code you'll ever write hasn't been written yet.",
        "Take breaks. Your subconscious solves problems while you rest.",
        "Imposter syndrome lies. Your commits don't.",
        "Every developer you admire once stood where you stand.",
        "The burnout you avoid is worth more than the sprint.",
    ],
    wisdom: [
        "Readable code > clever code. Your future self agrees.",
        "The bug you can't find is in the file you haven't looked at.",
        "Documentation is a gift to your future self.",
        "Tests are letters of trust you write to tomorrow's you.",
        "Refactoring is not 'wasted' time. It's earned clarity.",
    ],
}

type WhisperCategory = keyof typeof WHISPERS

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const githubId = (session.user as any).githubId
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, created_at, total_commits, current_streak')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Determine journey stage based on activity
        const daysSinceJoin = Math.floor(
            (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )
        const totalCommits = user.total_commits || 0

        let stage: WhisperCategory
        if (totalCommits < 100 || daysSinceJoin < 90) {
            stage = 'earlyJourney'
        } else if (totalCommits < 1000 || daysSinceJoin < 365) {
            stage = 'midJourney'
        } else {
            stage = 'veteran'
        }

        // Mix in general whispers
        const allCategories: WhisperCategory[] = [stage, 'encouragement', 'wisdom']
        const selectedCategory = allCategories[Math.floor(Math.random() * allCategories.length)]
        const whispers = WHISPERS[selectedCategory]
        const whisper = whispers[Math.floor(Math.random() * whispers.length)]

        // Generate a "sender" persona
        const senders = [
            { name: 'Your Future Self', years: '5 years ahead' },
            { name: 'A Senior Version', years: '10,000 commits later' },
            { name: 'The You Who Shipped', years: 'From the other side' },
            { name: 'Tomorrow\'s You', years: 'Just one day ahead' },
        ]
        const sender = senders[Math.floor(Math.random() * senders.length)]

        return NextResponse.json({
            whisper,
            sender,
            category: selectedCategory,
            stage,
        })
    } catch (error) {
        console.error('Whisper error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
