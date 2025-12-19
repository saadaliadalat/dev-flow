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

// New personalized components
import { Onboarding } from '@/components/dashboard/Onboarding'
import { PersonalGoals } from '@/components/dashboard/PersonalGoals'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PersonalInsights } from '@/components/dashboard/PersonalInsights'

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

    // Function to sync GitHub data
    const syncGitHubData = async () => {
        setIsSyncing(true)
        setSyncMessage('Syncing your GitHub data...')
        try {
            const res = await fetch('/api/github/sync', { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                setSyncMessage(`Synced! ${data.stats?.total_commits || 0} commits from ${data.stats?.repos_synced || 0} repos`)
                // Force reload to get fresh data
                window.location.reload()
            } else {
                setSyncMessage(`Sync failed: ${data.error || 'Unknown error'}`)
            }
        } catch (error: any) {
            setSyncMessage(`Sync error: ${error.message}`)
        } finally {
            setIsSyncing(false)
            // Clear message after 5 seconds
            setTimeout(() => setSyncMessage(''), 5000)
        }
    }

    async function fetchDashboardData() {
        if (!session) return

        try {
            // Fetch User Data & Daily Stats from Server API
            const res = await fetch('/api/user/me')
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

                    // Daily stats fetched from API
                    const _unused = null;

                    if (dailyStats && dailyStats.length > 0) {
                        // Reverse for Chart (Past -> Today)
                        const chartStats = [...dailyStats].reverse()
                        setActivityData(chartStats.map((d: any) => ({
                            name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                            commits: d.total_commits
                        })))

                        const today = new Date().toISOString().split('T')[0]
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

                        const todayData = dailyStats.find((d: any) => d.date === today)
                        setTodayCommits(todayData?.total_commits || 0)

                        const weekTotal = dailyStats
                            .filter((d: any) => d.date >= weekAgo)
                            .reduce((sum: number, d: any) => sum + d.total_commits, 0)
                        setWeekCommits(weekTotal)
                    } else {
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
                }
            }

            // Fetch Real GitHub Activity
            const activityRes = await fetch('/api/github/activity')
            if (activityRes.ok) {
                const activityJson = await activityRes.json()
                if (activityJson.events) {
                    setRecentCommits(activityJson.events)
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

                <motion.div variants={itemVariants} className="flex gap-3 items-center">
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
                    {/* Personal Goals */}
                    <PersonalGoals
                        todayCommits={todayCommits}
                        weekCommits={weekCommits}
                        currentStreak={stats?.current_streak || 0}
                    />

                    {/* Personal Insights */}
                    <GlassCard className="p-6">
                        <PersonalInsights
                            userName={session?.user?.name?.split(' ')[0] || 'Developer'}
                            productivityScore={stats?.productivity_score || 0}
                            currentStreak={stats?.current_streak || 0}
                            totalCommits={stats?.total_commits || 0}
                        />
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

                    {/* Recent Commits List */}
                    <GlassCard className="p-6 flex-1 min-h-[300px]">
                        <h3 className="text-sm font-bold font-mono text-silver-dim uppercase tracking-wider mb-6 flex items-center gap-2">
                            <GitCommit size={14} className="text-purple-primary" /> Live Feed
                        </h3>
                        <div className="space-y-0">
                            {recentCommits.length > 0 ? (
                                recentCommits.map((event: any, i) => (
                                    <div key={i} className="flex gap-4 items-start group cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-all border border-transparent hover:border-white/5">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-primary shadow-[0_0_10px_var(--cyan-primary)] group-hover:scale-125 transition-transform" />
                                        <div>
                                            <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors leading-snug">
                                                {event.title}
                                            </p>
                                            <p className="text-xs text-text-tertiary font-mono mt-1">
                                                {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                                                <span className="opacity-70 ml-1">{event.repo}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-zinc-500 text-sm">
                                    No recent activity found.
                                    <br />
                                    Push some code to see it here!
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    )
}
