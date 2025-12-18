import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Achievement definitions
const ACHIEVEMENTS = [
    {
        key: 'streak_7',
        title: '7 Day Streak',
        description: 'Committed code for 7 days straight',
        category: 'streak',
        tier: 'bronze',
        icon: '🔥',
        target: 7,
        check: (user: any) => user.current_streak >= 7
    },
    {
        key: 'streak_30',
        title: 'Monthly Warrior',
        description: '30 day coding streak',
        category: 'streak',
        tier: 'silver',
        icon: '⚡',
        target: 30,
        check: (user: any) => user.current_streak >= 30
    },
    {
        key: 'streak_100',
        title: 'Century Club',
        description: '100 day coding streak',
        category: 'streak',
        tier: 'gold',
        icon: '💯',
        target: 100,
        check: (user: any) => user.longest_streak >= 100
    },
    {
        key: 'commits_100',
        title: 'Committed',
        description: '100 total commits',
        category: 'volume',
        tier: 'bronze',
        icon: '📝',
        target: 100,
        check: (user: any) => user.total_commits >= 100
    },
    {
        key: 'commits_1000',
        title: 'Prolific Coder',
        description: '1,000 total commits',
        category: 'volume',
        tier: 'silver',
        icon: '🚀',
        target: 1000,
        check: (user: any) => user.total_commits >= 1000
    },
    {
        key: 'commits_10000',
        title: 'Code Machine',
        description: '10,000 total commits',
        category: 'volume',
        tier: 'gold',
        icon: '🏆',
        target: 10000,
        check: (user: any) => user.total_commits >= 10000
    },
    {
        key: 'night_owl',
        title: 'Night Owl',
        description: '50 commits between midnight and 6am',
        category: 'special',
        tier: 'silver',
        icon: '🦉',
        target: 50,
        check: async (user: any) => {
            const { data: stats } = await supabase
                .from('daily_stats')
                .select('commits_by_hour')
                .eq('user_id', user.id)

            let lateNightCommits = 0
            stats?.forEach(day => {
                if (day.commits_by_hour) {
                    for (let hour = 0; hour <= 5; hour++) {
                        lateNightCommits += day.commits_by_hour[hour] || 0
                    }
                }
            })

            return lateNightCommits >= 50
        }
    },
    {
        key: 'early_bird',
        title: 'Early Bird',
        description: '50 commits between 5am and 8am',
        category: 'special',
        tier: 'silver',
        icon: '🌅',
        target: 50,
        check: async (user: any) => {
            const { data: stats } = await supabase
                .from('daily_stats')
                .select('commits_by_hour')
                .eq('user_id', user.id)

            let earlyCommits = 0
            stats?.forEach(day => {
                if (day.commits_by_hour) {
                    for (let hour = 5; hour <= 7; hour++) {
                        earlyCommits += day.commits_by_hour[hour] || 0
                    }
                }
            })

            return earlyCommits >= 50
        }
    },
    {
        key: 'polyglot',
        title: 'Polyglot',
        description: 'Coded in 5+ different languages',
        category: 'diversity',
        tier: 'silver',
        icon: '🌍',
        target: 5,
        check: async (user: any) => {
            const { data: stats } = await supabase
                .from('daily_stats')
                .select('languages')
                .eq('user_id', user.id)

            const allLanguages = new Set<string>()
            stats?.forEach(day => {
                if (day.languages) {
                    Object.keys(day.languages).forEach(lang => allLanguages.add(lang))
                }
            })

            return allLanguages.size >= 5
        }
    },
    {
        key: 'weekend_warrior',
        title: 'Weekend Warrior',
        description: 'Coded on 20+ weekends',
        category: 'special',
        tier: 'silver',
        icon: '🎮',
        target: 20,
        check: async (user: any) => {
            const { data: stats } = await supabase
                .from('daily_stats')
                .select('is_weekend, total_commits')
                .eq('user_id', user.id)
                .eq('is_weekend', true)
                .gt('total_commits', 0)

            return (stats?.length || 0) >= 20
        }
    },
    {
        key: 'pr_master',
        title: 'PR Master',
        description: 'Merged 100 pull requests',
        category: 'collaboration',
        tier: 'silver',
        icon: '🔀',
        target: 100,
        check: (user: any) => user.total_prs >= 100
    },
    {
        key: 'issue_hunter',
        title: 'Issue Hunter',
        description: 'Closed 50 issues',
        category: 'collaboration',
        tier: 'bronze',
        icon: '🎯',
        target: 50,
        check: (user: any) => user.total_issues >= 50
    },
    {
        key: 'productivity_king',
        title: 'Productivity King',
        description: 'Achieved 90+ productivity score',
        category: 'quality',
        tier: 'gold',
        icon: '👑',
        target: 90,
        check: (user: any) => user.productivity_score >= 90
    },
    {
        key: 'first_commit',
        title: 'First Steps',
        description: 'Made your first commit',
        category: 'milestone',
        tier: 'bronze',
        icon: '🎉',
        target: 1,
        check: (user: any) => user.total_commits >= 1
    },
    {
        key: 'consistent_coder',
        title: 'Consistent Coder',
        description: 'Coded for 50 days',
        category: 'consistency',
        tier: 'silver',
        icon: '📅',
        target: 50,
        check: async (user: any) => {
            const { data: stats } = await supabase
                .from('daily_stats')
                .select('date')
                .eq('user_id', user.id)
                .gt('total_commits', 0)

            return (stats?.length || 0) >= 50
        }
    }
]

