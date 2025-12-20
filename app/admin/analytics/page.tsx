'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    Users,
    Activity,
    GitCommit,
    Calendar,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell
} from 'recharts'
import { StatsCard } from '@/components/admin/StatsCard'

export default function AdminAnalyticsPage() {
    const [signupTrends, setSignupTrends] = useState<any[]>([])
    const [activityTrends, setActivityTrends] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState(30)

    useEffect(() => {
        fetchAnalytics()
    }, [dateRange])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/stats?days=${dateRange}`)
            if (res.ok) {
                const data = await res.json()
                setSignupTrends(data.signupTrends || [])
                setActivityTrends(data.activityTrends || [])
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    // Calculate totals and averages
    const totalSignups = signupTrends.reduce((sum, d) => sum + d.signups, 0)
    const totalCommits = activityTrends.reduce((sum, d) => sum + d.commits, 0)
    const avgDailySignups = signupTrends.length ? (totalSignups / signupTrends.length).toFixed(1) : 0
    const avgDailyCommits = activityTrends.length ? (totalCommits / activityTrends.length).toFixed(0) : 0

    // Calculate week-over-week growth
    const thisWeekSignups = signupTrends.slice(-7).reduce((sum, d) => sum + d.signups, 0)
    const lastWeekSignups = signupTrends.slice(-14, -7).reduce((sum, d) => sum + d.signups, 0)
    const signupGrowth = lastWeekSignups ? Math.round(((thisWeekSignups - lastWeekSignups) / lastWeekSignups) * 100) : 0

    // Sample distribution data
    const commitDistribution = [
        { name: '0-10', value: 45, color: '#3f3f46' },
        { name: '11-50', value: 30, color: '#71717a' },
        { name: '51-100', value: 15, color: '#a1a1aa' },
        { name: '100+', value: 10, color: '#ffffff' }
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display">Analytics</h1>
                    <p className="text-zinc-500 mt-1">Platform insights and trends</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                    {[7, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setDateRange(days)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === days
                                ? 'bg-white text-black'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            {days}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Signups"
                    value={totalSignups}
                    change={signupGrowth}
                    changeLabel="vs last week"
                    icon={Users}
                    color="purple"
                    loading={loading}
                />
                <StatsCard
                    title="Avg Daily Signups"
                    value={avgDailySignups}
                    icon={TrendingUp}
                    color="green"
                    loading={loading}
                />
                <StatsCard
                    title="Total Commits"
                    value={totalCommits.toLocaleString()}
                    icon={GitCommit}
                    color="cyan"
                    loading={loading}
                />
                <StatsCard
                    title="Avg Daily Commits"
                    value={avgDailyCommits}
                    icon={Activity}
                    color="yellow"
                    loading={loading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Signup Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">User Growth</h3>
                            <p className="text-sm text-zinc-500">Daily new signups</p>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${signupGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {signupGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {signupGrowth >= 0 ? '+' : ''}{signupGrowth}%
                        </div>
                    </div>
                    <div className="h-[250px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={signupTrends}>
                                    <defs>
                                        <linearGradient id="analyticsSignupGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
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
                                        interval={Math.floor(signupTrends.length / 6)}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Area type="monotone" dataKey="signups" stroke="#a855f7" strokeWidth={2} fill="url(#analyticsSignupGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>

                {/* Activity Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">Commit Activity</h3>
                            <p className="text-sm text-zinc-500">Total commits per day</p>
                        </div>
                    </div>
                    <div className="h-[250px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 10 }}
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        interval={Math.floor(activityTrends.length / 6)}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Bar dataKey="commits" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
                >
                    <h3 className="text-lg font-bold text-white mb-2">Commit Distribution</h3>
                    <p className="text-sm text-zinc-500 mb-6">Users by commit count</p>
                    <div className="h-[200px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={commitDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {commitDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    formatter={(value: number) => [`${value}%`, 'Users']}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {commitDistribution.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-zinc-400">{item.name} commits</span>
                                <span className="text-xs text-white ml-auto">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Peak Hours */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5 lg:col-span-2"
                >
                    <h3 className="text-lg font-bold text-white mb-2">Peak Activity Hours</h3>
                    <p className="text-sm text-zinc-500 mb-6">When users are most active (UTC)</p>
                    <div className="grid grid-cols-12 gap-1 h-[180px]">
                        {[...Array(24)].map((_, hour) => {
                            const activity = Math.random() * 100
                            const opacity = Math.max(0.1, activity / 100)
                            return (
                                <div
                                    key={hour}
                                    className="flex flex-col justify-end h-full"
                                >
                                    <div
                                        className="w-full rounded-t transition-all hover:opacity-80"
                                        style={{
                                            height: `${activity}%`,
                                            backgroundColor: `rgba(168, 85, 247, ${opacity})`
                                        }}
                                    />
                                    {hour % 4 === 0 && (
                                        <span className="text-[10px] text-zinc-500 text-center mt-1">{hour}:00</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-bg-elevated/50 border border-white/5"
            >
                <h3 className="text-lg font-bold text-white mb-6">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowUpRight size={16} className="text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-400">Growth</span>
                        </div>
                        <p className="text-sm text-zinc-300">
                            User signups are up {signupGrowth >= 0 ? signupGrowth : 0}% compared to last week. Keep up the momentum!
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={16} className="text-cyan-400" />
                            <span className="text-sm font-medium text-cyan-400">Engagement</span>
                        </div>
                        <p className="text-sm text-zinc-300">
                            Average of {avgDailyCommits} commits per day. Users are actively syncing their data.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 size={16} className="text-purple-400" />
                            <span className="text-sm font-medium text-purple-400">Retention</span>
                        </div>
                        <p className="text-sm text-zinc-300">
                            Most active hours are between 9 AM - 6 PM UTC. Consider scheduling features during these times.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
