import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/db'

/**
 * 🏆 CHALLENGES API
 * 
 * GET - List user's challenges (sent and received)
 * POST - Create a new challenge
 * PATCH - Accept/decline a challenge
 */

// GET /api/challenges - List user's challenges
export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') || 'all'
        const type = searchParams.get('type') || 'all' // sent, received, all

        let query = supabase
            .from('challenges')
            .select(`
                *,
                challenger:users!challenges_challenger_id_fkey(id, username, avatar_url, level, level_title),
                challenged:users!challenges_challenged_id_fkey(id, username, avatar_url, level, level_title)
            `)

        // Filter by relationship type
        if (type === 'sent') {
            query = query.eq('challenger_id', session.user.id)
        } else if (type === 'received') {
            query = query.eq('challenged_id', session.user.id)
        } else {
            query = query.or(`challenger_id.eq.${session.user.id},challenged_id.eq.${session.user.id}`)
        }

        // Filter by status
        if (status !== 'all') {
            query = query.eq('status', status)
        }

        const { data: challenges, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching challenges:', error)
            return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
        }

        // Categorize challenges
        const pending = challenges?.filter(c => c.status === 'pending') || []
        const active = challenges?.filter(c => c.status === 'active') || []
        const completed = challenges?.filter(c => c.status === 'completed') || []

        return NextResponse.json({
            challenges: challenges || [],
            summary: {
                total: challenges?.length || 0,
                pending: pending.length,
                active: active.length,
                completed: completed.length,
            }
        })
    } catch (error) {
        console.error('Challenges GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/challenges - Create a new challenge
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const {
            challenged_username,
            challenged_email,
            challenge_type = 'commits',
            duration_days = 7
        } = body

        if (!challenged_username && !challenged_email) {
            return NextResponse.json({
                error: 'Must provide either username or email'
            }, { status: 400 })
        }

        // Look up challenged user by username if provided
        let challengedUserId = null
        if (challenged_username) {
            const { data: challengedUser } = await supabase
                .from('users')
                .select('id')
                .eq('username', challenged_username)
                .single()

            if (challengedUser) {
                challengedUserId = challengedUser.id
            }
        }

        // Calculate start/end dates
        const startDate = new Date()
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + duration_days)

        // Create the challenge
        const { data: challenge, error } = await supabase
            .from('challenges')
            .insert({
                challenger_id: session.user.id,
                challenged_id: challengedUserId,
                challenged_email: !challengedUserId ? challenged_email : null,
                challenge_type,
                duration_days,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                status: challengedUserId ? 'pending' : 'pending', // Always pending until accepted
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating challenge:', error)
            return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
        }

        // Create invite link
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://devflow.io'}/challenge/${challenge.invite_code}`

        return NextResponse.json({
            success: true,
            challenge,
            inviteLink,
            message: challengedUserId
                ? 'Challenge sent! Waiting for response.'
                : 'Invite link created! Share it with your friend.'
        })
    } catch (error) {
        console.error('Challenges POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/challenges - Accept or decline a challenge
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { challenge_id, action } = body

        if (!challenge_id || !['accept', 'decline'].includes(action)) {
            return NextResponse.json({
                error: 'Invalid challenge_id or action'
            }, { status: 400 })
        }

        // Get the challenge
        const { data: challenge } = await supabase
            .from('challenges')
            .select('*')
            .eq('id', challenge_id)
            .single()

        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
        }

        // Verify the user is the challenged party
        if (challenge.challenged_id !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        if (challenge.status !== 'pending') {
            return NextResponse.json({ error: 'Challenge already responded to' }, { status: 400 })
        }

        // Update challenge status
        const newStatus = action === 'accept' ? 'active' : 'declined'
        const { error: updateError } = await supabase
            .from('challenges')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', challenge_id)

        if (updateError) {
            console.error('Error updating challenge:', updateError)
            return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            action,
            message: action === 'accept'
                ? 'Challenge accepted! Game on! 🔥'
                : 'Challenge declined.'
        })
    } catch (error) {
        console.error('Challenges PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
