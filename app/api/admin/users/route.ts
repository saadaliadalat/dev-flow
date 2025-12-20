import { NextResponse } from 'next/server'
import {
    isAdmin,
    getAdminUser,
    getUsers,
    adminUnauthorized,
    logAdminAction
} from '@/lib/admin'

export async function GET(request: Request) {
    try {
        // Verify admin
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const { searchParams } = new URL(request.url)

        const options = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
            search: searchParams.get('search') || '',
            status: (searchParams.get('status') || 'all') as 'all' | 'active' | 'suspended',
            sortBy: searchParams.get('sortBy') || 'created_at',
            sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
        }

        const result = await getUsers(options)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Admin users list error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
