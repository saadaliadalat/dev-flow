'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BentoCard } from '@/components/ui/BentoCard'
import { GlassCard } from '@/components/ui/GlassCard'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { containerVariants, itemVariants } from '@/lib/animations'
import { GitCommit, Flame, Zap, Trophy, TrendingUp, Calendar, ArrowUpRight, GitPullRequest, AlertCircle, CheckCircle2, Activity } from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar
} from 'recharts'
import { useSession } from 'next-auth/react'
import { supabaseBrowser as supabase } from '@/lib/supabase-browser'

// New personalized components
import { Onboarding } from '@/components/dashboard/Onboarding'
import { PersonalGoals } from '@/components/dashboard/PersonalGoals'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PersonalInsights } from '@/components/dashboard/PersonalInsights'
import { BurnoutAlert } from '@/components/dashboard/BurnoutAlert'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'

export default function DashboardPage() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<any>(null)
    const [activityData, setActivityData] = useState<any[]>([])
    const [recentCommits, setRecentCommits] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncMessage, setSyncMessage] = useState('')
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [todayCommits, setTodayCommits] = useState(0)
    const [weekCommits, setWeekCommits] = useState(0)
    const [achievementStats, setAchievementStats] = useState({ unlocked: 0, pending: 0, total: 0 })
    const [weekTrend, setWeekTrend] = useState(0)
    const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30')
    const [allDailyStats, setAllDailyStats] = useState<any[]>([])

    // Function to sync GitHub data with progress stages
    const syncGitHubData = async () => {
        setIsSyncing(true)
        setSyncMessage('🔄 Starting sync...')
        try {
            const res = await fetch('/api/github/sync', { method: 'POST' })
            const data = await res.json()

            if (res.status === 429) {
                // Rate limited
                setSyncMessage(`⏳ ${data.message}`)
                setIsSyncing(false)
                setTimeout(() => setSyncMessage(''), 5000)
                return
            }

            if (data.success) {
                setSyncMessage(`✅ Synced! ${data.stats?.total_commits || 0} commits, ${data.stats?.total_prs || 0} PRs`)
                // Reload after 2 seconds to show updated data
                setTimeout(() => window.location.reload(), 2000)
            } else {
                setSyncMessage(`❌ ${data.error || 'Unknown error'}`)
            }
        } catch (error: any) {
            setSyncMessage(`❌ ${error.message}`)
        } finally {
            setIsSyncing(false)
            // Clear message after 5 seconds
            setTimeout(() => setSyncMessage(''), 5000)
        }
    }

    // Calculate data freshness
    const getDataFreshness = () => {
        if (!stats?.last_synced) return { text: 'Never synced', color: 'text-red-400', bgColor: 'bg-red-500/10' }
        const hoursSinceSync = Math.floor((Date.now() - new Date(stats.last_synced).getTime()) / 3600000)
        if (hoursSinceSync < 1) return { text: 'Just now', color: 'text-green-400', bgColor: 'bg-green-500/10' }
        if (hoursSinceSync < 6) return { text: `${hoursSinceSync}h ago`, color: 'text-green-400', bgColor: 'bg-green-500/10' }
        if (hoursSinceSync < 24) return { text: `${hoursSinceSync}h ago`, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' }
        const days = Math.floor(hoursSinceSync / 24)
        return { text: `${days}d ago`, color: 'text-orange-400', bgColor: 'bg-orange-500/10' }
    }

    const dataFreshness = getDataFreshness()

    // Update chart when date range changes
    useEffect(() => {
        if (allDailyStats.length > 0) {
            updateChartData(allDailyStats, dateRange)
        }
    }, [dateRange, allDailyStats])

    function updateChartData(dailyStats: any[], range: string) {
        const days = parseInt(range)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        const startDateStr = startDate.toISOString().split('T')[0]

        // Filter stats for the selected range
        const filteredStats = dailyStats.filter((d: any) => d.date >= startDateStr)

        // Create a map of existing data
        const dataMap = new Map(filteredStats.map((d: any) => [d.date, d.total_commits]))

        // Generate all dates in range with commits (0 if no data)
        const chartData: any[] = []
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            const dayName = days <= 7
                ? date.toLocaleDateString('en-US', { weekday: 'short' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

            chartData.push({
                name: dayName,
                date: dateStr,
                commits: dataMap.get(dateStr) || 0
            })
        }

        setActivityData(chartData)
    }

    async function fetchDashboardData() {
        if (!session) return

        try {
            // Fetch User Data & Daily Stats from Server API (get more days)
            const res = await fetch('/api/user/me?days=90')
            const data = await res.json()

            if (res.ok) {
                const { user, dailyStats } = data
                if (user) {
                    console.log('User data found:', user)
                    setStats(user)
                    const userId = user.id

                    // Check if user needs onboarding
                    const hasOnboarded = localStorage.getItem('devflow_onboarded')
                    if (!hasOnboarded && !user.last_synced) {
                        setShowOnboarding(true)
                    }

                    // Auto-sync if no data yet
                    if (!user.last_synced || user.total_commits === 0) {
                        syncGitHubData()
                    }

                    // Store all daily stats for filtering
                    if (dailyStats && dailyStats.length > 0) {
                        setAllDailyStats(dailyStats)
                        updateChartData(dailyStats, dateRange)

                        const today = new Date().toISOString().split('T')[0]
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

                        const todayData = dailyStats.find((d: any) => d.date === today)
                        setTodayCommits(todayData?.total_commits || 0)

                        const weekTotal = dailyStats
                            .filter((d: any) => d.date >= weekAgo)
                            .reduce((sum: number, d: any) => sum + d.total_commits, 0)
                        setWeekCommits(weekTotal)

                        // Calculate week-over-week trend
                        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        const lastWeekTotal = dailyStats
                            .filter((d: any) => d.date >= twoWeeksAgo && d.date < weekAgo)
                            .reduce((sum: number, d: any) => sum + d.total_commits, 0)

                        if (lastWeekTotal > 0) {
                            const trend = ((weekTotal - lastWeekTotal) / lastWeekTotal) * 100
                            setWeekTrend(Math.round(trend))
                        }
                    } else {
                        // No data - show empty state
                        setActivityData([])
                    }
                }
            }

            // Fetch Real GitHub Activity
            const activityRes = await fetch('/api/github/activity')
            if (activityRes.ok) {
                const activityJson = await activityRes.json()
                if (activityJson.events && activityJson.events.length > 0) {
                    setRecentCommits(activityJson.events)
                }
            }

            // Fetch Achievement Stats
            const achievementRes = await fetch('/api/achievements')
            if (achievementRes.ok) {
                const achievementData = await achievementRes.json()
                if (achievementData.stats) {
                    setAchievementStats(achievementData.stats)
                }
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [session])

    // Calculate contributions breakdown
    const totalContributions = (stats?.total_commits || 0) + (stats?.total_prs || 0) + (stats?.total_issues || 0) + (stats?.total_reviews || 0)

    return (
        <div className="container mx-auto max-w-7xl pt-8 pb-20">

            {/* Header */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-primary/10 border border-purple-primary/20 text-purple-light text-xs font-mono">
                            DASHBOARD V2.0
                        </span>
                        <span className="h-px w-20 bg-gradient-to-r from-purple-primary/50 to-transparent" />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-display font-bold mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-primary">{session?.user?.name || 'Developer'}</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-text-tertiary max-w-xl">
                        Your coding journey in {new Date().getFullYear()}. Keep the momentum going!
                    </motion.p>
                </div>

                <motion.div variants={itemVariants} className="flex gap-3 items-center flex-wrap">
                    {/* Data Freshness Indicator */}
                    <span className={`px-3 py-1.5 rounded-lg ${dataFreshness.bgColor} ${dataFreshness.color} text-xs font-mono flex items-center gap-1.5 border border-white/5`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {dataFreshness.text}
                    </span>

                    {/* Sync Message */}
                    {syncMessage && (
                        <span className="text-xs text-zinc-400 font-mono max-w-[200px] truncate">
                            {syncMessage}
                        </span>
                    )}

                    {/* Sync Button */}
                    <button
                        onClick={syncGitHubData}
                        disabled={isSyncing}
                        className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold flex items-center gap-2 shadow-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSyncing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Syncing...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                Sync GitHub
                            </>
                        )}
                    </button>

                    {/* Online Status */}
                    <span className="px-4 py-2 rounded-xl bg-bg-elevated border border-white/5 text-silver-dim text-sm font-medium flex items-center gap-2 shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="font-mono tracking-wider">ONLINE</span>
                    </span>
                </motion.div>
            </motion.div>

            {/* Onboarding Modal for New Users */}
            {showOnboarding && (
                <Onboarding
                    userName={session?.user?.name?.split(' ')[0] || 'Developer'}
                    onComplete={() => {
                        setShowOnboarding(false)
                        localStorage.setItem('devflow_onboarded', 'true')
                    }}
                />
            )}

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
            >
                <QuickActions onSync={syncGitHubData} isSyncing={isSyncing} />
            </motion.div>

            {/* Stats Grid - Enhanced with PRs and Total Contributions */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
            >
                {/* Total Contributions */}
                <GlassCard className="p-4 md:p-6 relative overflow-hidden group col-span-2" glow="cyan">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                        <Activity size={60} className="text-cyan-primary" />
                    </div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="p-2 md:p-3 rounded-xl bg-cyan-primary/10 text-cyan-primary border border-cyan-primary/20">
                            <Activity size={18} />
                        </div>
                        {weekTrend !== 0 && (
                            <span className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-lg border ${weekTrend > 0
                                ? 'text-green-400 bg-green-500/10 border-green-500/20'
                                : 'text-red-400 bg-red-500/10 border-red-500/20'
                                }`}>
                                {weekTrend > 0 ? <ArrowUpRight size={12} /> : '↓'}
                                {weekTrend > 0 ? '+' : ''}{weekTrend}%
                            </span>
                        )}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold font-display mb-1 text-white tracking-tight">
                        <AnimatedCounter value={totalContributions} />
                    </div>
                    <div className="text-xs md:text-sm text-text-tertiary font-mono">CONTRIBUTIONS {new Date().getFullYear()}</div>
                </GlassCard>

                {/* Commits */}
                <GlassCard className="p-4 md:p-6 relative overflow-hidden group" glow="none">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="p-2 rounded-xl bg-purple-primary/10 text-purple-primary border border-purple-primary/20">
                            <GitCommit size={16} />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold font-display mb-1 text-white tracking-tight">
                        <AnimatedCounter value={stats?.total_commits || 0} />
                    </div>
                    <div className="text-xs text-text-tertiary font-mono">COMMITS</div>
                </GlassCard>

                {/* PRs */}
                <GlassCard className="p-4 md:p-6 relative overflow-hidden group" glow="none">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                            <GitPullRequest size={16} />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold font-display mb-1 text-white tracking-tight">
                        <AnimatedCounter value={stats?.total_prs || 0} />
                    </div>
                    <div className="text-xs text-text-tertiary font-mono">PULL REQUESTS</div>
                </GlassCard>

                {/* Streak */}
                <GlassCard className="p-4 md:p-6 relative overflow-hidden group" glow="purple">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <Flame size={16} />
                        </div>
                        {(stats?.current_streak || 0) > 0 && (
                            <span className="text-xs font-medium text-orange-400 flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                                <Flame size={10} /> FIRE
                            </span>
                        )}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold font-display mb-1 text-white tracking-tight">
                        <AnimatedCounter value={stats?.current_streak || 0} suffix="d" />
                    </div>
                    <div className="text-xs text-text-tertiary font-mono">STREAK</div>
                </GlassCard>

                {/* Productivity Score */}
                <GlassCard className="p-4 md:p-6 relative overflow-hidden group" glow="none">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            <Zap size={16} />
                        </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold font-display mb-1 text-white tracking-tight">
                        <AnimatedCounter value={stats?.productivity_score || 0} />
                    </div>
                    <div className="text-xs text-text-tertiary font-mono">SCORE</div>
                </GlassCard>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Chart */}
                <div className="lg:col-span-2">
                    <GlassCard className="h-full min-h-[450px]" glow="purple">
                        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                            <div>
                                <h3 className="text-xl font-bold font-display text-white mb-1 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-purple-primary" /> Activity Frequency
                                </h3>
                                <p className="text-sm text-text-tertiary">Neon-visualized coding velocity</p>
                            </div>
                            <div className="flex gap-2">
                                {(['7', '30', '90'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setDateRange(range)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${dateRange === range
                                            ? 'bg-purple-primary text-white'
                                            : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {range}d
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[320px] w-full relative">
                            {/* Empty State / Ghosted Wireframe */}
                            {(!activityData.length || activityData.every(d => d.commits === 0)) && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/5">
                                    <div className="p-4 rounded-full bg-white/5 mb-4 border border-white/10 animate-pulse">
                                        <Activity size={32} className="text-zinc-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">Awaiting Data Signal</h4>
                                    <p className="text-sm text-zinc-400 text-center max-w-sm mb-6">
                                        Connect your repository sources to visualize your dev velocity in real-time.
                                    </p>
                                    <div className="absolute inset-0 pointer-events-none opacity-20">
                                        {/* Fake ghost chart rendered below in grayscale */}
                                    </div>
                                </div>
                            )}

                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={(!activityData.length || activityData.every(d => d.commits === 0)) ? Array(7).fill(0).map((_, i) => ({ name: `Day ${i}`, commits: [4, 7, 2, 9, 5, 8, 3][i] })) : activityData}>
                                    <defs>
                                        <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <filter id="neon" height="200%" width="200%" x="-50%" y="-50%">
                                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                                                        <p className="text-xs text-zinc-400 font-mono mb-1">{label}</p>
                                                        <p className="text-lg font-bold text-white flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                                                            {payload[0].value} <span className="text-xs font-normal text-zinc-500">commits</span>
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                        cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="commits"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCommits)"
                                        filter="url(#neon)"
                                        className={(!activityData.length || activityData.every(d => d.commits === 0)) ? "grayscale opacity-20 blur-sm" : ""}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Stats Summary */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{stats?.total_repos || 0}</p>
                                <p className="text-xs text-zinc-500 font-mono">REPOSITORIES</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{stats?.longest_streak || 0}</p>
                                <p className="text-xs text-zinc-500 font-mono">LONGEST STREAK</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{stats?.total_issues || 0}</p>
                                <p className="text-xs text-zinc-500 font-mono">ISSUES</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Recent Activity / Side Panel */}
                <div className="space-y-6">
                    {/* Personal Goals */}
                    <PersonalGoals
                        todayCommits={todayCommits}
                        weekCommits={weekCommits}
                        currentStreak={stats?.current_streak || 0}
                    />

                    {/* Burnout Alert */}
                    <BurnoutAlert />

                    {/* Personal Insights */}
                    <GlassCard className="p-6">
                        <PersonalInsights
                            userName={session?.user?.name?.split(' ')[0] || 'Developer'}
                            productivityScore={stats?.productivity_score || 0}
                            currentStreak={stats?.current_streak || 0}
                            totalCommits={stats?.total_commits || 0}
                        />
                    </GlassCard>

                    {/* AI Insights Panel */}
                    <GlassCard>
                        <InsightsPanel />
                    </GlassCard>

                    {/* Profile Card */}
                    <GlassCard className="p-6 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-white/10 to-transparent" />

                        <div className="relative z-10 flex flex-col items-center text-center mt-4">
                            <div className="w-20 h-20 rounded-full bg-white/10 p-[2px] mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <div className="w-full h-full rounded-full bg-bg-deep flex items-center justify-center overflow-hidden">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-white">{session?.user?.name?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white">{session?.user?.name || 'User'}</h3>
                            <p className="text-sm text-zinc-500">@{stats?.username || 'developer'}</p>

                            <div className="flex gap-4 mt-4 text-center">
                                <div>
                                    <p className="text-lg font-bold text-white">{stats?.total_repos || 0}</p>
                                    <p className="text-xs text-zinc-500">Repos</p>
                                </div>
                                <div className="w-px bg-white/10" />
                                <div>
                                    <p className="text-lg font-bold text-white">{stats?.followers || 0}</p>
                                    <p className="text-xs text-zinc-500">Followers</p>
                                </div>
                                <div className="w-px bg-white/10" />
                                <div>
                                    <p className="text-lg font-bold text-white">{stats?.following || 0}</p>
                                    <p className="text-xs text-zinc-500">Following</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Recent Commits List - Live Feed */}
                    <GlassCard className="p-6 flex-1 min-h-[300px]">
                        <h3 className="text-sm font-bold font-mono text-silver-dim uppercase tracking-wider mb-6 flex items-center gap-2">
                            <GitCommit size={14} className="text-purple-primary" /> Live Feed
                        </h3>
                        <div className="space-y-0 max-h-[400px] overflow-y-auto">
                            {recentCommits.length > 0 ? (
                                recentCommits.slice(0, 15).map((event: any, i) => (
                                    <div key={event.id || i} className="flex gap-4 items-start group cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-all border border-transparent hover:border-white/5">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-primary shadow-[0_0_10px_var(--cyan-primary)] group-hover:scale-125 transition-transform flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors leading-snug truncate">
                                                {event.title}
                                            </p>
                                            <p className="text-xs text-text-tertiary font-mono mt-1">
                                                {new Date(event.created_at).toLocaleString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-zinc-500 text-sm">
                                    <Activity className="mx-auto mb-2 opacity-50" size={24} />
                                    No recent activity found.
                                    <br />
                                    <span className="text-xs">Push some code to see it here!</span>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    )
}
