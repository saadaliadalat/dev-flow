import { NextResponse } from 'next/server'
import {
    isAdmin,
    getAdminUser,
    getUserById,
    getUserActivity,
    suspendUser,
    unsuspendUser,
    deleteUser,
    hardDeleteUser,
    adminUnauthorized,
    logAdminAction
} from '@/lib/admin'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const { id } = await params
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')

        const [user, activity] = await Promise.all([
            getUserById(id),
            getUserActivity(id, days)
        ])

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ user, activity })
    } catch (error) {
        console.error('Admin get user error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}

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
        const { action, reason } = body

        const user = await getUserById(id)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        switch (action) {
            case 'suspend':
                await suspendUser(id, reason)
                await logAdminAction(
                    admin?.id || '',
                    admin?.username || '',
                    'user.suspend',
                    'user',
                    id,
                    user.username,
                    { reason }
                )
                break

            case 'unsuspend':
                await unsuspendUser(id)
                await logAdminAction(
                    admin?.id || '',
                    admin?.username || '',
                    'user.unsuspend',
                    'user',
                    id,
                    user.username
                )
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin update user error:', error)
        return NextResponse.json(
            { error: 'Failed to update user' },
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
        const { searchParams } = new URL(request.url)
        const permanent = searchParams.get('permanent') === 'true'

        const user = await getUserById(id)
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Prevent self-deletion
        if (user.id === admin?.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            )
        }

        if (permanent) {
            await hardDeleteUser(id)
        } else {
            await deleteUser(id)
        }

        await logAdminAction(
            admin?.id || '',
            admin?.username || '',
            'user.delete',
            'user',
            id,
            user.username,
            { permanent }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin delete user error:', error)
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}
