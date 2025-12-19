import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const showDismissed = searchParams.get('dismissed') === 'true'
        const limit = parseInt(searchParams.get('limit') || '10')

        const githubId = (session.user as any).githubId

        // Get user's internal ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Build query
        let query = supabase
            .from('insights')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit)

        // Filter dismissed if needed
        if (!showDismissed) {
            query = query.eq('is_dismissed', false)
        }

        const { data: insights, error } = await query

        if (error) throw error

        return NextResponse.json({
            success: true,
            insights: insights || []
        })

    } catch (error: any) {
        console.error('Insights fetch error:', error)
        return NextResponse.json({
            error: 'Failed to fetch insights',
            details: error.message
        }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { insightId, action } = await req.json()

        if (!insightId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const updates: any = {}

        switch (action) {
            case 'read':
                updates.is_read = true
                updates.read_at = new Date().toISOString()
                break
            case 'dismiss':
                updates.is_dismissed = true
                updates.dismissed_at = new Date().toISOString()
                break
            case 'helpful':
                updates.is_helpful = true
                break
            case 'not_helpful':
                updates.is_helpful = false
                break
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const { error } = await supabase
            .from('insights')
            .update(updates)
            .eq('id', insightId)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Insight update error:', error)
        return NextResponse.json({
            error: 'Failed to update insight',
            details: error.message
        }, { status: 500 })
    }
}
