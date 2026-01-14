'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import {
    Crown, Flame, Trophy, TrendingUp, Target, Zap,
    Share2, Swords, Rocket, ChevronUp, ChevronDown,
    LayoutGrid, List, Calendar, Bell, Search, Menu, X
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import confetti from 'canvas-confetti'
import { ChallengeButton } from '@/components/dashboard/ChallengeModal'

/**
 * 💎 ULTRA-PREMIUM LEADERBOARD V2.0 (2026 EDITION)
 * 
 * "The Dopamine Engine"
 * 
 * Features:
 * - 3D God Rays Podium
 * - Rivalry Tracking System
 * - Interactive Heatmaps
 * - Sticky User Dock
 * - Particle Effects
 */

// ============================================
// 🎨 TYPES & CONSTANTS
// ============================================

const ANIMATION_EASE = [0.16, 1, 0.3, 1] // Custom refined spring

const LEVELS = [
    { level: 1, name: 'Script Kiddie', minScore: 0, color: 'zinc' },
    { level: 2, name: 'Contributor', minScore: 500, color: 'blue' },
    { level: 3, name: 'Developer', minScore: 1500, color: 'cyan' },
    { level: 4, name: 'Engineer', minScore: 3500, color: 'emerald' },
    { level: 5, name: 'Senior', minScore: 7000, color: 'violet' },
    { level: 6, name: 'Staff', minScore: 12000, color: 'fuchsia' },
    { level: 7, name: 'Principal', minScore: 20000, color: 'rose' },
    { level: 8, name: 'Distinguished', minScore: 35000, color: 'amber' },
    { level: 9, name: 'Fellow', minScore: 60000, color: 'orange' },
    { level: 10, name: 'Legend', minScore: 100000, color: 'yellow' },
]

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
    // V2 New Fields (Mocked if missing)
    trend?: 'up' | 'down' | 'same'
    badges?: string[]
    last_active?: string
}

// ============================================
// 🛠️ UTILITIES
// ============================================

const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num)

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
// ✨ MICRO-COMPONENTS
// ============================================

