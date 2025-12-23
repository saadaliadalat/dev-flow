'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Trophy, Lock, Zap, Code, GitCommit, Bug, Coffee, Rocket, Star, Shield, Target, Flame,
    GitPullRequest, Calendar, Clock, Award, Crown, Lightbulb, Heart, Users, Loader2
} from 'lucide-react'

// All possible achievements
const achievementDefinitions = [
    {
        id: 'first-commit',
        title: 'First Commit',
        description: 'Pushed your first code to the repository.',
        icon: GitCommit,
        requirement: 'Make your first commit'
    },
    {
        id: 'bug-hunter',
        title: 'Bug Hunter',
        description: 'Resolved 10 issues.',
        icon: Bug,
        requirement: 'Close 10 issues'
    },
    {
        id: 'midnight-coder',
        title: 'Midnight Coder',
        description: 'Committed code between 12 AM and 5 AM.',
        icon: Coffee,
        requirement: 'Late night coding session'
    },
    {
        id: '10x-engineer',
        title: '10x Engineer',
        description: 'Reached a productivity score of 90+.',
        icon: Zap,
        requirement: 'Achieve 90+ productivity score'
    },
    {
        id: 'ship-it',
        title: 'Ship It!',
        description: 'Merged 5 pull requests.',
        icon: Rocket,
        requirement: 'Merge 5 PRs'
    },
    {
        id: 'clean-code',
        title: 'Clean Code',
        description: 'Maintained a consistent commit streak.',
        icon: Shield,
        requirement: 'Keep your code clean'
    },
    {
        id: 'streak-7',
        title: 'Week Warrior',
        description: 'Coded for 7 consecutive days.',
        icon: Flame,
        requirement: '7-day streak'
    },
    {
        id: 'streak-30',
        title: 'Streak Master',
        description: 'Coded for 30 consecutive days.',
        icon: Crown,
        requirement: '30-day streak'
    },
    {
        id: 'goal-crusher',
        title: 'Goal Crusher',
        description: 'Completed 5 goals.',
        icon: Target,
        requirement: 'Complete 5 goals'
    },
    {
        id: 'star-struck',
        title: 'Star Struck',
        description: 'Received 10 stars on your repositories.',
        icon: Star,
        requirement: 'Get 10 repo stars'
    },
    {
        id: 'polyglot',
        title: 'Polyglot',
        description: 'Contributed in 5 different languages.',
        icon: Code,
        requirement: 'Use 5+ languages'
    },
    {
        id: 'pr-master',
        title: 'PR Master',
        description: 'Opened 25 pull requests.',
        icon: GitPullRequest,
        requirement: 'Open 25 PRs'
    },
    {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Committed code before 7 AM.',
        icon: Clock,
        requirement: 'Morning coding session'
    },
    {
        id: 'weekend-warrior',
        title: 'Weekend Warrior',
        description: 'Coded on 10 weekends.',
        icon: Calendar,
        requirement: '10 weekend coding sessions'
    },
    {
        id: 'centurion',
        title: 'Centurion',
        description: 'Reached 100 total commits.',
        icon: Award,
        requirement: '100 commits'
    },
    {
        id: 'innovator',
        title: 'Innovator',
        description: 'Created 5 repositories.',
        icon: Lightbulb,
        requirement: 'Create 5 repos'
    },
    {
        id: 'contributor',
        title: 'Open Source Hero',
        description: 'Contributed to external projects.',
        icon: Heart,
        requirement: 'Contribute to open source'
    },
    {
        id: 'team-player',
        title: 'Team Player',
        description: 'Collaborated on team projects.',
        icon: Users,
        requirement: 'Work with others'
    }
]

interface UserAchievement {
    achievement_id: string
    is_unlocked: boolean
    unlocked_at?: string
    current_progress?: number
}

export default function AchievementsPage() {
    const [userStats, setUserStats] = useState<any>(null)
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            // Fetch user stats
            const userRes = await fetch('/api/user/me')
            const userData = await userRes.json()
            if (userRes.ok) {
                setUserStats(userData.user)
            }

            // Fetch achievements from API (if available)
            const achieveRes = await fetch('/api/achievements')
            const achieveData = await achieveRes.json()
            if (achieveRes.ok) {
                setUserAchievements(achieveData.achievements || [])
            }
        } catch (error) {
            console.error('Error fetching achievements:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Determine which achievements are unlocked based on stats
    function isUnlocked(achievementId: string): { unlocked: boolean; date?: string } {
        // First check if we have stored achievement data
        const stored = userAchievements.find(a => a.achievement_id === achievementId)
        if (stored?.is_unlocked) {
            return { unlocked: true, date: stored.unlocked_at }
        }

        // Otherwise, calculate based on user stats
        if (!userStats) return { unlocked: false }

        const totalCommits = userStats.total_commits || 0
        const totalPRs = userStats.total_prs || 0
        const totalRepos = userStats.total_repos || 0
        const currentStreak = userStats.current_streak || 0
        const productivityScore = userStats.productivity_score || 0

        switch (achievementId) {
            case 'first-commit':
                return { unlocked: totalCommits >= 1 }
            case 'centurion':
                return { unlocked: totalCommits >= 100 }
            case 'ship-it':
                return { unlocked: totalPRs >= 5 }
            case 'pr-master':
                return { unlocked: totalPRs >= 25 }
            case 'streak-7':
                return { unlocked: currentStreak >= 7 }
            case 'streak-30':
                return { unlocked: currentStreak >= 30 }
            case '10x-engineer':
                return { unlocked: productivityScore >= 90 }
            case 'innovator':
                return { unlocked: totalRepos >= 5 }
            default:
                return { unlocked: false }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    const unlockedCount = achievementDefinitions.filter(a => isUnlocked(a.id).unlocked).length

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Achievements</h1>
                    <p className="text-[var(--text-tertiary)]">Unlock badges by mastering your workflow.</p>
                </div>
                <div className="premium-card px-4 py-2 flex items-center gap-3">
                    <Trophy className="text-amber-400" size={20} />
                    <span className="text-white font-bold">{unlockedCount}</span>
                    <span className="text-zinc-500">/ {achievementDefinitions.length}</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {achievementDefinitions.map((achievement, i) => {
                    const Icon = achievement.icon
                    const status = isUnlocked(achievement.id)

                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className={`aspect-square relative group rounded-2xl flex flex-col items-center justify-center p-4 text-center border transition-all duration-300 ${status.unlocked
                                ? 'bg-zinc-900 border-purple-500/30 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] hover:border-purple-500/50'
                                : 'bg-zinc-950 border-zinc-900 opacity-60 grayscale'
                                }`}
                        >
                            {/* Inner Glow for Unlocked */}
                            {status.unlocked && (
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}

                            {/* Icon Container */}
                            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${status.unlocked
                                ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-inner'
                                : 'bg-zinc-900'
                                }`}>
                                <Icon size={24} className={status.unlocked ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-zinc-600'} />
                                {!status.unlocked && (
                                    <div className="absolute -top-1 -right-1 bg-zinc-950 rounded-full p-1 border border-zinc-800">
                                        <Lock size={10} className="text-zinc-500" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <h3 className={`text-xs font-bold mb-1 ${status.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                                {achievement.title}
                            </h3>
                            <p className="text-[9px] text-zinc-500 leading-tight line-clamp-2">
                                {achievement.description}
                            </p>

                            {/* Unlocked Date */}
                            {status.unlocked && status.date && (
                                <span className="absolute bottom-2 text-[8px] text-zinc-600 font-mono">
                                    {new Date(status.date).toLocaleDateString()}
                                </span>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
