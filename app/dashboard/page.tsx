'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    RefreshCw, Share2, TrendingUp, TrendingDown, AlertTriangle,
    Target, Flame, Crown, ChevronRight, ExternalLink
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useConfetti } from '@/hooks/useConfetti'

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
}

// Types
interface Verdict {
    verdict_text: string
    verdict_subtext?: string
    severity: 'praise' | 'warning' | 'neutral' | 'critical'
    emoji?: string
    dev_flow_score?: number
    score_change?: number
}

interface ScoreData {
    total_score: number
    score_change: number
    comparisons: {
        percentile: number
        global_avg: number
    }
}

interface Archetype {
    archetype_name: string
    archetype: string
}

interface Blocker {
    id: string
    title: string
    consequence: string
    action: string
    severity: 'high' | 'medium' | 'low'
}

export default function DashboardPage() {
    const { data: session } = useSession()
    const { triggerPremiumConfetti } = useConfetti()

    // State
    const [verdict, setVerdict] = useState<Verdict | null>(null)
    const [scoreData, setScoreData] = useState<ScoreData | null>(null)
    const [archetype, setArchetype] = useState<Archetype | null>(null)
    const [stats, setStats] = useState<any>(null)
    const [blockers, setBlockers] = useState<Blocker[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [globalRank, setGlobalRank] = useState<number | null>(null)
    const [totalUsers, setTotalUsers] = useState<number>(0)
    const [weeklyChange, setWeeklyChange] = useState<number>(0)

    // Fetch all data on mount
    useEffect(() => {
        if (session?.user) {
            fetchAllData()
        }
    }, [session])

    async function fetchAllData() {
        setIsLoading(true)
        try {
            // Fetch in parallel
            const [verdictRes, scoreRes, archetypeRes, userRes] = await Promise.all([
                fetch('/api/verdict'),
                fetch('/api/score'),
                fetch('/api/archetype'),
                fetch('/api/user/me?days=14')
            ])

            const [verdictData, scoreDataRes, archetypeData, userData] = await Promise.all([
                verdictRes.json(),
                scoreRes.json(),
                archetypeRes.json(),
                userRes.json()
            ])

            if (verdictData.verdict) setVerdict(verdictData.verdict)
            if (scoreDataRes.score) {
                setScoreData(scoreDataRes.score)
                // Calculate global rank from percentile
                const percentile = scoreDataRes.score.comparisons?.percentile || 50
                const estimatedTotalUsers = 98201 // Mock for now, would come from API
                setTotalUsers(estimatedTotalUsers)
                setGlobalRank(Math.round(estimatedTotalUsers * (1 - percentile / 100)))
            }
            if (archetypeData.archetype) setArchetype(archetypeData.archetype)
            if (userData.user) {
                setStats(userData.user)
                // Calculate weekly rank change (mock)
                setWeeklyChange(userData.user.current_streak > 3 ? 7 : -3)
            }

            // Generate blockers from data analysis
            generateBlockers(userData.user, scoreDataRes.score)

        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    function generateBlockers(user: any, score: any) {
        const detectedBlockers: Blocker[] = []

        // Check for tutorial loop
        if (score?.components?.building_ratio < 40) {
            detectedBlockers.push({
                id: 'tutorial_loop',
                title: 'Tutorial Loop',
                consequence: 'You learned 6h and built 0h.',
                action: 'Ship something ugly today.',
                severity: 'high'
            })
        }

        // Check for inconsistency
        if (score?.components?.consistency < 50) {
            detectedBlockers.push({
                id: 'inconsistency',
                title: 'Inconsistent Patterns',
                consequence: 'You code in bursts, then disappear.',
                action: 'Commit once per day for 5 days.',
                severity: 'medium'
            })
        }

        // Check for burnout risk
        if (score?.components?.recovery < 30) {
            detectedBlockers.push({
                id: 'burnout_risk',
                title: 'Burnout Imminent',
                consequence: 'No rest days detected this week.',
                action: 'Take tomorrow off. Seriously.',
                severity: 'high'
            })
        }

        // Check for shipping problem
        if (score?.components?.shipping < 40) {
            detectedBlockers.push({
                id: 'not_shipping',
                title: 'Ideas Trapped in Branches',
                consequence: '0 PRs merged this week.',
                action: 'Merge one PR today, any size.',
                severity: 'medium'
            })
        }

        setBlockers(detectedBlockers.slice(0, 3)) // Max 3 blockers
    }

    const syncGitHubData = async () => {
        setIsSyncing(true)
        try {
            const res = await fetch('/api/github/sync', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                triggerPremiumConfetti()
                setTimeout(() => window.location.reload(), 1500)
            }
        } catch (error) {
            console.error('Sync failed:', error)
        } finally {
            setIsSyncing(false)
        }
    }

    const getVerdictStyles = (severity: string) => {
        switch (severity) {
            case 'praise':
                return {
                    bg: 'from-emerald-950 to-emerald-900/50',
                    border: 'border-emerald-500/40',
                    text: 'text-emerald-300',
                    indicator: 'bg-emerald-500'
                }
            case 'warning':
                return {
                    bg: 'from-amber-950 to-amber-900/50',
                    border: 'border-amber-500/40',
                    text: 'text-amber-300',
                    indicator: 'bg-amber-500'
                }
            case 'critical':
                return {
                    bg: 'from-red-950 to-red-900/50',
                    border: 'border-red-500/40',
                    text: 'text-red-300',
                    indicator: 'bg-red-500'
                }
            default:
                return {
                    bg: 'from-zinc-900 to-zinc-800/50',
                    border: 'border-zinc-600/40',
                    text: 'text-zinc-300',
                    indicator: 'bg-zinc-500'
                }
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-purple-400'
        if (score >= 60) return 'text-emerald-400'
        if (score >= 40) return 'text-amber-400'
        return 'text-red-400'
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm font-mono">Analyzing your patterns...</p>
                </div>
            </div>
        )
    }

    const verdictStyles = verdict ? getVerdictStyles(verdict.severity) : getVerdictStyles('neutral')

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-6"
        >
            {/* ═══════════════════════════════════════════════════════════
                ZONE 1: THE VERDICT (Dominant, Emotional Anchor)
               ═══════════════════════════════════════════════════════════ */}
            <motion.section variants={itemVariants}>
                <div className={`relative rounded-2xl border ${verdictStyles.border} bg-gradient-to-br ${verdictStyles.bg} p-8 overflow-hidden`}>
                    {/* Severity Indicator Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${verdictStyles.indicator}`} />

                    {/* Sync Button */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                            onClick={syncGitHubData}
                            disabled={isSyncing}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                        </button>
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                            <Share2 size={16} />
                        </button>
                    </div>

                    {/* Verdict Content */}
                    <div className="relative z-10">
                        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3 block">
                            Today's Verdict
                        </span>
                        <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold ${verdictStyles.text} leading-tight mb-3`}>
                            {verdict?.verdict_text || 'Loading your verdict...'}
                        </h1>
                        {verdict?.verdict_subtext && (
                            <p className="text-base text-zinc-400 max-w-2xl">
                                {verdict.verdict_subtext}
                            </p>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* ═══════════════════════════════════════════════════════════
                ZONE 2: SCORE & RANK (Ego Triggers, Screenshot-Worthy)
               ═══════════════════════════════════════════════════════════ */}
            <motion.section variants={itemVariants}>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        {/* Dev Flow Score - Large & Dominant */}
                        <div className="text-center md:text-left">
                            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
                                Dev Flow Score
                            </span>
                            <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                <span className={`text-6xl md:text-7xl font-black font-mono ${getScoreColor(scoreData?.total_score || 50)}`}>
                                    {scoreData?.total_score || 50}
                                </span>
                                {scoreData?.score_change !== undefined && scoreData.score_change !== 0 && (
                                    <span className={`text-lg font-mono flex items-center ${scoreData.score_change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {scoreData.score_change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        {scoreData.score_change > 0 ? '+' : ''}{scoreData.score_change}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Global Rank */}
                        <div className="text-center border-l border-r border-zinc-800 py-2">
                            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
                                Global Rank
                            </span>
                            <div className="flex items-center justify-center gap-2">
                                <Crown size={20} className="text-amber-400" />
                                <span className="text-3xl font-bold text-white font-mono">
                                    #{globalRank?.toLocaleString() || '—'}
                                </span>
                            </div>
                            <span className="text-xs text-zinc-500 font-mono">
                                of {totalUsers.toLocaleString()}
                            </span>
                        </div>

                        {/* Weekly Change + Archetype */}
                        <div className="text-center md:text-right">
                            <div className="flex flex-col items-center md:items-end gap-3">
                                {/* Weekly Change */}
                                <div>
                                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1 block">
                                        This Week
                                    </span>
                                    <span className={`text-2xl font-bold font-mono ${weeklyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {weeklyChange >= 0 ? '↑' : '↓'}{Math.abs(weeklyChange)} ranks
                                    </span>
                                </div>
                                {/* Archetype Badge */}
                                {archetype && (
                                    <div className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                                        <span className="text-xs font-semibold text-purple-300">
                                            {archetype.archetype_name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* ═══════════════════════════════════════════════════════════
                ZONE 3: ACTION ZONE (What's Blocking You)
               ═══════════════════════════════════════════════════════════ */}
            <motion.section variants={itemVariants}>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-400" />
                        What's Blocking You
                    </h2>

                    {blockers.length > 0 ? (
                        <div className="space-y-4">
                            {blockers.map((blocker, index) => (
                                <motion.div
                                    key={blocker.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-4 rounded-xl border ${blocker.severity === 'high'
                                            ? 'border-red-500/30 bg-red-500/5'
                                            : 'border-amber-500/30 bg-amber-500/5'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">❌</span>
                                        <div className="flex-1">
                                            <h3 className={`font-bold ${blocker.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                                                {blocker.title}
                                            </h3>
                                            <p className="text-sm text-zinc-400 mt-1">
                                                {blocker.consequence}
                                            </p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <Target size={14} className="text-emerald-400" />
                                                <span className="text-sm font-medium text-emerald-400">
                                                    Fix: {blocker.action}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <span className="text-4xl mb-2 block">✨</span>
                            <p className="text-emerald-400 font-medium">No blockers detected.</p>
                            <p className="text-zinc-500 text-sm">You're on track. Keep building.</p>
                        </div>
                    )}
                </div>
            </motion.section>

            {/* ═══════════════════════════════════════════════════════════
                ZONE 4: PROOF ZONE (Minimal Data That Matters)
               ═══════════════════════════════════════════════════════════ */}
            <motion.section variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Streak */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 text-center">
                        <Flame size={24} className={`mx-auto mb-2 ${(stats?.current_streak || 0) > 0 ? 'text-orange-400' : 'text-zinc-600'}`} />
                        <span className="text-3xl font-bold text-white font-mono block">
                            {stats?.current_streak || 0}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono uppercase">
                            Day Streak
                        </span>
                    </div>

                    {/* This Week's Output */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 text-center">
                        <TrendingUp size={24} className="mx-auto mb-2 text-purple-400" />
                        <span className="text-3xl font-bold text-white font-mono block">
                            {stats?.total_commits > 0 ? `+${Math.min(stats.total_commits, 99)}` : '0'}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono uppercase">
                            Commits This Week
                        </span>
                    </div>

                    {/* Comparison */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 text-center">
                        <Crown size={24} className="mx-auto mb-2 text-amber-400" />
                        <span className="text-3xl font-bold text-white font-mono block">
                            Top {100 - (scoreData?.comparisons?.percentile || 50)}%
                        </span>
                        <span className="text-xs text-zinc-500 font-mono uppercase">
                            Of All Developers
                        </span>
                    </div>
                </div>

                {/* View Details Link */}
                <div className="text-center mt-4">
                    <a
                        href="/dashboard/analytics"
                        className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        View detailed analytics
                        <ChevronRight size={14} />
                    </a>
                </div>
            </motion.section>
        </motion.div>
    )
}
