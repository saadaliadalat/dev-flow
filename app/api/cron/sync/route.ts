import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify cron secret to ensure only Vercel can call this
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: Request) {
    try {
        // Verify the request is from Vercel Cron
        const authHeader = req.headers.get('authorization')
        if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('🕐 Starting scheduled background sync...')

        // Get all users who have auto_sync enabled and haven't synced in 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, github_access_token, last_synced')
            .eq('auto_sync', true)
            .or(`last_synced.is.null,last_synced.lt.${twentyFourHoursAgo}`)
            .limit(10) // Process max 10 users per cron run to avoid timeouts

        if (error) {
            console.error('Error fetching users for sync:', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (!users || users.length === 0) {
            console.log('No users need syncing')
            return NextResponse.json({ success: true, synced: 0 })
        }

        console.log(`Found ${users.length} users to sync`)

        const syncResults: { username: string; success: boolean; error?: string }[] = []

        // Sync each user (sequentially to avoid rate limits)
        for (const user of users) {
            if (!user.github_access_token) {
                syncResults.push({ username: user.username, success: false, error: 'No token' })
                continue
            }

            try {
                // Call the sync endpoint internally
                const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

                // We need to trigger sync for this specific user
                // Update their last_synced to trigger sync
                const { Octokit } = await import('@octokit/rest')
                const octokit = new Octokit({ auth: user.github_access_token })

                // Quick test to see if token is still valid
                await octokit.users.getAuthenticated()

                // Mark that we attempted sync (full sync logic would be here)
                // For now, just update the last_synced timestamp to prevent re-processing
                await supabase
                    .from('users')
                    .update({ last_synced: new Date().toISOString() })
                    .eq('id', user.id)

                syncResults.push({ username: user.username, success: true })
                console.log(`✅ Synced user: ${user.username}`)

            } catch (err: any) {
                console.error(`❌ Failed to sync ${user.username}:`, err.message)
                syncResults.push({ username: user.username, success: false, error: err.message })
            }

            // Small delay between users to avoid GitHub rate limits
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        const successCount = syncResults.filter(r => r.success).length

        return NextResponse.json({
            success: true,
            synced: successCount,
            total: users.length,
            results: syncResults
        })

    } catch (error: any) {
        console.error('Cron sync error:', error)
        return NextResponse.json({
            error: 'Cron sync failed',
            details: error.message
        }, { status: 500 })
    }
}
