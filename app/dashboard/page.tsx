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
                        Your quantum productivity field is active. Systems are optimal.
                    </motion.p>
                </div>

                <motion.div variants={itemVariants} className="flex gap-3">
                    <span className="px-4 py-2 rounded-xl bg-bg-elevated border border-white/5 text-silver-dim text-sm font-medium flex items-center gap-2 shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="font-mono tracking-wider">ONLINE</span>
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
                <GlassCard className="p-6 relative overflow-hidden group" glow="cyan">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                        <GitCommit size={80} className="text-cyan-primary" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 rounded-xl bg-cyan-primary/10 text-cyan-primary border border-cyan-primary/20">
                            <GitCommit size={20} />
                        </div>
                        <span className="text-xs font-medium text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
                            <ArrowUpRight size={12} /> +12%
                        </span>
                    </div>
                    <div className="text-4xl font-bold font-display mb-1 text-white tracking-tight">
                        <AnimatedCounter value={stats?.total_commits || 0} />
                    </div>
                    <div className="text-sm text-text-tertiary font-mono">TOTAL COMMITS</div>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden group" glow="purple">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                        <Flame size={80} className="text-purple-primary" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 rounded-xl bg-purple-primary/10 text-purple-primary border border-purple-primary/20">
                            <Flame size={20} />
                        </div>
                        <span className="text-xs font-medium text-purple-light flex items-center gap-1 bg-purple-primary/10 px-2 py-1 rounded-lg border border-purple-primary/20">
                            <Flame size={12} /> ON FIRE
                        </span>
                    </div>
                    <div className="text-4xl font-bold font-display mb-1 text-white tracking-tight">
                        <AnimatedCounter value={stats?.current_streak || 0} suffix=" Days" />
                    </div>
                    <div className="text-sm text-text-tertiary font-mono">CURRENT STREAK</div>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden group" glow="none">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                        <Zap size={80} className="text-yellow-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs font-medium text-text-tertiary">
                            Top 5%
                        </span>
                    </div>
                    <div className="text-4xl font-bold font-display mb-1 text-white tracking-tight">
                        <AnimatedCounter value={stats?.productivity_score || 0} />
                    </div>
                    <div className="text-sm text-text-tertiary font-mono">PRODUCTIVITY SCORE</div>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden group" glow="none">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                        <Trophy size={80} className="text-silver" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 rounded-xl bg-white/5 text-silver border border-white/10">
                            <Trophy size={20} />
                        </div>
                        <span className="text-xs font-medium text-text-tertiary">
                            3 Pending
                        </span>
                    </div>
                    <div className="text-4xl font-bold font-display mb-1 text-white tracking-tight">
                        <AnimatedCounter value={12} />
                    </div>
                    <div className="text-sm text-text-tertiary font-mono">ACHIEVEMENTS</div>
                </GlassCard>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Chart */}
                <div className="lg:col-span-2">
                    <GlassCard className="h-full min-h-[450px]" glow="purple">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold font-display text-white mb-1 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-purple-primary" /> Activity Frequency
                                </h3>
                                <p className="text-sm text-text-tertiary">Your coding resonance over time.</p>
                            </div>
                            <select className="bg-bg-deep border border-white/10 rounded-xl px-4 py-2 text-sm text-text-secondary outline-none focus:border-purple-primary/50 transition-colors">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>

                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData.length ? activityData : [{ name: 'No Data', commits: 0 }]}>
                                    <defs>
                                        <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#a1a1aa', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#a1a1aa', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#fff', fontFamily: 'var(--font-mono)' }}
                                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="commits"
                                        stroke="#7c3aed"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCommits)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>

                {/* Recent Activity / Side Panel */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <GlassCard className="p-6 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-primary opacity-20" />

                        <div className="relative z-10 flex flex-col items-center text-center mt-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-primary to-cyan-primary p-[2px] mb-4 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                                <div className="w-full h-full rounded-full bg-bg-deep flex items-center justify-center overflow-hidden">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-white">{session?.user?.name?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold font-display text-white">{session?.user?.name || 'User'}</h3>
                            <div className="flex items-center gap-2 mt-2 mb-6">
                                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-mono text-silver-dim">
                                    PRO MEMBER
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end text-sm">
                                <span className="text-silver-dim font-mono text-xs uppercase tracking-wider">Level Progress</span>
                                <span className="font-bold text-white font-mono">LVL 42</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full w-[70%] bg-gradient-primary rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                            </div>
                            <div className="text-xs text-text-tertiary text-right font-mono">2,400 / 3,000 XP</div>
                        </div>
                    </GlassCard>

                    {/* Recent Commits List */}
                    <GlassCard className="p-6 flex-1 min-h-[300px]">
                        <h3 className="text-sm font-bold font-mono text-silver-dim uppercase tracking-wider mb-6 flex items-center gap-2">
                            <GitCommit size={14} className="text-purple-primary" /> Live Feed
                        </h3>
                        {/* Placeholder for now as we don't have real commits synced yet without backend job */}
                        <div className="space-y-0">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4 items-start group cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-all border border-transparent hover:border-white/5">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-primary shadow-[0_0_10px_var(--cyan-primary)] group-hover:scale-125 transition-transform" />
                                    <div>
                                        <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors leading-snug">
                                            Update system initialization sequence
                                        </p>
                                        <p className="text-xs text-text-tertiary font-mono mt-1">12m ago • main</p>
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
