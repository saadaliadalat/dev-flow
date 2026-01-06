'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Crown, Flame, Trophy, TrendingUp, Users, Target, Zap,
    Share2, ChevronUp, ChevronDown, Sparkles, Award, Star
} from 'lucide-react'
import { useSession } from 'next-auth/react'

/**
 * WORLD-CLASS GAMIFIED LEADERBOARD
 * 
 * Design: GitHub × Duolingo × Valorant Ranked
 * 
 * Features:
 * - XP Level System with progress bars
 * - Animated rank changes
 * - Threat/opportunity indicators
 * - Share rank cards (viral)
 * - Addictive micro-interactions
 * - Premium glassmorphism
 */

// ============================================
// LEVEL SYSTEM
// XP thresholds for each level
// ============================================

const LEVELS = [
    { level: 1, name: 'Rookie', minScore: 0, color: 'zinc' },
    { level: 2, name: 'Contributor', minScore: 500, color: 'zinc' },
    { level: 3, name: 'Developer', minScore: 1500, color: 'emerald' },
    { level: 4, name: 'Engineer', minScore: 3500, color: 'blue' },
    { level: 5, name: 'Senior', minScore: 7000, color: 'violet' },
    { level: 6, name: 'Staff', minScore: 12000, color: 'amber' },
    { level: 7, name: 'Principal', minScore: 20000, color: 'orange' },
    { level: 8, name: 'Distinguished', minScore: 35000, color: 'rose' },
    { level: 9, name: 'Fellow', minScore: 60000, color: 'fuchsia' },
    { level: 10, name: 'Legend', minScore: 100000, color: 'yellow' },
]

function getLevel(score: number) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEVELS[i].minScore) {
            const current = LEVELS[i]
            const next = LEVELS[i + 1]
            const progress = next
                ? ((score - current.minScore) / (next.minScore - current.minScore)) * 100
                : 100
            return { ...current, progress: Math.min(progress, 100), nextLevel: next }
        }
    }
    return { ...LEVELS[0], progress: 0, nextLevel: LEVELS[1] }
}

// ============================================
// ANIMATIONS
// ============================================

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
}

const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
        scale: [1, 1.05, 1],
        transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
    }
}

const glowVariants = {
    initial: { opacity: 0.5 },
    glow: {
        opacity: [0.5, 1, 0.5],
        transition: { duration: 2, repeat: Infinity }
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

// ============================================
// XP LEVEL BADGE
// ============================================

function LevelBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
    const level = getLevel(score)

    const colorMap: Record<string, string> = {
        zinc: 'from-zinc-500 to-zinc-600 border-zinc-400/50',
        emerald: 'from-emerald-500 to-emerald-600 border-emerald-400/50',
        blue: 'from-blue-500 to-blue-600 border-blue-400/50',
        violet: 'from-violet-500 to-violet-600 border-violet-400/50',
        amber: 'from-amber-500 to-amber-600 border-amber-400/50',
        orange: 'from-orange-500 to-orange-600 border-orange-400/50',
        rose: 'from-rose-500 to-rose-600 border-rose-400/50',
        fuchsia: 'from-fuchsia-500 to-fuchsia-600 border-fuchsia-400/50',
        yellow: 'from-yellow-400 to-yellow-500 border-yellow-300/50',
    }

    const sizeMap = {
        sm: 'w-5 h-5 text-[10px]',
        md: 'w-7 h-7 text-xs',
        lg: 'w-9 h-9 text-sm'
    }

    return (
        <div className={`${sizeMap[size]} rounded-lg bg-gradient-to-br ${colorMap[level.color]} border flex items-center justify-center font-bold text-white shadow-lg`}>
            {level.level}
        </div>
    )
}

// ============================================
// RANK BADGE (Top 3 Special)
// ============================================

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return (
            <motion.div
                variants={pulseVariants}
                initial="initial"
                animate="pulse"
                className="relative"
            >
                <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border-2 border-amber-300/50 flex items-center justify-center shadow-xl shadow-amber-500/30">
                    <Crown className="w-6 h-6 text-amber-900" />
                </div>
            </motion.div>
        )
    }

    if (rank === 2) {
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 border-2 border-zinc-200/50 flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-zinc-700">2</span>
            </div>
        )
    }

    if (rank === 3) {
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 border-2 border-orange-400/50 flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-orange-100">3</span>
            </div>
        )
    }

    return (
        <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
            <span className="text-sm font-semibold text-zinc-400 tabular-nums">{rank}</span>
        </div>
    )
}

