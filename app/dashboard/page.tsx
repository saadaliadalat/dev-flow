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
import { useSession } from 'next-auth/react'

// Premium Components
import { PremiumStatCard, StatCardSkeleton } from '@/components/dashboard/PremiumStatCard'
import { InsightCard, InsightCardSkeleton } from '@/components/dashboard/InsightCard'
import { GoalProgress, CircularProgress, GoalProgressSkeleton } from '@/components/dashboard/GoalProgress'

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
    const [stats, setStats] = useState<any>(null)
    const [activityData, setActivityData] = useState<any[]>([])
    const [recentCommits, setRecentCommits] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30')
    const [weekTrend, setWeekTrend] = useState(0)
    const [todayCommits, setTodayCommits] = useState(0)
    const [weekCommits, setWeekCommits] = useState(0)

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
                        const weekTotal = data.dailyStats
                            .filter((d: any) => d.date >= weekAgo)
                            .reduce((sum: number, d: any) => sum + d.total_commits, 0)
                        setWeekCommits(weekTotal)

                        // Week-over-week trend
                        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        const lastWeek = data.dailyStats
                            .filter((d: any) => d.date >= twoWeeksAgo && d.date < weekAgo)
                            .reduce((sum: number, d: any) => sum + d.total_commits, 0)
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
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 text-[var(--accent-blue)] text-xs font-medium">
                            Dashboard
                        </span>
                        {stats?.last_synced && (
                            <span className="px-2.5 py-1 rounded-full bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] text-xs font-mono">
                                Synced {new Date(stats.last_synced).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Welcome back, <span className="text-gradient-blue">{session?.user?.name?.split(' ')[0] || 'Developer'}</span>
                    </h1>
                    <p className="text-[var(--text-tertiary)] mt-1">
                        Here's your coding activity for {new Date().getFullYear()}
                    </p>
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
                        <PremiumStatCard
                            label="Current Streak"
                            value={stats?.current_streak || 0}
                            suffix=" days"
                            icon={<Flame size={18} />}
                            accentColor="amber"
                        />
                    </>
                )}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2 premium-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-[var(--accent-purple)]" />
                                Activity Frequency
                            </h2>
                            <p className="text-sm text-[var(--text-tertiary)]">Your coding velocity over time</p>
                        </div>
                        <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-elevated)]">
                            {(['7', '30', '90'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${dateRange === range
                                            ? 'bg-[var(--accent-blue)] text-white'
                                            : 'text-[var(--text-tertiary)] hover:text-white'
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
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-lg)',
                                    }}
                                    labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
                                    itemStyle={{ color: 'white' }}
                                    cursor={{ stroke: 'var(--accent-purple)', strokeWidth: 1, strokeDasharray: '4 4' }}
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
                </motion.div>

                {/* Goals & Progress */}
                <motion.div variants={itemVariants} className="premium-card p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Target size={18} className="text-[var(--accent-emerald)]" />
                            Daily Goals
                        </h2>
                    </div>

                    <div className="flex justify-center gap-4">
                        <CircularProgress percentage={Math.min((todayCommits / 5) * 100, 100)} color="blue" label="Today" />
                        <CircularProgress percentage={Math.min((weekCommits / 30) * 100, 100)} color="emerald" label="Week" />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[var(--glass-border)]">
                        <GoalProgress label="Daily Commits" current={todayCommits} target={5} color="blue" />
                        <GoalProgress label="Weekly Commits" current={weekCommits} target={30} color="emerald" />
                        <GoalProgress label="Streak Days" current={stats?.current_streak || 0} target={14} color="amber" />
                    </div>
                </motion.div>
            </div>

            {/* AI Insights */}
            <motion.div variants={itemVariants}>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Brain size={18} className="text-[var(--accent-purple)]" />
                    AI Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InsightCard
                        type="success"
                        title="Great momentum!"
                        description="You've maintained a consistent commit pattern this week. Keep it up!"
                        details={[
                            `${weekCommits} commits this week`,
                            `${stats?.current_streak || 0} day streak`,
                            'Above your weekly average'
                        ]}
                    />
                    <InsightCard
                        type="tip"
                        title="Optimize your flow"
                        description="Consider batching smaller commits for cleaner git history."
                        actionLabel="View best practices"
                        onAction={() => { }}
                    />
                    <InsightCard
                        type="warning"
                        title="Review pending PRs"
                        description="You have pull requests that need attention."
                        actionLabel="View PRs"
                        onAction={() => { }}
                    />
                </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants} className="premium-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-[var(--accent-blue)]" />
                    Recent Activity
                </h2>
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {recentCommits.length > 0 ? (
                        recentCommits.slice(0, 10).map((event: any, i: number) => (
                            <motion.div
                                key={event.id || i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer group"
                            >
                                <div className="w-2 h-2 rounded-full bg-[var(--accent-blue)] group-hover:scale-125 transition-transform" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate group-hover:text-[var(--accent-blue)] transition-colors">
                                        {event.title}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)] font-mono">
                                        {new Date(event.created_at).toLocaleString([], {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <ArrowUpRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent-blue)] transition-colors" />
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-[var(--text-tertiary)]">
                            <Activity size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No recent activity</p>
                            <p className="text-xs">Push some code to see it here!</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}
