import { NextResponse } from 'next/server'
import {
    isAdmin,
    getAdminLogs,
    adminUnauthorized
} from '@/lib/admin'

export async function GET(request: Request) {
    try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const { searchParams } = new URL(request.url)

        const options = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '50'),
            action: searchParams.get('action') || undefined,
            adminId: searchParams.get('adminId') || undefined
        }

        const result = await getAdminLogs(options)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Admin logs error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch logs' },
            { status: 500 }
        )
    }
}
