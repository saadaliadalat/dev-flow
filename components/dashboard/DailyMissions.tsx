'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Flame, GitCommit, GitPullRequest, Eye, Check, Sparkles } from 'lucide-react'

interface Mission {
    id: string
    title: string
    description: string
    metric: 'commits' | 'prs' | 'reviews' | 'streak'
    target: number
    current: number
    xpReward: number
    isCompleted: boolean
    priority: 'high' | 'medium' | 'low'
}

interface MissionsSummary {
    totalMissions: number
    completedCount: number
    totalXPAvailable: number
    earnedXP: number
    completionRate: number
}

const METRIC_ICONS = {
    commits: GitCommit,
    prs: GitPullRequest,
    reviews: Eye,
    streak: Flame
}

const PRIORITY_COLORS = {
    high: 'from-orange-500/20 to-red-500/10 border-orange-500/30',
    medium: 'from-violet-500/15 to-indigo-500/10 border-violet-500/20',
    low: 'from-zinc-500/10 to-zinc-600/5 border-zinc-500/20'
}

export function DailyMissions({ className }: { className?: string }) {
    const [missions, setMissions] = useState<Mission[]>([])
    const [summary, setSummary] = useState<MissionsSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch('/api/missions/daily', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setMissions(data.missions || [])
                    setSummary(data.summary || null)
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    if (isLoading) {
        return (
            <div className={`animate-pulse space-y-3 ${className}`}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 rounded-xl bg-white/5" />
                ))}
            </div>
        )
    }

    if (missions.length === 0) return null

    return (
        <div className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target size={18} className="text-violet-400" />
                    <h2 className="font-heading font-semibold text-white">Daily Missions</h2>
                </div>
                {summary && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">
                            {summary.completedCount}/{summary.totalMissions}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                            <Sparkles size={12} className="text-violet-400" />
                            <span className="text-xs font-mono text-violet-300">
                                {summary.earnedXP}/{summary.totalXPAvailable} XP
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Missions List */}
            <div className="space-y-3">
                {missions.map((mission, i) => {
                    const Icon = METRIC_ICONS[mission.metric]
                    const progress = Math.min((mission.current / mission.target) * 100, 100)

                    return (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${PRIORITY_COLORS[mission.priority]} border p-4`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Completion Indicator */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${mission.isCompleted
                                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                                        : 'bg-white/5 border border-white/10'
                                    }`}>
                                    {mission.isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        >
                                            <Check size={18} className="text-emerald-400" />
                                        </motion.div>
                                    ) : (
                                        <Icon size={18} className="text-zinc-400" />
                                    )}
                                </div>

                                {/* Mission Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${mission.isCompleted ? 'text-zinc-400 line-through' : 'text-white'}`}>
                                            {mission.title}
                                        </span>
                                        <span className="text-xs text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                                            +{mission.xpReward} XP
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">{mission.description}</p>

                                    {/* Progress Bar */}
                                    {!mission.isCompleted && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-violet-500 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                {mission.current}/{mission.target}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
