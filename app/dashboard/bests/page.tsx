'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Trophy, Flame, GitCommit, GitPullRequest, Calendar,
    Zap, Crown, Target, Award, TrendingUp, Clock, Star
} from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'

interface PersonalBests {
    longestStreak: number
    currentStreak: number
    mostCommitsInDay: number
    mostCommitsInWeek: number
    totalCommits: number
    totalPRs: number
    firstCommitDate: string | null
    activeMonths: number
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
}

export default function PersonalBestsPage() {
    const [bests, setBests] = useState<PersonalBests | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchBests() {
            try {
                const res = await fetch('/api/user/bests')
                if (res.ok) {
                    const data = await res.json()
                    setBests(data)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBests()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                    <Trophy className="w-8 h-8 text-amber-500" />
                </motion.div>
            </div>
        )
    }

    const records = bests ? [
        {
            icon: Flame,
            label: 'Longest Streak',
            value: bests.longestStreak,
            unit: 'days',
            color: 'orange',
            isCurrent: bests.currentStreak === bests.longestStreak && bests.currentStreak > 0,
        },
        {
            icon: Zap,
            label: 'Most Commits (Day)',
            value: bests.mostCommitsInDay,
            unit: 'commits',
            color: 'violet',
        },
        {
            icon: TrendingUp,
            label: 'Most Commits (Week)',
            value: bests.mostCommitsInWeek,
            unit: 'commits',
            color: 'cyan',
        },
        {
            icon: GitCommit,
            label: 'Total Lifetime Commits',
            value: bests.totalCommits,
            unit: 'commits',
            color: 'emerald',
        },
        {
            icon: GitPullRequest,
            label: 'Pull Requests Merged',
            value: bests.totalPRs,
            unit: 'PRs',
            color: 'blue',
        },
        {
            icon: Calendar,
            label: 'Active Months',
            value: bests.activeMonths,
            unit: 'months',
            color: 'amber',
        },
    ] : []

    const colorMap: Record<string, string> = {
        orange: 'from-orange-500/20 to-transparent border-orange-500/30 text-orange-400',
        violet: 'from-violet-500/20 to-transparent border-violet-500/30 text-violet-400',
        cyan: 'from-cyan-500/20 to-transparent border-cyan-500/30 text-cyan-400',
        emerald: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
        blue: 'from-blue-500/20 to-transparent border-blue-500/30 text-blue-400',
        amber: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                    <Trophy className="text-amber-500" />
                    Personal Bests
                </h1>
                <p className="text-zinc-500 mt-2">
                    Your all-time records and milestones. These are the peaks of your coding journey.
                </p>
            </motion.div>

            {/* Current Streak Banner */}
            {bests && bests.currentStreak > 0 && (
                <motion.div variants={itemVariants}>
                    <AliveCard className="p-6 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/20" glass>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-orange-500/20">
                                    <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-400">Current Streak</p>
                                    <p className="text-4xl font-black text-white tabular-nums">
                                        {bests.currentStreak} <span className="text-lg font-normal text-zinc-500">days</span>
                                    </p>
                                </div>
                            </div>
                            {bests.currentStreak === bests.longestStreak && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
                                    <Crown className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-bold text-amber-400">Personal Best!</span>
                                </div>
                            )}
                        </div>
                    </AliveCard>
                </motion.div>
            )}

            {/* Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.map((record, i) => (
                    <motion.div key={record.label} variants={itemVariants}>
                        <AliveCard
                            className={`p-6 bg-gradient-to-br ${colorMap[record.color]} relative overflow-hidden group`}
                            glass
                        >
                            {record.isCurrent && (
                                <div className="absolute top-3 right-3">
                                    <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                                </div>
                            )}
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl bg-white/5`}>
                                    <record.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                                        {record.label}
                                    </p>
                                    <p className="text-3xl font-black text-white tabular-nums">
                                        {record.value.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">{record.unit}</p>
                                </div>
                            </div>
                            {/* Hover glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                        </AliveCard>
                    </motion.div>
                ))}
            </div>

            {/* Journey Start */}
            {bests?.firstCommitDate && (
                <motion.div variants={itemVariants} className="text-center pt-8 border-t border-white/5">
                    <p className="text-sm text-zinc-600">
                        Your DevFlow journey started on{' '}
                        <span className="text-zinc-400 font-medium">
                            {new Date(bests.firstCommitDate).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </p>
                </motion.div>
            )}

            {/* Empty State */}
            {!bests && !isLoading && (
                <div className="text-center py-20">
                    <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Records Yet</h3>
                    <p className="text-zinc-500">Start coding to set your first personal bests!</p>
                </div>
            )}
        </motion.div>
    )
}
