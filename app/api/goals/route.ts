import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Fetch user's goals
export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

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

        // Fetch goals
        const { data: goals, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            // If table doesn't exist, return empty array (graceful fallback)
            if (error.code === '42P01') {
                return NextResponse.json({ goals: [], message: 'Goals table not initialized' })
            }
            throw error
        }

        return NextResponse.json({ goals: goals || [] })

    } catch (error: any) {
        console.error('Goals fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST: Create new goal
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { title, deadline, priority } = await req.json()

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        const githubId = (session.user as any).githubId

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Insert new goal
        const { data: goal, error } = await supabase
            .from('goals')
            .insert({
                user_id: user.id,
                title,
                deadline: deadline || null,
                priority: priority || 'medium',
                progress: 0,
                status: 'todo'
            })
            .select()
            .single()

        if (error) {
            // Create table if it doesn't exist
            if (error.code === '42P01') {
                return NextResponse.json({
                    error: 'Goals table not initialized. Please contact support.',
                    code: 'TABLE_NOT_FOUND'
                }, { status: 500 })
            }
            throw error
        }

        return NextResponse.json({ goal, success: true })

    } catch (error: any) {
        console.error('Goal create error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH: Update goal (progress, status, etc.)
export async function PATCH(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { goalId, ...updates } = await req.json()

        if (!goalId) {
            return NextResponse.json({ error: 'goalId is required' }, { status: 400 })
        }

        const githubId = (session.user as any).githubId

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Update goal (only if it belongs to this user)
        const { data: goal, error } = await supabase
            .from('goals')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', goalId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ goal, success: true })

    } catch (error: any) {
        console.error('Goal update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE: Remove goal
export async function DELETE(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const goalId = searchParams.get('id')

        if (!goalId) {
            return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
        }

        const githubId = (session.user as any).githubId

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Delete goal (only if it belongs to this user)
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', goalId)
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Goal delete error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
