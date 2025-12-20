import { NextResponse } from 'next/server'
import {
    isAdmin,
    getAdminUser,
    getAdminStats,
    getSignupTrends,
    getActivityTrends,
    adminUnauthorized
} from '@/lib/admin'

export async function GET(request: Request) {
    try {
        // Verify admin
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')

        // Fetch all stats in parallel
        const [stats, signupTrends, activityTrends] = await Promise.all([
            getAdminStats(),
            getSignupTrends(days),
            getActivityTrends(days)
        ])

        return NextResponse.json({
            stats,
            signupTrends,
            activityTrends
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch admin stats' },
            { status: 500 }
        )
    }
}
