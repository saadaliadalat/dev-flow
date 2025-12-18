import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: List all teams or user's team
export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const githubId = (session.user as any).githubId

        const { data: user } = await supabase
            .from('users')
            .select('id, team_id')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // If user has a team, fetch it
        if (user.team_id) {
            const { data: team, error } = await supabase
                .from('teams')
                .select('*')
                .eq('id', user.team_id)
                .single()

            if (error) throw error

            return NextResponse.json({
                success: true,
                team
            })
        }

        // Otherwise, fetch public teams
        const { data: teams, error } = await supabase
            .from('teams')
            .select('*')
            .eq('is_public', true)
            .order('member_count', { ascending: false })
            .limit(20)

        if (error) throw error

        return NextResponse.json({
            success: true,
            teams: teams || []
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to fetch teams',
            details: error.message
        }, { status: 500 })
    }
}

// POST: Create new team
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name, slug, description, isPublic } = await req.json()

        const githubId = (session.user as any).githubId

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Create team
        const { data: team, error } = await supabase
            .from('teams')
            .insert({
                name,
                slug,
                description,
                owner_id: user.id,
                is_public: isPublic || false,
                member_count: 1
            })
            .select()
            .single()

        if (error) throw error

        // Update user to be part of this team
        await supabase
            .from('users')
            .update({
                team_id: team.id,
                is_team_member: true
            })
            .eq('id', user.id)

        return NextResponse.json({
            success: true,
            team
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to create team',
            details: error.message
        }, { status: 500 })
    }
}
