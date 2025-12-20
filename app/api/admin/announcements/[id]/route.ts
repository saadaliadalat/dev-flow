import { NextResponse } from 'next/server'
import {
    isAdmin,
    getAdminUser,
    updateAnnouncement,
    deleteAnnouncement,
    adminUnauthorized,
    logAdminAction,
    supabaseAdmin
} from '@/lib/admin'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const admin = await getAdminUser()
        const { id } = await params
        const body = await request.json()

        // Get current announcement for logging
        const { data: current } = await supabaseAdmin
            .from('announcements')
            .select('title')
            .eq('id', id)
            .single()

        await updateAnnouncement(id, body)

        await logAdminAction(
            admin?.id || '',
            admin?.username || '',
            'announcement.update',
            'announcement',
            id,
            current?.title || body.title
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin update announcement error:', error)
        return NextResponse.json(
            { error: 'Failed to update announcement' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const admin = await getAdminUser()
        const { id } = await params

        // Get announcement for logging
        const { data: announcement } = await supabaseAdmin
            .from('announcements')
            .select('title')
            .eq('id', id)
            .single()

        await deleteAnnouncement(id)

        await logAdminAction(
            admin?.id || '',
            admin?.username || '',
            'announcement.delete',
            'announcement',
            id,
            announcement?.title || 'Unknown'
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin delete announcement error:', error)
        return NextResponse.json(
            { error: 'Failed to delete announcement' },
            { status: 500 }
        )
    }
}
