'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BentoCard } from '@/components/ui/BentoCard'
import { GlassCard } from '@/components/ui/GlassCard'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { containerVariants, itemVariants } from '@/lib/animations'
import { GitCommit, Flame, Zap, Trophy, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts'
import { useSession } from 'next-auth/react'
import { supabaseBrowser as supabase } from '@/lib/supabase-browser'

export default function DashboardPage() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<any>(null)
    const [activityData, setActivityData] = useState<any[]>([])
    const [recentCommits, setRecentCommits] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchDashboardData() {
            if (!session?.user?.id) return

            try {
                // Fetch User Stats (using github_id or trying to match)
                // Note: In real app, we should use the user ID from our DB found via auth session
                // For now, let's assume session.user.id maps correctly or we query by email/github

                let userId = session.user.id

                // If the ID is not a UUID (e.g. from GitHub provider directly), we need to find our internal UUID
                // This logic depends on how NextAuth session callback is set up. 
                // Assuming session.user.id is the NextAuth ID (GitHub ID), we need to lookup.

                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', session.user.email)
                    .single()

                if (user) {
                    setStats(user)
                    userId = user.id

                    // Fetch Recent Activity (Mocking from daily_stats for chart if empty)
                    const { data: dailyStats } = await supabase
                        .from('daily_stats')
                        .select('date, total_commits')
                        .eq('user_id', userId)
                        .order('date', { ascending: true })
                        .limit(7)

                    if (dailyStats && dailyStats.length > 0) {
                        setActivityData(dailyStats.map(d => ({
                            name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                            commits: d.total_commits
                        })))
                    } else {
                        // Fallback/Placeholder if no data yet
                        setActivityData([
                            { name: 'Mon', commits: 0 },
                            { name: 'Tue', commits: 0 },
                            { name: 'Wed', commits: 0 },
                            { name: 'Thu', commits: 0 },
                            { name: 'Fri', commits: 0 },
                            { name: 'Sat', commits: 0 },
                            { name: 'Sun', commits: 0 },
                        ])
                    }

                    // Fetch Achievements
                    // ... (Implementation optional for this step, keeping placeholder)
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [session])

    return (
        <div className="container mx-auto max-w-7xl">

            {/* Header */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-bold font-display mb-1">
                        Welcome back, {session?.user?.name || 'Developer'} 👋
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-text-tertiary">
                        Here's what happened while you were away.
                    </motion.p>
                </div>

                <motion.div variants={itemVariants} className="flex gap-3">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        System Operational
                    </span>
                </motion.div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
                <GlassCard className="p-6" glow="cyan">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
                            <GitCommit size={20} />
                        </div>
                        <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                            <ArrowUpRight size={12} /> +12%
                        </span>
                    </div>
                    <div className="text-3xl font-bold font-display mb-1">
                        <AnimatedCounter value={stats?.total_commits || 0} />
                    </div>
                    <div className="text-sm text-text-tertiary">Total Commits</div>
                </GlassCard>

                <GlassCard className="p-6" glow="purple">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                            <Flame size={20} />
                        </div>
                        <span className="text-xs font-medium text-orange-400 flex items-center gap-1">
                            <Flame size={12} /> Hot
                        </span>
                    </div>
                    <div className="text-3xl font-bold font-display mb-1">
                        <AnimatedCounter value={stats?.current_streak || 0} suffix=" Days" />
                    </div>
                    <div className="text-sm text-text-tertiary">Current Streak</div>
                </GlassCard>

                <GlassCard className="p-6" glow="none">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs font-medium text-text-tertiary">
                            Top 5%
                        </span>
                    </div>
                    <div className="text-3xl font-bold font-display mb-1">
                        <AnimatedCounter value={stats?.productivity_score || 0} />
                    </div>
                    <div className="text-sm text-text-tertiary">Productivity Score</div>
                </GlassCard>

                <GlassCard className="p-6" glow="none">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
                            <Trophy size={20} />
                        </div>
                        <span className="text-xs font-medium text-text-tertiary">
                            3 Pending
                        </span>
                    </div>
                    <div className="text-3xl font-bold font-display mb-1">
                        <AnimatedCounter value={12} />
                    </div>
                    <div className="text-sm text-text-tertiary">Achievements</div>
                </GlassCard>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Chart */}
                <div className="lg:col-span-2">
                    <GlassCard className="h-full min-h-[400px]" glow="cyan">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp size={18} className="text-cyan-400" /> Activity History
                            </h3>
                            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-text-secondary outline-none focus:border-cyan-500/50">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Year</option>
                            </select>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData.length ? activityData : [{ name: 'No Data', commits: 0 }]}>
                                    <defs>
                                        <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1d29', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="commits"
                                        stroke="#06b6d4"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorCommits)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>

                {/* Recent Activity / Side Panel */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                                <div className="w-full h-full rounded-full bg-bg-deep flex items-center justify-center overflow-hidden">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-white">{session?.user?.name?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{session?.user?.name || 'User'}</h3>
                                <p className="text-sm text-text-tertiary">Pro Member</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Level</span>
                                <span className="font-bold text-white">42</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full w-[70%] bg-gradient-primary rounded-full" />
                            </div>
                            <div className="text-xs text-text-tertiary text-right">2,400 / 3,000 XP</div>
                        </div>
                    </GlassCard>

                    {/* Recent Commits List */}
                    <GlassCard className="p-6 flex-1">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <GitCommit size={18} className="text-purple-400" /> Recent Commits
                        </h3>
                        {/* Placeholder for now as we don't have real commits synced yet without backend job */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-start group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors -mx-2">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_var(--cyan-primary)]" />
                                    <div>
                                        <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                                            feat: System initialization
                                        </p>
                                        <p className="text-xs text-text-tertiary">Just now • main</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    )
}
