'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain, RefreshCw, Zap, Target, BookOpen, Coffee,
    TrendingUp, AlertTriangle, Lightbulb, Sparkles
} from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'

interface CoachInsight {
    category: 'quality' | 'productivity' | 'learning' | 'habit'
    title: string
    observation: string
    suggestion: string
    impact: 'high' | 'medium' | 'low'
}

interface CoachData {
    insights: CoachInsight[]
    stats: {
        recentCommits: number
        recentPRs: number
        avgCommitsPerPush: number
        lateNightCommits: number
        activeRepos: number
    }
}

const CATEGORY_ICONS = {
    quality: Zap,
    productivity: Target,
    learning: BookOpen,
    habit: Coffee,
}

const CATEGORY_COLORS = {
    quality: { bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
    productivity: { bg: 'from-emerald-500/20 to-cyan-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    learning: { bg: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    habit: { bg: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
}

const IMPACT_BADGES = {
    high: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'High Impact' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Medium' },
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Quick Win' },
}

export default function AICoachPage() {
    const [data, setData] = useState<CoachData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCoach = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/coach')
            if (!res.ok) throw new Error('Failed to fetch insights')
            const json = await res.json()
            setData(json)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCoach()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                        <Brain className="text-violet-400" />
                        AI Coach
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Personalized insights from your recent activity
                    </p>
                </div>
                <button
                    onClick={fetchCoach}
                    disabled={isLoading}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Overview */}
            {data && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                    <StatBadge label="Recent Commits" value={data.stats.recentCommits} icon={<Zap size={14} />} />
                    <StatBadge label="Recent PRs" value={data.stats.recentPRs} icon={<TrendingUp size={14} />} />
                    <StatBadge label="Avg per Push" value={data.stats.avgCommitsPerPush} icon={<Target size={14} />} />
                    <StatBadge
                        label="Late Night"
                        value={data.stats.lateNightCommits}
                        icon={<AlertTriangle size={14} />}
                        warning={data.stats.lateNightCommits > 3}
                    />
                    <StatBadge label="Active Repos" value={data.stats.activeRepos} icon={<Sparkles size={14} />} />
                </motion.div>
            )}

            {/* Loading */}
            {isLoading && !data && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                            <Brain size={32} className="text-violet-400" />
                        </motion.div>
                        <p className="text-zinc-500 text-sm">Analyzing your patterns...</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <AliveCard className="p-6 text-center" glass>
                    <p className="text-red-400 mb-2">{error}</p>
                    <button onClick={fetchCoach} className="btn-secondary">
                        Try Again
                    </button>
                </AliveCard>
            )}

            {/* Insights */}
            {data && (
                <div className="space-y-4">
                    <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                        <Lightbulb size={18} className="text-amber-400" />
                        Your Insights
                    </h2>

                    <div className="grid gap-4">
                        {data.insights.map((insight, i) => (
                            <InsightCard key={i} insight={insight} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* Pro Feature Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20 text-center"
            >
                <h3 className="font-heading font-semibold text-white mb-2">
                    🚀 Unlock Full AI Coach (PRO)
                </h3>
                <p className="text-sm text-zinc-400 mb-4 max-w-md mx-auto">
                    Get code review suggestions, refactoring tips, and personalized learning paths based on your commit history.
                </p>
                <button className="btn-primary">
                    Upgrade to PRO
                </button>
            </motion.div>
        </motion.div>
    )
}

function StatBadge({
    label,
    value,
    icon,
    warning = false
}: {
    label: string
    value: number
    icon: React.ReactNode
    warning?: boolean
}) {
    return (
        <div className={`p-3 rounded-xl border ${warning ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className={warning ? 'text-amber-400' : 'text-zinc-500'}>{icon}</span>
                <span className="text-xs text-zinc-500">{label}</span>
            </div>
            <span className={`text-lg font-bold font-mono ${warning ? 'text-amber-400' : 'text-white'}`}>
                {value}
            </span>
        </div>
    )
}

function InsightCard({ insight, index }: { insight: CoachInsight; index: number }) {
    const Icon = CATEGORY_ICONS[insight.category] || Zap
    const colors = CATEGORY_COLORS[insight.category] || CATEGORY_COLORS.quality
    const impact = IMPACT_BADGES[insight.impact] || IMPACT_BADGES.medium

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
        >
            <AliveCard className={`p-5 bg-gradient-to-br ${colors.bg} border ${colors.border}`} glass>
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${colors.text}`}>
                        <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">{insight.title}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${impact.bg} ${impact.text}`}>
                                {impact.label}
                            </span>
                        </div>

                        <p className="text-sm text-zinc-400 mb-2">
                            {insight.observation}
                        </p>

                        <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                            <Lightbulb size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-zinc-300">
                                {insight.suggestion}
                            </p>
                        </div>
                    </div>
                </div>
            </AliveCard>
        </motion.div>
    )
}
