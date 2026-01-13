'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calculator, Target, TrendingUp, Trophy, Flame, Zap,
    Crown, ArrowRight, Minus, Plus, Sparkles
} from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'

interface Prediction {
    simulation: {
        daysToNextRank: number
        estimatedNewRank: number
        xpGain: number
        streakBonus: number
    }
    currentState: {
        rank: number
        xp: number
        streak: number
        avgDailyCommits: number
    }
    nextRival: {
        name: string
        xp: number
        gap: number
        commitsToOvertake: number
    } | null
    milestones: {
        title: string
        progress: number
        remaining: number
        estimatedDays: number
    }[]
}

export default function GoalSimulatorPage() {
    const [prediction, setPrediction] = useState<Prediction | null>(null)
    const [targetCommits, setTargetCommits] = useState(5)
    const [isLoading, setIsLoading] = useState(true)

    const fetchPrediction = async (commits: number) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/simulator?commits=${commits}`)
            if (res.ok) {
                const data = await res.json()
                setPrediction(data)
            }
        } catch (e) {
            console.error('Simulator error:', e)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPrediction(targetCommits)
    }, [targetCommits])

    const adjustTarget = (delta: number) => {
        setTargetCommits(t => Math.max(1, Math.min(50, t + delta)))
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                    <Calculator className="text-violet-400" />
                    Goal Simulator
                </h1>
                <p className="text-sm text-zinc-500">
                    See how your daily actions compound into results
                </p>
            </div>

            {/* Target Selector */}
            <AliveCard className="p-6" glass>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-heading font-semibold text-white mb-1">
                            Daily Commit Target
                        </h2>
                        <p className="text-xs text-zinc-500">
                            Adjust to see how it affects your trajectory
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => adjustTarget(-1)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <Minus size={16} className="text-zinc-400" />
                        </button>

                        <motion.div
                            key={targetCommits}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 text-center"
                        >
                            <span className="text-4xl font-mono font-black text-violet-400">
                                {targetCommits}
                            </span>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                commits/day
                            </p>
                        </motion.div>

                        <button
                            onClick={() => adjustTarget(1)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <Plus size={16} className="text-zinc-400" />
                        </button>
                    </div>
                </div>
            </AliveCard>

            {/* Loading */}
            {isLoading && !prediction && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                            <Calculator size={32} className="text-violet-400" />
                        </motion.div>
                        <p className="text-zinc-500 text-sm">Calculating trajectory...</p>
                    </div>
                </div>
            )}

            {/* Results */}
            {prediction && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Rank Projection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AliveCard className="p-6 h-full" glass>
                            <div className="flex items-center gap-2 mb-4">
                                <Crown size={18} className="text-amber-400" />
                                <h3 className="font-heading font-semibold text-white">Rank Projection</h3>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div className="text-center">
                                    <p className="text-xs text-zinc-500 mb-1">Current</p>
                                    <span className="text-3xl font-mono font-bold text-zinc-400">
                                        #{prediction.currentState.rank}
                                    </span>
                                </div>

                                <div className="flex-1 flex items-center justify-center">
                                    <ArrowRight size={24} className="text-violet-500" />
                                </div>

                                <div className="text-center">
                                    <p className="text-xs text-zinc-500 mb-1">Projected</p>
                                    <motion.span
                                        key={prediction.simulation.estimatedNewRank}
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="text-3xl font-mono font-bold text-emerald-400"
                                    >
                                        #{prediction.simulation.estimatedNewRank}
                                    </motion.span>
                                </div>
                            </div>

                            {prediction.nextRival && (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-xs text-zinc-500 mb-2">To beat {prediction.nextRival.name}:</p>
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className="text-amber-400" />
                                        <span className="text-sm text-white font-medium">
                                            {prediction.nextRival.commitsToOvertake} commits
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            (~{prediction.simulation.daysToNextRank} days)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </AliveCard>
                    </motion.div>

                    {/* XP Gains */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AliveCard className="p-6 h-full" glass>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={18} className="text-violet-400" />
                                <h3 className="font-heading font-semibold text-white">Daily XP Gains</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                    <span className="text-sm text-violet-300">Base XP</span>
                                    <span className="font-mono font-bold text-violet-400">
                                        +{prediction.simulation.xpGain - prediction.simulation.streakBonus}
                                    </span>
                                </div>

                                {prediction.simulation.streakBonus > 0 && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <div className="flex items-center gap-2">
                                            <Flame size={14} className="text-amber-400" />
                                            <span className="text-sm text-amber-300">
                                                Streak Bonus ({prediction.currentState.streak}d)
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-amber-400">
                                            +{prediction.simulation.streakBonus}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="text-sm font-medium text-emerald-300">Total Daily XP</span>
                                    <span className="text-2xl font-mono font-bold text-emerald-400">
                                        +{prediction.simulation.xpGain}
                                    </span>
                                </div>
                            </div>
                        </AliveCard>
                    </motion.div>
                </div>
            )}

            {/* Milestones */}
            {prediction && prediction.milestones.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        <Trophy size={18} className="text-amber-400" />
                        Upcoming Milestones
                    </h3>

                    <div className="grid gap-4">
                        {prediction.milestones.map((milestone, i) => (
                            <AliveCard key={i} className="p-4" glass>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-white">{milestone.title}</span>
                                    <span className="text-xs text-zinc-500">
                                        {milestone.estimatedDays === 0 ? 'Today!' : `~${milestone.estimatedDays} days`}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(milestone.progress / (milestone.progress + milestone.remaining)) * 100}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                    />
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-zinc-500">
                                        {milestone.progress} / {milestone.progress + milestone.remaining}
                                    </span>
                                    <span className="text-xs text-violet-400">
                                        {milestone.remaining} remaining
                                    </span>
                                </div>
                            </AliveCard>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Current Stats */}
            {prediction && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                    <p className="text-xs text-zinc-500 text-center">
                        Based on your current velocity of{' '}
                        <span className="text-white font-mono">
                            {prediction.currentState.avgDailyCommits}
                        </span>{' '}
                        commits/day and{' '}
                        <span className="text-white font-mono">
                            {prediction.currentState.xp}
                        </span>{' '}
                        XP
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}
