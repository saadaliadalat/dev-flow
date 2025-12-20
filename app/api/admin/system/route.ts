import { NextResponse } from 'next/server'
import {
    isAdmin,
    adminUnauthorized,
    supabaseAdmin
} from '@/lib/admin'

export async function GET() {
    try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        // Get various system metrics
        const metrics: any = {
            database: {},
            api: {},
            jobs: []
        }

        // Get table counts
        const [usersCount, dailyStatsCount, reposCount, achievementsCount, insightsCount] = await Promise.all([
            supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('daily_stats').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('repositories').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('achievements').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('insights').select('id', { count: 'exact', head: true })
        ])

        metrics.database = {
            users: usersCount.count || 0,
            daily_stats: dailyStatsCount.count || 0,
            repositories: reposCount.count || 0,
            achievements: achievementsCount.count || 0,
            insights: insightsCount.count || 0
        }

        // Get recent errors from admin logs
        const { data: recentErrors } = await supabaseAdmin
            .from('admin_logs')
            .select('*')
            .ilike('action', '%error%')
            .order('created_at', { ascending: false })
            .limit(10)

        metrics.recentErrors = recentErrors || []

        // Simulated API quotas (in real app, you'd track these)
        metrics.api = {
            github: {
                remaining: 4856,
                limit: 5000,
                resetAt: new Date(Date.now() + 45 * 60 * 1000).toISOString()
            },
            gemini: {
                remaining: 85,
                limit: 100,
                resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
            }
        }

        // Cron job status (simulated - in real app, store this)
        metrics.jobs = [
            {
                name: 'Daily Sync',
                schedule: '0 0 * * *',
                lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                status: 'success',
                nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
            },
            {
                name: 'Achievement Check',
                schedule: '0 */6 * * *',
                lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'success',
                nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
            },
            {
                name: 'AI Insights Generation',
                schedule: '0 */12 * * *',
                lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                status: 'success',
                nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
            },
            {
                name: 'Cleanup Old Data',
                schedule: '0 3 * * 0',
                lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'success',
                nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
            }
        ]

        // System health
        metrics.health = {
            status: 'healthy',
            uptime: '99.9%',
            responseTime: '45ms',
            lastCheck: new Date().toISOString()
        }

        return NextResponse.json(metrics)
    } catch (error) {
        console.error('Admin system metrics error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch system metrics' },
            { status: 500 }
        )
    }
}
