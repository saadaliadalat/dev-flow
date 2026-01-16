import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 📊 UPDATE CHALLENGE SCORES
 * 
 * POST - Updates scores for all active challenges based on real GitHub data
 * Called after GitHub sync or via cron job
 */
export async function POST(req: NextRequest) {
    try {
        // Fetch all active challenges
        const { data: activeChallenges, error: fetchError } = await supabase
            .from('challenges')
            .select('*')
            .eq('status', 'active')

        if (fetchError) {
            console.error('Error fetching challenges:', fetchError)
            return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
        }

        if (!activeChallenges || activeChallenges.length === 0) {
            return NextResponse.json({ message: 'No active challenges', updated: 0 })
        }

        console.log(`Updating scores for ${activeChallenges.length} active challenges`)

        let updatedCount = 0
        let completedCount = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (const challenge of activeChallenges) {
            const startDate = challenge.start_date
            const endDate = challenge.end_date
            const challengeEndDate = new Date(endDate)
            challengeEndDate.setHours(23, 59, 59, 999)

            // Get challenger's commits during challenge period
            const { data: challengerStats } = await supabase
                .from('daily_stats')
                .select('total_commits')
                .eq('user_id', challenge.challenger_id)
                .gte('date', startDate)
                .lte('date', endDate)

            const challengerScore = challengerStats?.reduce((sum, day) => sum + (day.total_commits || 0), 0) || 0

            // Get challenged user's commits (if they exist)
            let challengedScore = 0
            if (challenge.challenged_id) {
                const { data: challengedStats } = await supabase
                    .from('daily_stats')
                    .select('total_commits')
                    .eq('user_id', challenge.challenged_id)
                    .gte('date', startDate)
                    .lte('date', endDate)

                challengedScore = challengedStats?.reduce((sum, day) => sum + (day.total_commits || 0), 0) || 0
            }

            // Check if challenge should be completed
            const isExpired = today > challengeEndDate

            if (isExpired) {
                // Determine winner
                let winnerId = null
                let isTie = false

                if (challengerScore > challengedScore) {
                    winnerId = challenge.challenger_id
                } else if (challengedScore > challengerScore) {
                    winnerId = challenge.challenged_id
                } else {
                    isTie = true
                }

                // Mark as completed
                const { error: updateError } = await supabase
                    .from('challenges')
                    .update({
                        challenger_score: challengerScore,
                        challenged_score: challengedScore,
                        status: 'completed',
                        winner_id: winnerId,
                        tie: isTie,
                        completed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', challenge.id)

                if (!updateError) {
                    completedCount++

                    // Award XP to winner (if not already awarded)
                    if (winnerId && !challenge.xp_awarded) {
                        const xpReward = challenge.xp_reward || 100

                        // Get current XP
                        const { data: winner } = await supabase
                            .from('users')
                            .select('xp')
                            .eq('id', winnerId)
                            .single()

                        if (winner) {
                            await supabase
                                .from('users')
                                .update({ xp: (winner.xp || 0) + xpReward })
                                .eq('id', winnerId)

                            // Log XP transaction
                            await supabase.from('xp_transactions').insert({
                                user_id: winnerId,
                                amount: xpReward,
                                source: 'challenge_win',
                                description: `Won a ${challenge.challenge_type} challenge!`,
                                metadata: { challenge_id: challenge.id }
                            })

                            // Mark XP as awarded
                            await supabase
                                .from('challenges')
                                .update({ xp_awarded: true })
                                .eq('id', challenge.id)
                        }
                    }
                }
            } else {
                // Just update scores
                const { error: updateError } = await supabase
                    .from('challenges')
                    .update({
                        challenger_score: challengerScore,
                        challenged_score: challengedScore,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', challenge.id)

                if (!updateError) {
                    updatedCount++
                }
            }

            console.log(`Challenge ${challenge.id}: challenger=${challengerScore}, challenged=${challengedScore}${isExpired ? ' (COMPLETED)' : ''}`)
        }

        return NextResponse.json({
            success: true,
            updated: updatedCount,
            completed: completedCount,
            total: activeChallenges.length
        })

    } catch (error) {
        console.error('Update scores error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET - Get status of score updates (for debugging)
export async function GET() {
    try {
        const { data: challenges, error } = await supabase
            .from('challenges')
            .select(`
                id, status, challenge_type, start_date, end_date,
                challenger_score, challenged_score, winner_id, tie,
                challenger:users!challenges_challenger_id_fkey(username),
                challenged:users!challenges_challenged_id_fkey(username)
            `)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ challenges })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
