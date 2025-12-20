'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    UserCheck,
    UserX,
    GitCommit,
    GitPullRequest,
    TrendingUp,
    Activity,
    Zap,
    ArrowUpRight,
    RefreshCw
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts'
import { StatsCard } from '@/components/admin/StatsCard'
import { ActivityFeed } from '@/components/admin/ActivityFeed'
import { StatusBadge } from '@/components/admin/StatusBadge'

interface DashboardStats {
    total_users: number
    active_users: number
    suspended_users: number
    total_commits: number
    total_prs: number
    signups_today: number
    signups_week: number
    signups_month: number
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [signupTrends, setSignupTrends] = useState<any[]>([])
    const [activityTrends, setActivityTrends] = useState<any[]>([])
    const [recentLogs, setRecentLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchData = async () => {
        try {
            const [statsRes, logsRes] = await Promise.all([
                fetch('/api/admin/stats?days=30'),
                fetch('/api/admin/logs?limit=10')
            ])

            if (statsRes.ok) {
                const data = await statsRes.json()
                setStats(data.stats)
                setSignupTrends(data.signupTrends || [])
                setActivityTrends(data.activityTrends || [])
            }

            if (logsRes.ok) {
                const data = await logsRes.json()
                setRecentLogs(data.logs || [])
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchData()
    }

    // Calculate week-over-week change
    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display">Dashboard</h1>
                    <p className="text-zinc-500 mt-1">Overview of your DevFlow application</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Users"
                    value={stats?.total_users || 0}
                    change={calculateChange(stats?.signups_week || 0, stats?.signups_month || 0 - (stats?.signups_week || 0))}
                    changeLabel="vs last week"
                    icon={Users}
                    color="purple"
                    loading={loading}
                />
                <StatsCard
                    title="Active Users"
                    value={stats?.active_users || 0}
                    icon={UserCheck}
                    color="green"
                    loading={loading}
                />
                <StatsCard
                    title="Total Commits"
                    value={stats?.total_commits || 0}
                    icon={GitCommit}
                    color="cyan"
                    loading={loading}
                />
                <StatsCard
                    title="Pull Requests"
                    value={stats?.total_prs || 0}
                    icon={GitPullRequest}
                    color="yellow"
                    loading={loading}
                />
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500 font-mono uppercase">Today</span>
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                            <ArrowUpRight size={12} /> New
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.signups_today || 0}</p>
                    <p className="text-xs text-zinc-500">signups</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500 font-mono uppercase">This Week</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.signups_week || 0}</p>
                    <p className="text-xs text-zinc-500">signups</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500 font-mono uppercase">This Month</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.signups_month || 0}</p>
                    <p className="text-xs text-zinc-500">signups</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-4 rounded-xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500 font-mono uppercase">Suspended</span>
                        {(stats?.suspended_users || 0) > 0 && (
                            <StatusBadge status="warning" size="sm" />
                        )}
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.suspended_users || 0}</p>
                    <p className="text-xs text-zinc-500">users</p>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Signups Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">User Signups</h3>
                            <p className="text-sm text-zinc-500">Last 30 days</p>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={signupTrends}>
                                <defs>
                                    <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    interval={6}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px'
                                    }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="signups"
                                    stroke="#a855f7"
                                    strokeWidth={2}
                                    fill="url(#signupGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">Platform Activity</h3>
                            <p className="text-sm text-zinc-500">Total commits per day</p>
                        </div>
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    interval={6}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px'
                                    }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Bar
                                    dataKey="commits"
                                    fill="#22d3ee"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Recent Admin Activity</h3>
                        <p className="text-sm text-zinc-500">Latest actions by administrators</p>
                    </div>
                    <a
                        href="/admin/logs"
                        className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        View all <ArrowUpRight size={14} />
                    </a>
                </div>
                <ActivityFeed items={recentLogs} loading={loading} maxItems={5} />
            </motion.div>
        </div>
    )
}
