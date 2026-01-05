'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Flame, Trophy, Medal, TrendingUp, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.03, delayChildren: 0.1 }
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

type TimePeriod = 'daily' | 'weekly' | 'all'

interface LeaderboardUser {
    id: string
    name: string
    username: string
    avatar_url: string | null
    productivity_score: number
    total_commits: number
    current_streak: number
    rank: number
}

export default function LeaderboardPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<LeaderboardUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('all')
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)

    useEffect(() => {
        async function fetchLeaderboard() {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/leaderboard?period=${timePeriod}`)
                const data = await res.json()

                if (res.ok && data.users) {
                    setUsers(data.users)
                    // Find current user's rank
                    if (session?.user?.email) {
                        const currentUser = data.users.find((u: LeaderboardUser) =>
                            u.username === (session.user as any)?.login ||
                            u.name === session.user?.name
                        )
                        setCurrentUserRank(currentUser?.rank || null)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchLeaderboard()
    }, [timePeriod, session])

    const getRankDisplay = (rank: number) => {
        if (rank === 1) return <span className="text-2xl">🥇</span>
        if (rank === 2) return <span className="text-2xl">🥈</span>
        if (rank === 3) return <span className="text-2xl">🥉</span>
        return <span className="text-zinc-500 font-mono text-sm">#{rank}</span>
    }

    const isCurrentUser = (user: LeaderboardUser) => {
        if (!session?.user) return false
        return user.username === (session.user as any)?.login ||
            user.name === session.user?.name
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                            <Crown className="w-6 h-6 text-amber-400" />
                        </div>
                        Leaderboard
                    </h1>
                    <p className="text-[var(--text-tertiary)] mt-1">
                        Compete with the top 1% of developers worldwide
                    </p>
                </div>

                {/* Time Period Toggle */}
                <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--glass-border)]">
                    {(['daily', 'weekly', 'all'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimePeriod(period)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${timePeriod === period
                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'text-[var(--text-tertiary)] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : 'All Time'}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="premium-card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <Users size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Competitors</p>
                        <p className="text-xl font-bold text-white font-mono">{users.length}</p>
                    </div>
                </div>
                <div className="premium-card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Trophy size={20} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Your Rank</p>
                        <p className="text-xl font-bold text-white font-mono">
                            {currentUserRank ? `#${currentUserRank}` : '—'}
                        </p>
                    </div>
                </div>
                <div className="premium-card p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <TrendingUp size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Top Score</p>
                        <p className="text-xl font-bold text-white font-mono">
                            {users[0]?.productivity_score || '—'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Leaderboard Table */}
            <motion.div variants={itemVariants} className="premium-card overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--glass-border)] bg-[var(--bg-elevated)]">
                    <div className="col-span-1 text-center text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Rank</div>
                    <div className="col-span-5 md:col-span-4 text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Developer</div>
                    <div className="col-span-2 text-center hidden md:block text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Streak</div>
                    <div className="col-span-2 text-center hidden md:block text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Commits</div>
                    <div className="col-span-4 md:col-span-3 text-right text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Score</div>
                </div>

                {/* List */}
                <div className="divide-y divide-[var(--glass-border)]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            // Skeleton Loading
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                                    <div className="w-8 h-8 bg-white/10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-white/10 rounded w-1/3" />
                                        <div className="h-3 bg-white/5 rounded w-1/4" />
                                    </div>
                                    <div className="w-16 h-6 bg-white/10 rounded-full" />
                                </div>
                            ))
                        ) : users.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-12 text-center"
                            >
                                <Crown size={48} className="mx-auto mb-4 text-zinc-700" />
                                <p className="text-[var(--text-secondary)] font-medium">No competitors yet</p>
                                <p className="text-sm text-[var(--text-tertiary)] mt-1">Be the first to claim the throne!</p>
                            </motion.div>
                        ) : (
                            users.map((user, index) => {
                                const isCurrent = isCurrentUser(user)
                                return (
                                    <motion.div
                                        key={user.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: index * 0.02 }}
                                        className={`grid grid-cols-12 gap-4 p-4 items-center transition-all duration-200 group ${isCurrent
                                                ? 'bg-gradient-to-r from-purple-500/10 to-transparent border-l-2 border-purple-500'
                                                : 'hover:bg-white/[0.02]'
                                            } ${index < 3 ? 'bg-gradient-to-r from-amber-500/5 to-transparent' : ''}`}
                                    >
                                        {/* Rank */}
                                        <div className="col-span-1 flex justify-center">
                                            {getRankDisplay(user.rank)}
                                        </div>

                                        {/* User Info */}
                                        <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                                            <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${isCurrent ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-[var(--glass-border)] group-hover:border-purple-500/50'
                                                }`}>
                                                {user.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-sm font-bold text-white">
                                                        {user.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                {index < 3 && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-[var(--bg-card)] flex items-center justify-center">
                                                        <Medal size={10} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold truncate ${isCurrent ? 'text-purple-400' : 'text-white group-hover:text-purple-400'} transition-colors`}>
                                                        {user.name || 'Anonymous'}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-[var(--text-tertiary)] font-mono truncate block">
                                                    @{user.username || 'dev'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Streak */}
                                        <div className="col-span-2 hidden md:flex items-center justify-center gap-1.5 text-[var(--text-secondary)]">
                                            <Flame size={14} className={user.current_streak > 0 ? 'text-orange-500' : 'text-zinc-700'} />
                                            <span className="font-mono text-sm">{user.current_streak}</span>
                                        </div>

                                        {/* Commits */}
                                        <div className="col-span-2 hidden md:block text-center text-[var(--text-secondary)] font-mono text-sm">
                                            {user.total_commits?.toLocaleString() || 0}
                                        </div>

                                        {/* Score */}
                                        <div className="col-span-4 md:col-span-3 flex justify-end">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-sm ${index === 0
                                                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400'
                                                    : index < 3
                                                        ? 'bg-white/10 border border-white/10 text-white'
                                                        : 'bg-[var(--bg-elevated)] border border-[var(--glass-border)] text-[var(--text-secondary)]'
                                                }`}>
                                                {index === 0 && <Trophy size={12} className="text-amber-400" />}
                                                {user.productivity_score}
                                            </span>
                                        </div>
                                    </motion.div>
                                )
                            })
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Footer Note */}
            {users.length > 0 && (
                <motion.p variants={itemVariants} className="text-center text-xs text-[var(--text-tertiary)]">
                    Rankings update every hour based on your coding activity
                </motion.p>
            )}
        </motion.div>
    )
}
