'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    GitCommit, GitPullRequest, Flame, Zap, Trophy, TrendingUp,
    Activity, RefreshCw, Calendar, ArrowUpRight, Brain, Target,
    Clock, CheckCircle2
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { VitalityRing } from '@/components/dashboard/VitalityRing'
import { EternalFlame } from '@/components/lore/EternalFlame'
import { useConfetti } from '@/hooks/useConfetti'
import { useSession } from 'next-auth/react'

import { PremiumStatCard, StatCardSkeleton } from '@/components/dashboard/PremiumStatCard'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { AliveCard } from '@/components/ui/AliveCard'
import { TodaysDirective } from '@/components/dashboard/TodaysDirective'
import { DailyMissionsEnhanced } from '@/components/dashboard/DailyMissionsEnhanced'
import { StreakDangerBanner } from '@/components/dashboard/StreakDangerBanner'
import { FreezeDayBanner } from '@/components/dashboard/FreezeDayBanner'
import { DevScoreRing } from '@/components/dashboard/DevScoreRing'
import { LevelBadge } from '@/components/dashboard/LevelBadge'

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
}

export default function DashboardPage() {
    const { data: session } = useSession()
    const { triggerPremiumConfetti } = useConfetti()
    const [stats, setStats] = useState<any>(null)
    const [activityData, setActivityData] = useState<any[]>([])
    const [recentCommits, setRecentCommits] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30')
    const [weekTrend, setWeekTrend] = useState(0)
    const [todayCommits, setTodayCommits] = useState(0)
    const [weekCommits, setWeekCommits] = useState(0)
    const [lastWeekCommits, setLastWeekCommits] = useState(0)
    const [thisWeekPRs, setThisWeekPRs] = useState(0)
    const [activeDaysThisWeek, setActiveDaysThisWeek] = useState(0)

    // Trigger Streak Update on Mount
    useEffect(() => {
        if (session?.user) {
            updateStreak()
        }
    }, [session])

    async function updateStreak() {
        try {
            const res = await fetch('/api/user/update-streak', { method: 'POST' })
            const data = await res.json()
            if (data.streaked) {
                triggerPremiumConfetti()
                // Refresh stats to show new streak
                setStats((prev: any) => prev ? ({ ...prev, current_streak: data.streak }) : prev)
            }
        } catch (e) {
            console.error('Streak update failed', e)
        }
    }

    // Sync function
    const syncGitHubData = async () => {
        setIsSyncing(true)
        try {
            const res = await fetch('/api/github/sync', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                setTimeout(() => window.location.reload(), 1500)
            }
        } catch (error) {
            console.error('Sync failed:', error)
        } finally {
            setIsSyncing(false)
        }
    }

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            if (!session) return
            try {
                const res = await fetch('/api/user/me?days=90')
                const data = await res.json()

                if (res.ok && data.user) {
                    setStats(data.user)

                    if (data.dailyStats?.length > 0) {
                        const days = parseInt(dateRange)
                        const startDate = new Date()
                        startDate.setDate(startDate.getDate() - days)
                        const startDateStr = startDate.toISOString().split('T')[0]

                        const filtered = data.dailyStats.filter((d: any) => d.date >= startDateStr)
                        const dataMap = new Map(filtered.map((d: any) => [d.date, d.total_commits]))

                        const chartData = []
                        for (let i = days - 1; i >= 0; i--) {
                            const date = new Date()
                            date.setDate(date.getDate() - i)
                            const dateStr = date.toISOString().split('T')[0]
                            chartData.push({
                                name: days <= 7
                                    ? date.toLocaleDateString('en-US', { weekday: 'short' })
                                    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                commits: dataMap.get(dateStr) || 0
                            })
                        }
                        setActivityData(chartData)

                        // Calculate trends
                        const today = new Date().toISOString().split('T')[0]
                        const todayData = data.dailyStats.find((d: any) => d.date === today)
                        setTodayCommits(todayData?.total_commits || 0)

                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        const thisWeekData = data.dailyStats.filter((d: any) => d.date >= weekAgo)
                        const weekTotal = thisWeekData.reduce((sum: number, d: any) => sum + (d.total_commits || 0), 0)
                        setWeekCommits(weekTotal)

                        // This week PRs
                        const weekPRs = thisWeekData.reduce((sum: number, d: any) => sum + (d.total_prs || 0), 0)
                        setThisWeekPRs(weekPRs)

                        // Active days this week
                        const activeDays = thisWeekData.filter((d: any) => (d.total_commits || 0) > 0).length
                        setActiveDaysThisWeek(activeDays)

                        // Week-over-week trend
                        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        const lastWeek = data.dailyStats
                            .filter((d: any) => d.date >= twoWeeksAgo && d.date < weekAgo)
                            .reduce((sum: number, d: any) => sum + (d.total_commits || 0), 0)
                        setLastWeekCommits(lastWeek)
                        if (lastWeek > 0) {
                            setWeekTrend(Math.round(((weekTotal - lastWeek) / lastWeek) * 100))
                        }
                    }
                }

                // Fetch activity
                const activityRes = await fetch('/api/github/activity')
                if (activityRes.ok) {
                    const activityJson = await activityRes.json()
                    setRecentCommits(activityJson.events || [])
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [session, dateRange])

    const totalContributions = (stats?.total_commits || 0) + (stats?.total_prs || 0)
    const sparklineData = activityData.map(d => d.commits)

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* STREAK DANGER BANNER - Loss Aversion Hook */}
            <StreakDangerBanner
                currentStreak={stats?.current_streak || 0}
                todayCommits={todayCommits}
            />

            {/* FREEZE DAY BANNER - Streak Insurance */}
            <FreezeDayBanner
                currentStreak={stats?.current_streak || 0}
                todayCommits={todayCommits}
            />

            {/* TODAY'S DIRECTIVE - Top Priority */}
            <motion.div variants={itemVariants}>
                <TodaysDirective className="w-full" />
            </motion.div>

            {/* Header with Sync */}
            <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-heading font-semibold text-white">Performance Overview</h2>
                    <LevelBadge />
                </div>
                <button
                    onClick={syncGitHubData}
                    disabled={isSyncing}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Sync GitHub data"
                >
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Syncing...' : 'Sync GitHub'}
                </button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <PremiumStatCard
                            label="Total Contributions"
                            value={totalContributions}
                            change={weekTrend}
                            changeLabel="vs last week"
                            icon={<Activity size={18} />}
                            accentColor="blue"
                            sparklineData={sparklineData}
                        />
                        <PremiumStatCard
                            label="Commits"
                            value={stats?.total_commits || 0}
                            icon={<GitCommit size={18} />}
                            accentColor="purple"
                        />
                        <PremiumStatCard
                            label="Pull Requests"
                            value={stats?.total_prs || 0}
                            icon={<GitPullRequest size={18} />}
                            accentColor="emerald"
                        />

                        {/* Vitality/Streak Card - Enhanced with EternalFlame */}
                        <div className="premium-card p-4 relative overflow-hidden group hover:border-[var(--accent-amber)]/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-[var(--text-secondary)] font-medium">Eternal Flame</span>
                                <Flame size={18} className="text-[var(--accent-amber)]" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-2xl font-bold text-white font-mono block">
                                        {stats?.current_streak || 0}
                                        <span className="text-sm font-sans font-normal text-[var(--text-tertiary)] ml-1">days</span>
                                    </span>
                                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                                        Max: {stats?.longest_streak || 0} days
                                    </p>
                                </div>
                                <div className="scale-50 origin-right">
                                    <EternalFlame compact />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <AliveCard className="p-6 h-full" glass>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                                    <TrendingUp size={18} className="text-violet-500" />
                                    Activity Frequency
                                </h2>
                                <p className="text-sm text-zinc-500">Your coding velocity over time</p>
                            </div>
                            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
                                {(['7', '30', '90'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setDateRange(range)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateRange === range
                                            ? 'bg-violet-500 text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        {range}d
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 11 }}
                                        width={30}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--bg-card)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                        }}
                                        labelStyle={{ color: '#a1a1aa', marginBottom: 4 }}
                                        itemStyle={{ color: 'white' }}
                                        cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="commits"
                                        stroke="#8B5CF6"
                                        strokeWidth={2}
                                        fill="url(#colorCommits)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </AliveCard>
                </motion.div>

                {/* Right Column (Score + Missions) */}
                <div className="space-y-6">
                    {/* DEV Score Ring - Real Formula */}
                    <motion.div variants={itemVariants}>
                        <AliveCard className="p-4" glass>
                            <DevScoreRing
                                streak={stats?.current_streak || 0}
                                thisWeekCommits={weekCommits}
                                lastWeekCommits={lastWeekCommits}
                                thisWeekPRs={thisWeekPRs}
                                activeDaysThisWeek={activeDaysThisWeek}
                            />
                        </AliveCard>
                    </motion.div>

                    {/* Daily Missions Enhanced */}
                    <motion.div variants={itemVariants}>
                        <AliveCard className="p-6" glass>
                            <DailyMissionsEnhanced />
                        </AliveCard>
                    </motion.div>
                </div>
            </div>

            {/* AI Insights - Wrapped */}
            <motion.div variants={itemVariants}>
                <AliveCard className="overflow-hidden" glass>
                    <InsightsPanel />
                </AliveCard>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
                <AliveCard className="p-6" glass>
                    <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        Recent Activity
                    </h2>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {recentCommits.length > 0 ? (
                            recentCommits.slice(0, 10).map((event: any, i: number) => (
                                <motion.div
                                    key={event.id || i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate group-hover:text-blue-400 transition-colors font-medium">
                                            {event.title}
                                        </p>
                                        <p className="text-xs text-zinc-500 font-mono">
                                            {new Date(event.created_at).toLocaleString([], {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-zinc-500">
                                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No recent activity</p>
                                <p className="text-xs">Push some code to see it here!</p>
                            </div>
                        )}
                    </div>
                </AliveCard>
            </motion.div>
        </motion.div>
    )
}
