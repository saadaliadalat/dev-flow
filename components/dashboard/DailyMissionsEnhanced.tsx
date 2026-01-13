'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Flame, GitCommit, GitPullRequest, Eye, Check, Sparkles, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'

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
    high: { bg: 'from-orange-500/20 to-red-500/10', border: 'border-orange-500/30', ring: '#F97316' },
    medium: { bg: 'from-violet-500/15 to-indigo-500/10', border: 'border-violet-500/20', ring: '#8B5CF6' },
    low: { bg: 'from-zinc-500/10 to-zinc-600/5', border: 'border-zinc-500/20', ring: '#71717A' }
}

// Mini progress ring component
function MiniRing({ progress, color, size = 40 }: { progress: number; color: string; size?: number }) {
    const strokeWidth = 3
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - progress)

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={strokeWidth}
            />
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
            />
        </svg>
    )
}

export function DailyMissionsEnhanced({ className }: { className?: string }) {
    const [missions, setMissions] = useState<Mission[]>([])
    const [summary, setSummary] = useState<MissionsSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
    const prevMissionsRef = useRef<Mission[]>([])

    useEffect(() => {
        fetch('/api/missions/daily', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setMissions(data.missions || [])
                    setSummary(data.summary || null)

                    // Track newly completed missions for confetti
                    const newlyCompleted = data.missions?.filter((m: Mission) =>
                        m.isCompleted && !prevMissionsRef.current.find(pm => pm.id === m.id && pm.isCompleted)
                    ) || []

                    if (newlyCompleted.length > 0) {
                        triggerConfetti()
                        setCompletedIds(new Set(newlyCompleted.map((m: Mission) => m.id)))
                    }

                    prevMissionsRef.current = data.missions || []
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    const triggerConfetti = () => {
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8B5CF6', '#F97316', '#10B981', '#FBBF24']
        })
    }

    if (isLoading) {
        return (
            <div className={`animate-pulse space-y-3 ${className}`}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-xl bg-white/5" />
                ))}
            </div>
        )
    }

    if (missions.length === 0) return null

    const allComplete = summary?.completedCount === summary?.totalMissions

    return (
        <div className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target size={18} className="text-violet-400" />
                    <h2 className="font-heading font-semibold text-white">Daily Missions</h2>
                </div>
                {summary && (
                    <motion.div
                        className="flex items-center gap-2"
                        animate={allComplete ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1, repeat: allComplete ? Infinity : 0 }}
                    >
                        {allComplete && <Trophy size={14} className="text-amber-400" />}
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border ${allComplete
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-violet-500/10 border-violet-500/20'
                            }`}>
                            <Sparkles size={12} className={allComplete ? 'text-emerald-400' : 'text-violet-400'} />
                            <span className={`text-xs font-mono ${allComplete ? 'text-emerald-300' : 'text-violet-300'}`}>
                                {summary.earnedXP}/{summary.totalXPAvailable} XP
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Motivational Micro-copy */}
            {summary && !allComplete && summary.completedCount > 0 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-zinc-500 mb-3 italic"
                >
                    {summary.completedCount === summary.totalMissions - 1
                        ? `Almost there! 1 more mission for +${missions.find(m => !m.isCompleted)?.xpReward || 0} XP`
                        : `${summary.totalMissions - summary.completedCount} missions left. You've got this.`}
                </motion.p>
            )}

            {/* All Complete Celebration */}
            {allComplete && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 flex items-center gap-3"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: 3 }}
                    >
                        <Trophy size={24} className="text-amber-400" />
                    </motion.div>
                    <div>
                        <span className="font-bold text-white">All Missions Complete!</span>
                        <p className="text-xs text-emerald-400">+{summary?.earnedXP} XP earned today. Legendary.</p>
                    </div>
                </motion.div>
            )}

            {/* Missions List */}
            <div className="space-y-3">
                {missions.map((mission, i) => {
                    const Icon = METRIC_ICONS[mission.metric]
                    const colors = PRIORITY_COLORS[mission.priority]
                    const progress = Math.min(mission.current / mission.target, 1)
                    const isNewlyCompleted = completedIds.has(mission.id)

                    return (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                scale: isNewlyCompleted ? [1, 1.02, 1] : 1
                            }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                            className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${colors.bg} border ${colors.border} p-4 cursor-pointer transition-all`}
                        >
                            {/* Completion shimmer */}
                            {mission.isCompleted && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            )}

                            <div className="flex items-center gap-4 relative z-10">
                                {/* Progress Ring */}
                                <div className="relative">
                                    {mission.isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                            className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
                                        >
                                            <Check size={18} className="text-emerald-400" />
                                        </motion.div>
                                    ) : (
                                        <div className="relative">
                                            <MiniRing progress={progress} color={colors.ring} />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Icon size={14} className="text-zinc-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mission Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${mission.isCompleted ? 'text-zinc-400 line-through' : 'text-white'}`}>
                                            {mission.title}
                                        </span>
                                        <motion.span
                                            className={`text-xs px-1.5 py-0.5 rounded ${mission.isCompleted
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-violet-500/10 text-violet-400'
                                                }`}
                                            animate={mission.isCompleted ? { scale: [1, 1.1, 1] } : {}}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {mission.isCompleted ? '✓' : '+'}{mission.xpReward} XP
                                        </motion.span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">{mission.description}</p>

                                    {/* Progress Text */}
                                    {!mission.isCompleted && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                {mission.current}/{mission.target}
                                            </span>
                                            <span className="text-[10px] text-zinc-600">
                                                ({Math.round(progress * 100)}%)
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
