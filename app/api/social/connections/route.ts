import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: List user's connections
export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const githubId = (session.user as any).githubId

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch connections
        const { data: connections, error } = await supabase
            .from('social_connections')
            .select(`
        *,
        connected_user:connected_user_id (
          id,
          username,
          avatar_url,
          productivity_score,
          current_streak
        )
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({
            success: true,
            connections: connections || []
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to fetch connections',
            details: error.message
        }, { status: 500 })
    }
}

// POST: Create new connection
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { targetUsername, connectionType } = await req.json()

        const githubId = (session.user as any).githubId

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        const { data: targetUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', targetUsername)
            .single()

        if (!user || !targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Create connection
        const { data: connection, error } = await supabase
            .from('social_connections')
            .insert({
                user_id: user.id,
                connected_user_id: targetUser.id,
                connection_type: connectionType || 'friend',
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            success: true,
            connection
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to create connection',
            details: error.message
        }, { status: 500 })
    }
}
