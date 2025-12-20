import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: Request) {
    try {
        // Verify the request is from Vercel Cron
        const authHeader = req.headers.get('authorization')
        if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('🏆 Starting scheduled achievement check...')

        // Get all users who have synced recently
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: users } = await supabase
            .from('users')
            .select('id, username')
            .gte('last_synced', oneDayAgo)
            .limit(20)

        if (!users || users.length === 0) {
            console.log('No recently active users')
            return NextResponse.json({ success: true, checked: 0 })
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        let unlocked = 0

        for (const user of users) {
            try {
                const res = await fetch(`${baseUrl}/api/achievements/unlock`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                })
                const data = await res.json()
                if (data.newlyUnlocked > 0) {
                    unlocked += data.newlyUnlocked
                    console.log(`🎉 ${user.username} unlocked ${data.newlyUnlocked} achievements`)
                }
            } catch (err) {
                console.error(`Failed to check achievements for ${user.username}`)
            }
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        return NextResponse.json({
            success: true,
            checked: users.length,
            unlocked
        })

    } catch (error: any) {
        console.error('Cron achievements error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
