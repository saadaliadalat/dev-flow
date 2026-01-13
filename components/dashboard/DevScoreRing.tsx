'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Zap, Info, TrendingUp } from 'lucide-react'

interface DevScoreRingProps {
    streak: number
    thisWeekCommits: number
    lastWeekCommits: number
    thisWeekPRs: number
    activeDaysThisWeek: number
    className?: string
}

/**
 * DEV SCORE FORMULA:
 * SCORE = (0.35×streak + 0.30×consistency + 0.20×velocity + 0.15×quality) × 100
 *
 * Where:
 * - streak_score = min(1, current_streak / 14)
 * - consistency_score = active_days_this_week / 7
 * - velocity_score = min(1, this_week_commits / max(last_week_commits, 10))
 * - quality_score = min(1, prs / max(commits/10, 1))
 */
function calculateDevScore(
    streak: number,
    activeDays: number,
    thisWeekCommits: number,
    lastWeekCommits: number,
    prs: number
): { score: number; breakdown: { streak: number; consistency: number; velocity: number; quality: number } } {
    const streakScore = Math.min(1, streak / 14)
    const consistencyScore = activeDays / 7
    const velocityScore = Math.min(1, thisWeekCommits / Math.max(lastWeekCommits, 10))
    const qualityScore = Math.min(1, prs / Math.max(thisWeekCommits / 10, 1))

    const score = Math.round(
        (0.35 * streakScore + 0.30 * consistencyScore + 0.20 * velocityScore + 0.15 * qualityScore) * 100
    )

    return {
        score: Math.max(0, Math.min(100, score)),
        breakdown: {
            streak: Math.round(streakScore * 100),
            consistency: Math.round(consistencyScore * 100),
            velocity: Math.round(velocityScore * 100),
            quality: Math.round(qualityScore * 100)
        }
    }
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#10B981' // emerald
    if (score >= 60) return '#8B5CF6' // violet
    if (score >= 40) return '#F59E0B' // amber
    return '#EF4444' // red
}

function getScoreLabel(score: number): string {
    if (score >= 80) return 'Exceptional'
    if (score >= 60) return 'Strong'
    if (score >= 40) return 'Building'
    if (score >= 20) return 'Warming Up'
    return 'Getting Started'
}

export function DevScoreRing({
    streak,
    thisWeekCommits,
    lastWeekCommits,
    thisWeekPRs,
    activeDaysThisWeek,
    className
}: DevScoreRingProps) {
    const [showTooltip, setShowTooltip] = useState(false)
    const { score, breakdown } = calculateDevScore(
        streak,
        activeDaysThisWeek,
        thisWeekCommits,
        lastWeekCommits,
        thisWeekPRs
    )

    const color = getScoreColor(score)
    const label = getScoreLabel(score)

    // Animated score counter
    const springValue = useSpring(0, { stiffness: 50, damping: 20 })
    const displayScore = useTransform(springValue, Math.round)
    const [animatedScore, setAnimatedScore] = useState(0)

    useEffect(() => {
        springValue.set(score)
        const unsubscribe = displayScore.on('change', v => setAnimatedScore(v))
        return unsubscribe
    }, [score, springValue, displayScore])

    // SVG ring params
    const size = 160
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - score / 100)

    return (
        <div className={`relative ${className}`}>
            <div className="flex flex-col items-center p-6">
                {/* Ring */}
                <div className="relative">
                    <svg width={size} height={size} className="-rotate-90">
                        {/* Background ring */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={strokeWidth}
                        />
                        {/* Animated progress ring */}
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
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                filter: `drop-shadow(0 0 10px ${color}50)`
                            }}
                        />
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            className="text-4xl font-mono font-black"
                            style={{ color }}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            {animatedScore}
                        </motion.span>
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">DEV Score</span>
                    </div>
                </div>

                {/* Label */}
                <motion.div
                    className="mt-4 flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <TrendingUp size={14} style={{ color }} />
                    <span className="text-sm font-medium" style={{ color }}>{label}</span>
                    <button
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="p-1 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                    >
                        <Info size={12} />
                    </button>
                </motion.div>

                {/* Formula Tooltip */}
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl bg-zinc-900/90 border border-white/10 text-xs max-w-[280px]"
                    >
                        <div className="flex items-center gap-2 mb-3 text-violet-400">
                            <Zap size={12} />
                            <span className="font-bold">DEV Score Formula</span>
                        </div>
                        <code className="text-[10px] text-zinc-400 block mb-3 font-mono">
                            0.35×streak + 0.30×consistency + 0.20×velocity + 0.15×quality
                        </code>
                        <div className="space-y-2">
                            <ScoreBreakdownRow label="Streak" value={breakdown.streak} weight="35%" />
                            <ScoreBreakdownRow label="Consistency" value={breakdown.consistency} weight="30%" />
                            <ScoreBreakdownRow label="Velocity" value={breakdown.velocity} weight="20%" />
                            <ScoreBreakdownRow label="Quality" value={breakdown.quality} weight="15%" />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

function ScoreBreakdownRow({ label, value, weight }: { label: string; value: number; weight: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-zinc-500">{label} <span className="text-zinc-600">({weight})</span></span>
            <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-violet-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <span className="text-white font-mono w-8 text-right">{value}%</span>
            </div>
        </div>
    )
}
