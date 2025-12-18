import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const githubId = (session.user as any).githubId

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('github_id', githubId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
                bio: user.bio,
                location: user.location,
                company: user.company,
                website: user.website,
                total_commits: user.total_commits,
                total_prs: user.total_prs,
                total_issues: user.total_issues,
                current_streak: user.current_streak,
                longest_streak: user.longest_streak,
                productivity_score: user.productivity_score,
                developer_dna: user.developer_dna,
                skill_tags: user.skill_tags,
                last_synced: user.last_synced,
                created_at: user.created_at
            }
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to fetch user profile',
            details: error.message
        }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const updates = await req.json()
        const githubId = (session.user as any).githubId

        // Only allow updating certain fields
        const allowedFields = [
            'bio',
            'location',
            'website',
            'profile_public',
            'show_on_leaderboard',
            'allow_comparisons',
            'sync_frequency',
            'auto_sync'
        ]

        const filteredUpdates: any = {}
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key]
            }
        })

        const { error } = await supabase
            .from('users')
            .update(filteredUpdates)
            .eq('github_id', githubId)

        if (error) throw error

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully'
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to update profile',
            details: error.message
        }, { status: 500 })
    }
}
