'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    UserCheck,
    GitCommit,
    GitPullRequest,
    TrendingUp,
    Activity,
    ArrowUpRight,
    RefreshCw,
    Download,
    Calendar
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
                fetch('/api/admin/logs?limit=5')
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

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-zinc-500 mt-1 flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors">
                        <Download size={16} />
                        <span className="text-sm font-medium">Export</span>
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-xl text-white transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                        <span className="text-sm font-medium">Refresh Data</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats?.total_users || 0}
                    change={calculateChange(stats?.signups_week || 0, stats?.signups_month || 0)} // Rough estimate
                    changeLabel="vs last month"
                    icon={Users}
                    color="purple"
                    loading={loading}
                />
                <StatsCard
                    title="Active Users"
                    value={stats?.active_users || 0}
                    change={5} // Mock
                    changeLabel="vs last week"
                    icon={UserCheck}
                    color="green"
                    loading={loading}
                />
                <StatsCard
                    title="Total Commits"
                    value={stats?.total_commits || 0}
                    change={12} // Mock
                    changeLabel="vs last week"
                    icon={GitCommit}
                    color="cyan"
                    loading={loading}
                />
                <StatsCard
                    title="Pull Requests"
                    value={stats?.total_prs || 0}
                    change={-2} // Mock
                    changeLabel="vs last week"
                    icon={GitPullRequest}
                    color="yellow"
                    loading={loading}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart Section - Spans 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Growth Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-3xl bg-[#09090b]/50 border border-white/5 backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white">User Growth</h3>
                                <p className="text-sm text-zinc-500">New signups over time</p>
                            </div>
                            <div className="flex gap-2">
                                {['7d', '30d', '90d'].map((range) => (
                                    <button
                                        key={range}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${range === '30d' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
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
                                        tick={{ fill: '#52525b', fontSize: 11 }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#52525b', fontSize: 11 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="signups"
                                        stroke="#a855f7"
                                        strokeWidth={3}
                                        fill="url(#signupGradient)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Commit Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-3xl bg-[#09090b]/50 border border-white/5 backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white">Platform Activity</h3>
                                <p className="text-sm text-zinc-500">Commits volume daily</p>
                            </div>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#52525b', fontSize: 11 }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        dy={10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#a1a1aa' }}
                                    />
                                    <Bar
                                        dataKey="commits"
                                        fill="#22d3ee"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Activity Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-3xl bg-[#09090b]/50 border border-white/5 backdrop-blur-md h-full min-h-[500px]"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                            <a
                                href="/admin/logs"
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                                View all <ArrowUpRight size={12} />
                            </a>
                        </div>
                        <ActivityFeed items={recentLogs} loading={loading} />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
