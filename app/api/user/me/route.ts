import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Priority 1: Fetch by GitHub ID (Most reliable)
        const githubId = (session.user as any).githubId
        let user = null

        if (githubId) {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('github_id', githubId)
                .single()
            user = data
        }

        // Priority 2: Fetch by Email
        if (!user && session.user.email) {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('email', session.user.email)
                .single()
            user = data
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
        }

        // Fetch Daily Stats (Last 7 Days)
        const { data: dailyStats } = await supabase
            .from('daily_stats')
            .select('date, total_commits')
            .eq('user_id', user.id)
            .order('date', { ascending: false }) // Get NEWEST first
            .limit(7)

        return NextResponse.json({
            user,
            dailyStats: dailyStats || []
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
