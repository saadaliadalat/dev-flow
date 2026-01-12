import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Debug endpoint to test auth status
 */
export async function GET() {
    try {
        const session = await auth()

        return NextResponse.json({
            hasSession: !!session,
            hasUser: !!session?.user,
            user: session?.user ? {
                id: (session.user as any).id,
                username: (session.user as any).username,
                githubId: (session.user as any).githubId,
                email: session.user.email,
                name: session.user.name,
            } : null,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Auth debug error:', error)
        return NextResponse.json({
            error: 'Auth check failed',
            details: String(error)
        }, { status: 500 })
    }
}