function Avatar({ url, name, size = 'md', ringColor = 'zinc', glow = false }: { url: string | null, name: string, size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl', ringColor?: string, glow?: boolean }) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-base',
        xl: 'w-20 h-20 text-xl',
        '2xl': 'w-24 h-24 text-2xl',
        '3xl': 'w-32 h-32 text-3xl'
    }

    const gradients: Record<string, string> = {
        gold: 'from-amber-300 via-yellow-500 to-amber-600',
        silver: 'from-zinc-300 via-zinc-400 to-zinc-500',
        bronze: 'from-orange-300 via-orange-400 to-orange-600',
        violet: 'from-violet-500 via-purple-500 to-indigo-600',
        zinc: 'from-zinc-700 to-zinc-800'
    }

    return (
        <div className={`relative ${sizeClasses[size]}`}>
            {glow && <div className={`absolute inset-0 rounded-full blur-md opacity-50 bg-gradient-to-br ${gradients[ringColor] || gradients.zinc}`} />}
            <div className={`relative w-full h-full rounded-full p-[2px] bg-gradient-to-br ${gradients[ringColor] || gradients.zinc}`}>
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center">
                    {url ? (
                        <img src={url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-zinc-400">{name?.charAt(0) || '?'}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

function FlameIcon({ streak, size = 'sm' }: { streak: number, size?: 'sm' | 'md' | 'lg' }) {
    if (streak < 1) return null
    const isHot = streak >= 7
    const sizePx = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'

    return (
        <motion.div
            animate={isHot ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
        >
            <Flame className={`${sizePx} ${isHot ? 'text-orange-500 fill-orange-500' : 'text-zinc-500'}`} />
            {isHot && <div className="absolute inset-0 bg-orange-500/30 blur-sm rounded-full animate-pulse" />}
        </motion.div>
    )
}

function NumberTicker({ value }: { value: number }) {
    // Simplified for now, can be enhanced with spring physics later
    return <span className="tabular-nums">{formatNumber(value)}</span>
}

// ============================================
// 🏛️ SECTIONS
// ============================================

// --- 1. STICKY HEADER ---
function StickyHeader({ scrollY, period, setPeriod }: { scrollY: any, period: TimePeriod, setPeriod: (p: TimePeriod) => void }) {
    const headerBg = useTransform(scrollY, [0, 50], ['rgba(9, 9, 11, 0)', 'rgba(9, 9, 11, 0.8)'])
    const backdropBlur = useTransform(scrollY, [0, 50], ['blur(0px)', 'blur(12px)'])
    const borderOpacity = useTransform(scrollY, [0, 50], [0, 1])

    return (
        <motion.header
            style={{ backgroundColor: headerBg, backdropFilter: backdropBlur, borderColor: `rgba(39, 39, 42, ${borderOpacity.get()})` as any }}
            className="sticky top-0 z-40 w-full border-b border-transparent transition-colors duration-300"
        >
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
                        <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white hidden sm:block">DevFlow<span className="text-violet-500">Arena</span></span>
                </div>

                {/* Pill Tabs */}
                <div className="flex bg-zinc-900/50 p-1 rounded-full border border-zinc-800/50 backdrop-blur-sm">
                    {(['daily', 'weekly', 'all'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${period === p ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {period === p && (
                                <motion.div
                                    layoutId="header-tab"
                                    className="absolute inset-0 bg-zinc-800 rounded-full shadow-sm"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 capitalize">{p}</span>
                        </button>
                    ))}
                </div>

                {/* Mini User Dock */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-mono text-zinc-400">1,420 XP Today</span>
                    </div>
                    <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.header>
    )
}

// --- 2. DOPAMINE HERO (IDENTITY + RIVAL + STREAK) ---
function DopamineHero({ user, users }: { user?: LeaderboardUser, users: LeaderboardUser[] }) {
    if (!user) return null

    const level = getLevel(user.productivity_score)
    const rival = users.find(u => u.rank === user.rank - 1)
    const pointsToRival = rival ? rival.productivity_score - user.productivity_score + 1 : 0

    return (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Identity Card */}
            <div className="md:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-colors duration-700" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="relative">
                        {/* Circular Progress (SVG) */}
                        <svg className="w-24 h-24 -rotate-90">
                            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-800" />
                            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-violet-500" strokeDasharray={`${2 * Math.PI * 44}`} strokeDashoffset={`${2 * Math.PI * 44 * (1 - level.progress / 100)}`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                            <Avatar url={user.avatar_url} name={user.name} size="lg" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-white shadow-xl">
                            LVL {level.level}
                        </div>
                    </div>

                    <div>
                        <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Current Rank</div>
                        <div className="text-5xl font-black text-white tracking-tighter flex items-center gap-2">
                            #{user.rank}
                            <span className="text-base font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">Top 5%</span>
                        </div>
                        <div className="text-zinc-400 text-sm mt-2 font-medium">{level.name}</div>
                    </div>
                </div>
            </div>

            {/* Rival / Progress Card */}
            <div className="md:col-span-4 p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-center relative overflow-hidden">
                {rival ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Next Rival</div>
                            <div className="text-zinc-400 text-xs">Overtake in <span className="text-white font-mono">{formatNumber(pointsToRival)} XP</span></div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <Avatar url={rival.avatar_url} name={rival.name} size="md" ringColor="zinc" />
                            <div className="flex-1">
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500/50 w-full relative">
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]" />
                                    </div>
                                </div>
                            </div>
                            <Avatar url={user.avatar_url} name={user.name} size="md" ringColor="violet" />
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-3">
                            <Rocket className="w-4 h-4 text-violet-400" />
                            <span className="text-sm text-zinc-300">Just <b>3 commits</b> to beat {rival.name.split(' ')[0]}!</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <Crown className="w-8 h-8 text-amber-500 mb-2" />
                        <h3 className="text-white font-bold">Unstoppable!</h3>
                        <p className="text-zinc-400 text-sm">You're at the top. Defend your throne.</p>
                    </div>
                )}
            </div>

            {/* Streak & Stats */}
            <div className="md:col-span-3 p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")` }} />
                <Flame className="w-10 h-10 text-orange-500 mb-2 animate-bounce relative z-10" />
                <div className="text-4xl font-black text-white tabular-nums mb-1 relative z-10">{user.current_streak}</div>
                <div className="text-orange-200/60 text-xs font-bold uppercase tracking-widest relative z-10">Day Streak</div>
                <div className="mt-4 flex gap-1">
                    {[1, 1, 1, 1, 0, 0, 0].map((active, i) => (
                        <div key={i} className={`w-2 h-8 rounded-full ${active ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-zinc-800'}`} />
                    ))}
                </div>
            </div>
        </section>
    )
}

// --- 3. GOD RAYS PODIUM ---
function EnhancedPodium({ users }: { users: LeaderboardUser[] }) {
    const podiumUsers = [users[1], users[0], users[2]].filter(Boolean)

    return (
        <div className="relative pt-12 pb-8 min-h-[400px] flex items-end justify-center gap-4 md:gap-12 perspective-[1000px]">
            {/* God Rays Background */}
            <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-violet-900/20 to-transparent pointer-events-none" />

            {podiumUsers.map((user, i) => {
                const rank = user.rank // 1, 2, or 3
                const isFirst = rank === 1
                const height = isFirst ? 'h-64' : rank === 2 ? 'h-48' : 'h-40'
                const color = isFirst ? 'amber' : rank === 2 ? 'zinc' : 'orange'

                return (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: ANIMATION_EASE }}
                        className={`relative flex flex-col items-center group ${isFirst ? 'z-20 -mt-12 scale-110' : 'z-10'}`}
                    >
                        {/* Floating Crown for #1 */}
                        {isFirst && (
                            <motion.div
                                animate={{ y: [-10, 5, -10] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-24"
                            >
                                <Crown className="w-16 h-16 text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]" />
                            </motion.div>
                        )}

                        <div className="mb-4 relative transition-transform duration-300 group-hover:-translate-y-2">
                            <Avatar
                                url={user.avatar_url}
                                name={user.name}
                                size={isFirst ? '2xl' : 'xl'}
                                ringColor={isFirst ? 'gold' : rank === 2 ? 'silver' : 'bronze'}
                                glow={isFirst}
                            />
                            <div className={`absolute -bottom-3 inset-x-0 flex justify-center`}>
                                <div className={`px-2 py-0.5 rounded font-black text-xs uppercase tracking-widest text-white shadow-lg bg-zinc-900 border border-zinc-700`}>
                                    {formatNumber(user.productivity_score)} XP
                                </div>
                            </div>
                        </div>

                        <div className="text-center mb-2">
                            <div className={`font-bold ${isFirst ? 'text-white text-lg' : 'text-zinc-300'}`}>{user.name}</div>
                        </div>

                        {/* The Pedestal */}
                        <div className={`w-32 md:w-40 rounded-t-2xl relative overflow-hidden backdrop-blur-md border-t border-x border-white/10 ${height}
                            ${isFirst ? 'bg-gradient-to-b from-amber-500/20 to-transparent shadow-[0_-10px_40px_rgba(245,158,11,0.1)]' :
                                rank === 2 ? 'bg-gradient-to-b from-zinc-500/20 to-transparent' :
                                    'bg-gradient-to-b from-orange-500/20 to-transparent'}
                         `}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className={`text-6xl font-black absolute bottom-4 w-full text-center ${isFirst ? 'text-amber-500 opacity-80' : rank === 2 ? 'text-zinc-500 opacity-60' : 'text-orange-500 opacity-60'}`}>
                                {rank}
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

// --- 4. INFINITE LIST ROW ---
function LeaderboardRow({ user, isMe, index }: { user: LeaderboardUser, isMe: boolean, index: number }) {
    const isOdd = index % 2 !== 0

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.05, 1) }}
            className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 overflow-hidden
                ${isMe
                    ? 'bg-violet-500/5 border-violet-500/30 sticky bottom-4 z-40 shadow-2xl shadow-black/80 backdrop-blur-xl'
                    : 'bg-zinc-900/40 border-zinc-800/40 hover:bg-zinc-800/60 hover:border-zinc-700'
                }
            `}
        >
            {/* Rank Indicator */}
            <div className="w-12 text-center flex-shrink-0">
                <span className={`font-mono font-bold text-lg ${user.rank <= 3 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    #{user.rank}
                </span>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar url={user.avatar_url} name={user.name} size="md" />
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold truncate ${isMe ? 'text-violet-200' : 'text-zinc-200'}`}>{user.name}</span>
                        {isMe && <span className="bg-violet-500 text-white text-[9px] font-bold px-1.5 rounded uppercase">You</span>}
                        {user.badges?.includes('hot') && <span className="bg-orange-500/20 text-orange-400 text-[9px] px-1.5 rounded">🔥 Hot</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                        <span className="flex items-center gap-1 group-hover:text-violet-400 transition-colors">
                            <Target className="w-3 h-3" />
                            {getLevel(user.productivity_score).name}
                        </span>
                        {user.current_streak > 0 && (
                            <span className="flex items-center gap-1 group-hover:text-orange-400 transition-colors">
                                <Flame className="w-3 h-3" />
                                {user.current_streak} days
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Mini-Heatmap (Visual Only) */}
            <div className="hidden md:flex gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className={`w-1 h-6 rounded-sm ${Math.random() > 0.5 ? 'bg-emerald-500' : 'bg-zinc-800'}`} style={{ opacity: Math.random() }} />
                ))}
            </div>

            {/* Score */}
            <div className="text-right w-24 flex-shrink-0">
                <div className={`font-bold text-lg tabular-nums ${isMe ? 'text-violet-300' : 'text-zinc-300'}`}>
                    {formatNumber(user.productivity_score)}
                </div>
                <div className="text-[10px] uppercase text-zinc-600 font-bold">XP Score</div>
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        </motion.div>
    )
}

// ============================================
// 🚀 MAIN PAGE
// ============================================

export default function LeaderboardPage() {
    const { data: session } = useSession()
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll({ container: containerRef })

    // State
    const [period, setPeriod] = useState<TimePeriod>('all')
    const [users, setUsers] = useState<LeaderboardUser[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch Data
    useEffect(() => {
        async function load() {
            setIsLoading(true)
            try {
                // Determine API route (mocking for now if needed, but assuming route exists from previous steps)
                const res = await fetch(`/api/leaderboard?period=${period}`)
                const data = await res.json()
                if (res.ok) setUsers(data.users || [])
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [period])

    const currentUser = useMemo(() => {
        if (!session?.user) return undefined
        return users.find(u => u.username === (session.user as any)?.login || u.name === session.user?.name)
    }, [users, session])

    useEffect(() => {
        if (!isLoading && currentUser) {
            // Celebration if user is #1
            if (currentUser.rank === 1) {
                const duration = 3 * 1000
                const animationEnd = Date.now() + duration
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now()

                    if (timeLeft <= 0) {
                        return clearInterval(interval)
                    }

                    const particleCount = 50 * (timeLeft / duration)
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
                }, 250)
            }
        }
    }, [isLoading, currentUser])

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 font-sans selection:bg-violet-500/30">
            {/* Styles for Noise/Glow */}
            <style jsx global>{`
                .glass-panel { background: rgba(24, 24, 27, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
                .text-glow { text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
            `}</style>

            <StickyHeader scrollY={scrollY} period={period} setPeriod={setPeriod} />

            <main className="max-w-6xl mx-auto px-4 pt-24 pb-20 space-y-12">

                {/* Hero Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <DopamineHero user={currentUser} users={users} />
                </motion.div>

                {/* Podium Section */}
                <div className="py-8">
                    {users.length > 0 && <EnhancedPodium users={users} />}
                </div>

                {/* The List */}
                <div className="space-y-4 relative">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-zinc-900/50">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <List className="w-4 h-4" />
                            Global Ranking
                        </div>
                        <div className="flex items-center gap-4">
                            {currentUser && (
                                <ChallengeButton
                                    userName={currentUser.name || currentUser.username}
                                    userRank={currentUser.rank}
                                    userScore={currentUser.productivity_score}
                                />
                            )}
                            <span className="text-xs text-zinc-600">Updated Live</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <div className="py-20 flex justify-center">
                                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-2 pb-12">
                                {users.map((user, i) => (
                                    <LeaderboardRow
                                        key={user.id}
                                        user={user}
                                        index={i}
                                        isMe={user.id === currentUser?.id}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}
