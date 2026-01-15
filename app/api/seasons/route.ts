import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/db'

/**
 * 📅 SEASONS API
 * 
 * GET - Get current season info and user's ranking
 * POST - Join the current season
 */

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        // Get current active season
        const { data: season } = await supabase
            .from('seasons')
            .select('*')
            .eq('status', 'active')
            .single()

        if (!season) {
            return NextResponse.json({
                currentSeason: null,
                message: 'No active season'
            })
        }

        // Calculate days remaining
        const endDate = new Date(season.end_date)
        const now = new Date()
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

        // Get top 10 rankings
        const { data: topRankings } = await supabase
            .from('season_rankings')
            .select(`
                *,
                user:users(id, username, name, avatar_url, level, level_title)
            `)
            .eq('season_id', season.id)
            .order('rank', { ascending: true })
            .limit(10)

        // Get user's ranking if logged in
        let userRanking = null
        if (session?.user?.id) {
            const { data: ranking } = await supabase
                .from('season_rankings')
                .select('*')
                .eq('season_id', season.id)
                .eq('user_id', session.user.id)
                .single()

            userRanking = ranking
        }

        // Get total participants
        const { count: totalParticipants } = await supabase
            .from('season_rankings')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', season.id)

        return NextResponse.json({
            currentSeason: {
                id: season.id,
                name: season.name,
                slug: season.slug,
                seasonNumber: season.season_number,
                startDate: season.start_date,
                endDate: season.end_date,
                daysRemaining,
                themeColor: season.theme_color,
                badgeIcon: season.badge_icon,
                rewards: season.rewards,
                totalParticipants: totalParticipants || 0,
            },
            topRankings: topRankings || [],
            userRanking,
        })
    } catch (error) {
        console.error('Seasons GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Join the current season
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get current active season
        const { data: season } = await supabase
            .from('seasons')
            .select('id')
            .eq('status', 'active')
            .single()

        if (!season) {
            return NextResponse.json({ error: 'No active season' }, { status: 400 })
        }

        // Check if already joined
        const { data: existing } = await supabase
            .from('season_rankings')
            .select('id')
            .eq('season_id', season.id)
            .eq('user_id', session.user.id)
            .single()

        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Already joined this season'
            })
        }

        // Join the season
        const { error } = await supabase
            .from('season_rankings')
            .insert({
                season_id: season.id,
                user_id: session.user.id,
                commits: 0,
                prs_merged: 0,
                xp_earned: 0,
                days_active: 0,
            })

        if (error) {
            console.error('Failed to join season:', error)
            return NextResponse.json({ error: 'Failed to join season' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Joined the season! Good luck!'
        })
    } catch (error) {
        console.error('Seasons POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
