'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Sparkles, ExternalLink, Loader2, RefreshCw, AlertCircle, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Constellation } from '@/components/lore/Constellation'
import { AliveCard } from '@/components/ui/AliveCard'
import { Star, getRecencyScore } from '@/lib/constellation'

// Animated counter component
function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
    const [displayValue, setDisplayValue] = useState(0)
    const prevValueRef = useRef(0)

    useEffect(() => {
        const startValue = prevValueRef.current
        const endValue = value
        const startTime = performance.now()
        const durationMs = duration * 1000

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / durationMs, 1)

            // Easing function for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = Math.round(startValue + (endValue - startValue) * eased)

            setDisplayValue(current)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                prevValueRef.current = endValue
            }
        }

        requestAnimationFrame(animate)
    }, [value, duration])

    return <>{displayValue.toLocaleString()}</>
}

export default function ConstellationPage() {
    const [stars, setStars] = useState<Star[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isRefetching, setIsRefetching] = useState(false)

    const fetchRepos = async () => {
        try {
            setError(null)

            // Try fetching from the repos API
            const res = await fetch('/api/github/repos', {
                credentials: 'include', // Ensure cookies are sent
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                console.warn('Repos API returned', res.status, errorData)

                // Handle specific error cases
                if (res.status === 401) {
                    setError('Session expired. Please sign out and sign back in to reconnect GitHub.')
                    setStars([])
                    return
                }

                if (res.status === 400 && errorData.error?.includes('token')) {
                    setError('GitHub connection lost. Please sign out and sign back in to reconnect.')
                    setStars([])
                    return
                }

                // Try the user profile endpoint to check if user has repos
                const profileRes = await fetch('/api/user/me', {
                    credentials: 'include',
                })

                if (profileRes.ok) {
                    const profile = await profileRes.json()
                    // /api/user/me returns {user, dailyStats} - check if user has repos to sync
                    if (profile?.user?.total_repos > 0) {
                        setError(`You have ${profile.user.total_repos} repositories. Try syncing your GitHub data from Settings.`)
                        setStars([])
                        return
                    }
                }

                // No repos found
                setStars([])
                return
            }

            const data = await res.json()

            // Transform to Star format - NO FAKE DATA, real commits only
            const starsData: Star[] = (data.repos || []).map((repo: any) => ({
                id: repo.id?.toString() || repo.name,
                name: repo.name,
                fullName: repo.fullName || repo.full_name,
                language: repo.language,
                commits: repo.commits || 0, // Real commit count only - no faking
                lastCommitAt: repo.pushed_at || repo.updated_at,
                url: repo.html_url || `https://github.com/${repo.full_name}`,
            }))

            setStars(starsData)
        } catch (err) {
            console.error('Constellation fetch error:', err)
            setError('Failed to connect. Check your internet connection and try again.')
            setStars([])
        } finally {
            setIsLoading(false)
            setIsRefetching(false)
        }
    }

    useEffect(() => {
        fetchRepos()
    }, [])

    const handleRefresh = () => {
        setIsRefetching(true)
        fetchRepos()
    }

    const handleStarClick = (star: Star) => {
        if (star.url && star.url !== '#') {
            window.open(star.url, '_blank')
        }
    }

    // Calculate stats using recency formula: e^{-days/30}
    // Active = recency > 0.5 (~21 days), Dim = recency < 0.1 (~69 days)
    const activeStars = stars.filter(s => getRecencyScore(s.lastCommitAt) > 0.5).length
    const totalCommits = stars.reduce((sum, s) => sum + s.commits, 0)
    const languages = new Set(stars.map(s => s.language).filter(Boolean)).size
    const dimEmbers = stars.filter(s => getRecencyScore(s.lastCommitAt) < 0.1).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-violet-500" />
                        Your Constellation
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Every repository is a star. Watch your galaxy grow.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Refresh button */}
                    <motion.button
                        onClick={handleRefresh}
                        disabled={isRefetching}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RefreshCw
                            size={16}
                            className={`text-zinc-400 ${isRefetching ? 'animate-spin' : ''}`}
                        />
                    </motion.button>

                    <div className="text-right">
                        <motion.p
                            className="text-3xl font-mono font-bold text-white"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={stars.length}
                        >
                            <AnimatedNumber value={stars.length} />
                        </motion.p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Stars</p>
                    </div>
                </div>
            </motion.div>

            {/* Main Constellation View */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <AliveCard className="h-[70vh] min-h-[500px] overflow-hidden" glass>
                    {isLoading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-10 h-10 text-violet-500" />
                            </motion.div>
                            <p className="text-sm text-zinc-500">Mapping your universe...</p>
                        </div>
                    ) : error ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                            <AlertCircle className="w-12 h-12 text-amber-500/60" />
                            <p className="text-sm text-zinc-400 text-center max-w-sm">{error}</p>
                            <div className="flex items-center gap-3">
                                {error.toLowerCase().includes('sign') ? (
                                    <motion.button
                                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                                        className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors flex items-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <LogOut size={14} />
                                        Sign Out & Reconnect
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        onClick={handleRefresh}
                                        className="px-4 py-2 rounded-lg bg-violet-500/20 text-violet-400 text-sm font-medium hover:bg-violet-500/30 transition-colors flex items-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <RefreshCw size={14} />
                                        Try Again
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    ) : stars.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                            <Sparkles className="w-12 h-12 text-zinc-600" />
                            <p className="text-sm text-zinc-500 text-center">
                                No repositories found. Start coding to birth your first star.
                            </p>
                        </div>
                    ) : (
                        <Constellation stars={stars} onStarClick={handleStarClick} />
                    )}
                </AliveCard>
            </motion.div>

            {/* Premium Stats Row with Animated Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Active Stars',
                        value: activeStars,
                        color: 'text-emerald-400',
                        bgGlow: 'bg-emerald-500/10',
                        description: 'Updated in 30 days'
                    },
                    {
                        label: 'Total Commits',
                        value: totalCommits,
                        color: 'text-violet-400',
                        bgGlow: 'bg-violet-500/10',
                        description: 'Across all repos'
                    },
                    {
                        label: 'Languages',
                        value: languages,
                        color: 'text-amber-400',
                        bgGlow: 'bg-amber-500/10',
                        description: 'You speak many'
                    },
                    {
                        label: 'Dim Embers',
                        value: dimEmbers,
                        color: 'text-zinc-400',
                        bgGlow: 'bg-zinc-500/10',
                        description: 'Awaiting revival'
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                    >
                        <AliveCard className="p-5 text-center group hover:scale-[1.02] transition-transform" glass>
                            {/* Subtle glow effect */}
                            <div className={`absolute inset-0 ${stat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl`} />

                            <motion.p
                                className={`text-3xl font-mono font-bold ${stat.color} relative z-10`}
                            >
                                <AnimatedNumber value={stat.value} duration={1 + i * 0.2} />
                            </motion.p>
                            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1 relative z-10">
                                {stat.label}
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-2 relative z-10">
                                {stat.description}
                            </p>
                        </AliveCard>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
