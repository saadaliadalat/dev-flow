'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Share2, AlertTriangle } from 'lucide-react'

interface ScoreData {
    total_score: number
    score_change: number
    components: {
        building_ratio: number
        consistency: number
        shipping: number
        focus: number
        recovery: number
    }
    comparisons: {
        yesterday: number | null
        weekly_avg: number
        global_avg: number
        percentile: number
    }
    anti_gaming: {
        detected: boolean
        penalty: number
        reason: string | null
    }
}

interface DevFlowScoreProps {
    className?: string
    onShare?: () => void
}

export function DevFlowScore({ className = '', onShare }: DevFlowScoreProps) {
    const [scoreData, setScoreData] = useState<ScoreData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showBreakdown, setShowBreakdown] = useState(false)

    useEffect(() => {
        fetchScore()
    }, [])

    async function fetchScore() {
        try {
            const res = await fetch('/api/score')
            const data = await res.json()
            if (res.ok && data.score) {
                setScoreData(data.score)
            }
        } catch (error) {
            console.error('Failed to fetch score:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 81) return { ring: 'stroke-purple-500', text: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' }
        if (score >= 61) return { ring: 'stroke-emerald-500', text: 'text-emerald-400', gradient: 'from-emerald-500 to-cyan-500' }
        if (score >= 41) return { ring: 'stroke-amber-500', text: 'text-amber-400', gradient: 'from-amber-500 to-orange-500' }
        return { ring: 'stroke-red-500', text: 'text-red-400', gradient: 'from-red-500 to-rose-500' }
    }

    const getScoreLabel = (score: number) => {
        if (score >= 81) return 'Elite'
        if (score >= 61) return 'Strong'
        if (score >= 41) return 'Building'
        return 'Needs Work'
    }

    if (isLoading) {
        return (
            <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse ${className}`}>
                <div className="flex items-center justify-center py-8">
                    <div className="w-32 h-32 rounded-full bg-zinc-800" />
                </div>
            </div>
        )
    }

    if (!scoreData) {
        return (
            <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
                <p className="text-zinc-500 text-center">Unable to calculate score</p>
            </div>
        )
    }

    const colors = getScoreColor(scoreData.total_score)
    const circumference = 2 * Math.PI * 58
    const strokeDashoffset = circumference - (scoreData.total_score / 100) * circumference

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">
                        Dev Flow Score
                    </h3>
                    <p className={`text-sm font-semibold ${colors.text}`}>
                        {getScoreLabel(scoreData.total_score)}
                    </p>
                </div>
                <button
                    onClick={onShare}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                    <Share2 size={16} />
                </button>
            </div>

            {/* Score Ring */}
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <svg width="140" height="140" className="-rotate-90">
                        {/* Background ring */}
                        <circle
                            cx="70"
                            cy="70"
                            r="58"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-zinc-800"
                        />
                        {/* Progress ring */}
                        <motion.circle
                            cx="70"
                            cy="70"
                            r="58"
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className={colors.ring}
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                        <motion.span
                            className={`text-4xl font-bold font-mono bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {scoreData.total_score}
                        </motion.span>
                        <div className="flex items-center gap-1 mt-1">
                            {scoreData.score_change > 0 && (
                                <>
                                    <TrendingUp size={12} className="text-emerald-400" />
                                    <span className="text-xs text-emerald-400 font-mono">+{scoreData.score_change}</span>
                                </>
                            )}
                            {scoreData.score_change < 0 && (
                                <>
                                    <TrendingDown size={12} className="text-red-400" />
                                    <span className="text-xs text-red-400 font-mono">{scoreData.score_change}</span>
                                </>
                            )}
                            {scoreData.score_change === 0 && (
                                <>
                                    <Minus size={12} className="text-zinc-500" />
                                    <span className="text-xs text-zinc-500 font-mono">0</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Chips */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
                <div className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs">
                    <span className="text-zinc-500">vs Yesterday: </span>
                    <span className={`font-mono ${scoreData.comparisons.yesterday !== null
                            ? (scoreData.total_score > scoreData.comparisons.yesterday ? 'text-emerald-400' : 'text-red-400')
                            : 'text-zinc-400'
                        }`}>
                        {scoreData.comparisons.yesterday !== null
                            ? `${scoreData.total_score > scoreData.comparisons.yesterday ? '+' : ''}${scoreData.total_score - scoreData.comparisons.yesterday}`
                            : '-'
                        }
                    </span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs">
                    <span className="text-zinc-500">Week Avg: </span>
                    <span className="text-white font-mono">{scoreData.comparisons.weekly_avg}</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs">
                    <span className="text-zinc-500">Top </span>
                    <span className="text-purple-400 font-mono">{100 - scoreData.comparisons.percentile}%</span>
                </div>
            </div>

            {/* Anti-Gaming Warning */}
            {scoreData.anti_gaming.detected && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-amber-400 font-medium">Gaming Detected</p>
                        <p className="text-[10px] text-amber-500/70 mt-0.5">
                            {scoreData.anti_gaming.reason} (-{scoreData.anti_gaming.penalty} points)
                        </p>
                    </div>
                </div>
            )}

            {/* Toggle Breakdown */}
            <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full mt-4 py-2 text-xs text-zinc-500 hover:text-white transition-colors"
            >
                {showBreakdown ? 'Hide' : 'Show'} Score Breakdown
            </button>

            {/* Score Breakdown */}
            {showBreakdown && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-zinc-800 space-y-3"
                >
                    <ScoreBar label="Building vs Consuming" value={scoreData.components.building_ratio} weight={30} />
                    <ScoreBar label="Consistency" value={scoreData.components.consistency} weight={25} />
                    <ScoreBar label="Shipping Frequency" value={scoreData.components.shipping} weight={20} />
                    <ScoreBar label="Focus Depth" value={scoreData.components.focus} weight={15} />
                    <ScoreBar label="Recovery Balance" value={scoreData.components.recovery} weight={10} />
                </motion.div>
            )}
        </motion.div>
    )
}

function ScoreBar({ label, value, weight }: { label: string; value: number; weight: number }) {
    const getBarColor = (v: number) => {
        if (v >= 70) return 'bg-emerald-500'
        if (v >= 40) return 'bg-amber-500'
        return 'bg-red-500'
    }

    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">{label}</span>
                <span className="text-zinc-500 font-mono">
                    {value} <span className="text-zinc-600">({weight}%)</span>
                </span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${getBarColor(value)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    )
}
