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

        console.log('💡 Starting scheduled insight generation...')

        // Get users who haven't had insights generated in the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

        // Get users with recent syncs but stale/no insights
        const { data: users } = await supabase
            .from('users')
            .select('id, username')
            .not('last_synced', 'is', null)
            .limit(10)

        if (!users || users.length === 0) {
            console.log('No users for insight generation')
            return NextResponse.json({ success: true, generated: 0 })
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        let generated = 0

        for (const user of users) {
            // Check if user already has recent insights
            const { data: recentInsights } = await supabase
                .from('insights')
                .select('id')
                .eq('user_id', user.id)
                .gte('created_at', sevenDaysAgo)
                .limit(1)

            if (recentInsights && recentInsights.length > 0) {
                continue // Skip if user has recent insights
            }

            try {
                const res = await fetch(`${baseUrl}/api/insights/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                })
                const data = await res.json()
                if (data.success) {
                    generated++
                    console.log(`✨ Generated insights for ${user.username}`)
                }
            } catch (err) {
                console.error(`Failed to generate insights for ${user.username}`)
            }

            // Longer delay to respect Groq API rate limits
            await new Promise(resolve => setTimeout(resolve, 2000))
        }

        return NextResponse.json({
            success: true,
            checked: users.length,
            generated
        })

    } catch (error: any) {
        console.error('Cron insights error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