// ============================================
// STREAK FIRE (Animated)
// ============================================

function StreakFire({ streak }: { streak: number }) {
    if (streak === 0) {
        return <span className="text-xs text-zinc-600">—</span>
    }

    const intensity = streak >= 30 ? 3 : streak >= 14 ? 2 : streak >= 7 ? 1 : 0

    return (
        <motion.div
            className="flex items-center gap-1"
            animate={{
                y: intensity > 0 ? [0, -2, 0] : 0
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
            <div className="relative">
                {intensity >= 2 && (
                    <div className="absolute inset-0 blur-md bg-orange-500/50 rounded-full" />
                )}
                <Flame className={`relative w-4 h-4 ${intensity >= 2 ? 'text-orange-400' : intensity >= 1 ? 'text-orange-500' : 'text-orange-600'
                    }`} />
            </div>
            <span className={`text-sm font-mono tabular-nums ${intensity >= 2 ? 'text-orange-300 font-bold' : 'text-zinc-400'
                }`}>
                {streak}
            </span>
        </motion.div>
    )
}

// ============================================
// XP PROGRESS BAR
// ============================================

function XPProgressBar({ score, compact = false }: { score: number; compact?: boolean }) {
    const level = getLevel(score)

    const colorMap: Record<string, string> = {
        zinc: 'from-zinc-500 to-zinc-400',
        emerald: 'from-emerald-500 to-emerald-400',
        blue: 'from-blue-500 to-blue-400',
        violet: 'from-violet-500 to-violet-400',
        amber: 'from-amber-500 to-amber-400',
        orange: 'from-orange-500 to-orange-400',
        rose: 'from-rose-500 to-rose-400',
        fuchsia: 'from-fuchsia-500 to-fuchsia-400',
        yellow: 'from-yellow-400 to-yellow-300',
    }

    if (compact) {
        return (
            <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${level.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${colorMap[level.color]}`}
                />
            </div>
        )
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Level {level.level}</span>
                {level.nextLevel && (
                    <span className="text-zinc-600">
                        {Math.round(level.progress)}% → Lv.{level.nextLevel.level}
                    </span>
                )}
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${level.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${colorMap[level.color]} relative overflow-hidden`}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
            </div>
        </div>
    )
}

// ============================================
// YOUR RANK HERO CARD
// ============================================

function YourRankCard({
    rank,
    score,
    totalUsers,
    pointsToNext,
    threatBehind
}: {
    rank: number
    score: number
    totalUsers: number
    pointsToNext: number
    threatBehind: { name: string; diff: number } | null
}) {
    const level = getLevel(score)
    // Fix: Rank 1 of 10 = Top 10%, Rank 2 of 10 = Top 20%, etc.
    const percentile = Math.max(1, Math.ceil((rank / totalUsers) * 100))

    return (
        <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/40 via-zinc-900 to-zinc-900 border border-violet-500/30 p-6"
        >
            {/* Animated glow */}
            <motion.div
                variants={glowVariants}
                initial="initial"
                animate="glow"
                className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"
            />

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rank */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 border border-violet-400/50 flex items-center justify-center shadow-2xl">
                            <span className="text-2xl font-black text-white">#{rank}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Your Rank</p>
                        <p className="text-2xl font-bold text-white">Top {percentile}%</p>
                        {rank <= 3 && (
                            <div className="flex items-center gap-1 mt-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span className="text-xs text-amber-400 font-medium">Podium Position!</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Level & XP */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <LevelBadge score={score} size="lg" />
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">Level</p>
                            <p className="text-lg font-bold text-white">{level.name}</p>
                        </div>
                    </div>
                    <XPProgressBar score={score} />
                </div>

                {/* Competitive Tension */}
                <div className="space-y-2">
                    {pointsToNext > 0 && rank > 1 && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <ChevronUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-emerald-300">
                                <span className="font-bold">{pointsToNext.toLocaleString()}</span> XP to rank up
                            </span>
                        </div>
                    )}
                    {threatBehind && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                            <ChevronDown className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-red-300">
                                <span className="font-bold">{threatBehind.name}</span> is {threatBehind.diff.toLocaleString()} XP behind
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// ============================================
// SHARE RANK BUTTON
// ============================================

function ShareButton({ rank, score, username }: { rank: number; score: number; username: string }) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const text = `🏆 I'm ranked #${rank} on DevFlow with ${score.toLocaleString()} XP!\n\nJoin me and compete: devflow.app`

        if (navigator.share) {
            try {
                await navigator.share({ title: 'My DevFlow Rank', text })
            } catch { }
        } else {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
        >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share Rank'}
        </motion.button>
    )
}

// ============================================
// LEADERBOARD ROW
// ============================================

function LeaderboardRow({
    user,
    isCurrent,
    maxScore
}: {
    user: LeaderboardUser
    isCurrent: boolean
    maxScore: number
}) {
    const level = getLevel(user.productivity_score)
    const scorePercent = (user.productivity_score / maxScore) * 100

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.02)' }}
            className={`
                relative grid grid-cols-12 gap-4 px-4 md:px-6 py-4 items-center rounded-xl transition-all
                ${isCurrent ? 'bg-violet-500/10 border border-violet-500/30' : 'border border-transparent'}
                ${user.rank <= 3 ? 'bg-gradient-to-r from-amber-500/5 to-transparent' : ''}
            `}
        >
            {/* Rank glow for top 3 */}
            {user.rank === 1 && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-16 bg-amber-500/20 rounded-full blur-2xl" />
            )}

            {/* Rank */}
            <div className="col-span-2 md:col-span-1 flex justify-center relative z-10">
                <RankBadge rank={user.rank} />
            </div>

            {/* User */}
            <div className="col-span-6 md:col-span-4 flex items-center gap-3 relative z-10">
                <div className="relative">
                    <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${isCurrent ? 'ring-violet-500' : user.rank <= 3 ? 'ring-amber-500/50' : 'ring-zinc-700'
                        }`}>
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                                {user.name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                    {/* Level badge overlay */}
                    <div className="absolute -bottom-1 -right-1">
                        <LevelBadge score={user.productivity_score} size="sm" />
                    </div>
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`font-semibold truncate ${isCurrent ? 'text-violet-300' : 'text-white'}`}>
                            {user.name || user.username}
                        </span>
                        {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/30 text-violet-300 uppercase">You</span>
                        )}
                        {user.rank === 1 && !isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/30 text-amber-300 uppercase">👑 Leader</span>
                        )}
                    </div>
                    <span className="text-xs text-zinc-500">@{user.username}</span>
                </div>
            </div>

            {/* Streak */}
            <div className="col-span-2 hidden md:flex justify-center relative z-10">
                <StreakFire streak={user.current_streak} />
            </div>

            {/* Level */}
            <div className="col-span-2 hidden lg:flex justify-center relative z-10">
                <div className="text-center">
                    <p className="text-sm font-medium text-zinc-300">{level.name}</p>
                    <XPProgressBar score={user.productivity_score} compact />
                </div>
            </div>

            {/* Score */}
            <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3 relative z-10">
                {/* Score bar */}
                <div className="hidden sm:block w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scorePercent}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`h-full rounded-full ${user.rank === 1 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                            user.rank <= 3 ? 'bg-gradient-to-r from-zinc-400 to-zinc-300' :
                                'bg-gradient-to-r from-violet-500 to-violet-400'
                            }`}
                    />
                </div>

                {/* Score badge */}
                <div className={`
                    px-3 py-1.5 rounded-lg font-mono font-bold text-sm tabular-nums
                    ${user.rank === 1 ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-300' :
                        user.rank <= 3 ? 'bg-zinc-800 border border-zinc-600/50 text-zinc-200' :
                            'bg-zinc-900 border border-zinc-800 text-zinc-400'}
                `}>
                    {user.rank === 1 && <Trophy className="inline w-3 h-3 mr-1 text-amber-400" />}
                    {user.productivity_score.toLocaleString()}
                </div>
            </div>
        </motion.div>
    )
}

// ============================================
// MAIN PAGE
// ============================================

export default function LeaderboardPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<LeaderboardUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('all')

    useEffect(() => {
        async function fetchLeaderboard() {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/leaderboard?period=${timePeriod}`)
                const data = await res.json()
                if (res.ok && data.users) {
                    setUsers(data.users)
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchLeaderboard()
    }, [timePeriod])

    const isCurrentUser = (user: LeaderboardUser) => {
        if (!session?.user) return false
        return user.username === (session.user as any)?.login || user.name === session.user?.name
    }

    const currentUserData = useMemo(() => users.find(isCurrentUser), [users, session])

    const pointsToNextRank = useMemo(() => {
        if (!currentUserData || currentUserData.rank === 1) return 0
        const nextUser = users.find(u => u.rank === currentUserData.rank - 1)
        return nextUser ? nextUser.productivity_score - currentUserData.productivity_score + 1 : 0
    }, [users, currentUserData])

    const threatBehind = useMemo(() => {
        if (!currentUserData) return null
        const behind = users.find(u => u.rank === currentUserData.rank + 1)
        if (!behind) return null
        return {
            name: behind.name || behind.username,
            diff: currentUserData.productivity_score - behind.productivity_score
        }
    }, [users, currentUserData])

    const maxScore = users[0]?.productivity_score || 0

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 pb-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/30">
                            <Trophy className="w-5 h-5 text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Leaderboard</h1>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                            LIVE
                        </span>
                    </div>
                    <p className="text-sm text-zinc-500">Compete. Level up. Dominate.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Share button */}
                    {currentUserData && (
                        <ShareButton
                            rank={currentUserData.rank}
                            score={currentUserData.productivity_score}
                            username={currentUserData.username}
                        />
                    )}

                    {/* Period selector */}
                    <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                        {(['daily', 'weekly', 'all'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimePeriod(period)}
                                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${timePeriod === period ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {timePeriod === period && (
                                    <motion.div
                                        layoutId="activePeriod"
                                        className="absolute inset-0 bg-violet-600 rounded-lg"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                                <span className="relative z-10">
                                    {period === 'daily' ? 'Today' : period === 'weekly' ? 'Week' : 'All Time'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Your Rank Hero Card */}
            {currentUserData && (
                <YourRankCard
                    rank={currentUserData.rank}
                    score={currentUserData.productivity_score}
                    totalUsers={users.length}
                    pointsToNext={pointsToNextRank}
                    threatBehind={threatBehind}
                />
            )}

            {/* Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-violet-400" />
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">Competitors</span>
                    </div>
                    <p className="text-2xl font-bold text-white tabular-nums">{users.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">Top Score</span>
                    </div>
                    <p className="text-2xl font-bold text-white tabular-nums">{maxScore.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">Leader</span>
                    </div>
                    <p className="text-lg font-bold text-white truncate">{users[0]?.name || users[0]?.username || '—'}</p>
                </div>
            </motion.div>

            {/* Leaderboard Table */}
            <motion.div variants={itemVariants} className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-4 md:px-6 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                    <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                    <div className="col-span-6 md:col-span-4">Developer</div>
                    <div className="col-span-2 hidden md:block text-center">Streak</div>
                    <div className="col-span-2 hidden lg:block text-center">Level</div>
                    <div className="col-span-4 md:col-span-3 text-right">XP Score</div>
                </div>

                {/* Rows */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 px-4 md:px-6 py-4 animate-pulse">
                                    <div className="col-span-2 md:col-span-1 flex justify-center"><div className="w-10 h-10 bg-zinc-800 rounded-full" /></div>
                                    <div className="col-span-6 md:col-span-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-full" />
                                        <div className="space-y-2"><div className="w-24 h-4 bg-zinc-800 rounded" /><div className="w-16 h-3 bg-zinc-800/50 rounded" /></div>
                                    </div>
                                    <div className="col-span-4 md:col-span-3 flex justify-end"><div className="w-20 h-8 bg-zinc-800 rounded-lg" /></div>
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-16 text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
                            <p className="text-zinc-400 font-medium">No competitors yet</p>
                            <p className="text-sm text-zinc-600 mt-1">Be the first to claim the throne!</p>
                        </div>
                    ) : (
                        <motion.div
                            key={timePeriod}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-1"
                        >
                            {users.map((user) => (
                                <LeaderboardRow
                                    key={user.id}
                                    user={user}
                                    isCurrent={isCurrentUser(user)}
                                    maxScore={maxScore}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 text-xs text-zinc-600">
                <Sparkles className="w-3 h-3" />
                <span>Rankings update in real-time from verified GitHub activity</span>
            </motion.div>
        </motion.div>
    )
}