export async function POST(req: Request) {
    try {
        const { userId } = await req.json()

        // Fetch user data
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check each achievement
        const unlockedAchievements: any[] = []

        for (const achievement of ACHIEVEMENTS) {
            // Check if already unlocked
            const { data: existing } = await supabase
                .from('achievements')
                .select('id, is_unlocked')
                .eq('user_id', userId)
                .eq('achievement_key', achievement.key)
                .single()

            if (existing?.is_unlocked) continue

            // Check if condition is met
            const isUnlocked = await achievement.check(user)

            if (isUnlocked) {
                // Unlock achievement
                await supabase.from('achievements').upsert({
                    user_id: userId,
                    achievement_key: achievement.key,
                    title: achievement.title,
                    description: achievement.description,
                    category: achievement.category,
                    tier: achievement.tier,
                    icon: achievement.icon,
                    current_progress: achievement.target,
                    target_progress: achievement.target,
                    is_unlocked: true,
                    unlocked_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,achievement_key'
                })

                unlockedAchievements.push(achievement)
            } else {
                // Update progress if not unlocked
                let currentProgress = 0

                if (achievement.key.startsWith('streak_')) {
                    currentProgress = user.current_streak
                } else if (achievement.key.startsWith('commits_')) {
                    currentProgress = user.total_commits
                } else if (achievement.key === 'pr_master') {
                    currentProgress = user.total_prs
                } else if (achievement.key === 'issue_hunter') {
                    currentProgress = user.total_issues
                } else if (achievement.key === 'productivity_king') {
                    currentProgress = user.productivity_score
                }

                await supabase.from('achievements').upsert({
                    user_id: userId,
                    achievement_key: achievement.key,
                    title: achievement.title,
                    description: achievement.description,
                    category: achievement.category,
                    tier: achievement.tier,
                    icon: achievement.icon,
                    current_progress: currentProgress,
                    target_progress: achievement.target,
                    is_unlocked: false
                }, {
                    onConflict: 'user_id,achievement_key'
                })
            }
        }

        return NextResponse.json({
            success: true,
            newlyUnlocked: unlockedAchievements.length,
            achievements: unlockedAchievements
        })

    } catch (error: any) {
        console.error('Achievement unlock error:', error)
        return NextResponse.json({
            error: 'Failed to check achievements',
            details: error.message
        }, { status: 500 })
    }
}

// GET endpoint to list all achievements
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }

        const { data: achievements, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', userId)
            .order('unlocked_at', { ascending: false, nullsFirst: false })

        if (error) throw error

        return NextResponse.json({
            success: true,
            achievements: achievements || []
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to fetch achievements',
            details: error.message
        }, { status: 500 })
    }
}
