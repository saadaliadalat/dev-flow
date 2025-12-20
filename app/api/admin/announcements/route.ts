import { NextResponse } from 'next/server'
import {
    isAdmin,
    getAdminUser,
    getAnnouncements,
    createAnnouncement,
    adminUnauthorized,
    logAdminAction
} from '@/lib/admin'

export async function GET() {
    try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const announcements = await getAnnouncements(false) // Get all, not just active

        return NextResponse.json({ announcements })
    } catch (error) {
        console.error('Admin announcements error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch announcements' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const admin = await getAdminUser()
        const body = await request.json()

        const announcement = await createAnnouncement({
            ...body,
            created_by: admin?.id
        })

        await logAdminAction(
            admin?.id || '',
            admin?.username || '',
            'announcement.create',
            'announcement',
            announcement.id,
            body.title
        )

        return NextResponse.json({ announcement })
    } catch (error) {
        console.error('Admin create announcement error:', error)
        return NextResponse.json(
            { error: 'Failed to create announcement' },
            { status: 500 }
        )
    }
}
