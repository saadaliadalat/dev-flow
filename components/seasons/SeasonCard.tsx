'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, Trophy, Users, ChevronRight,
    TrendingUp, TrendingDown, Minus, Flame, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SeasonData {
    id: string
    name: string
    slug: string
    seasonNumber: number
    startDate: string
    endDate: string
    daysRemaining: number
    themeColor: string
    badgeIcon: string
    rewards: Array<{
        rank?: number
        rank_range?: [number, number]
        title: string
        xp_bonus: number
        badge: string
    }>
    totalParticipants: number
}

interface RankingData {
    rank: number
    previous_rank: number
    rank_change: number
    commits: number
    xp_earned: number
    user: {
        id: string
        username: string
        name: string
        avatar_url: string
        level: number
        level_title: string
    }
}

interface SeasonCardProps {
    className?: string
}

export function SeasonCard({ className }: SeasonCardProps) {
    const [season, setSeason] = useState<SeasonData | null>(null)
    const [rankings, setRankings] = useState<RankingData[]>([])
    const [userRanking, setUserRanking] = useState<RankingData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isJoining, setIsJoining] = useState(false)

    useEffect(() => {
        fetchSeasonData()
    }, [])

    const fetchSeasonData = async () => {
        try {
            const res = await fetch('/api/seasons')
            if (res.ok) {
                const data = await res.json()
                setSeason(data.currentSeason)
                setRankings(data.topRankings || [])
                setUserRanking(data.userRanking)
            }
        } catch (error) {
            console.error('Failed to fetch season:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const joinSeason = async () => {
        setIsJoining(true)
        try {
            const res = await fetch('/api/seasons', { method: 'POST' })
            if (res.ok) {
                await fetchSeasonData()
            }
        } catch (error) {
            console.error('Failed to join season:', error)
        } finally {
            setIsJoining(false)
        }
    }

    if (isLoading) {
        return (
            <div className={cn("rounded-2xl bg-zinc-900/50 border border-white/10 p-6 animate-pulse", className)}>
                <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
        )
    }

    if (!season) {
        return (
            <div className={cn("rounded-2xl bg-zinc-900/50 border border-white/10 p-6 text-center", className)}>
                <Trophy size={32} className="text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500">No active season</p>
                <p className="text-xs text-zinc-600 mt-1">Check back soon!</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-2xl overflow-hidden", className)}
            style={{
                background: `linear-gradient(135deg, ${season.themeColor}10, transparent)`,
                border: `1px solid ${season.themeColor}30`
            }}
        >
            {/* Header */}
            <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{season.badgeIcon}</span>
                        <div>
                            <h3 className="font-bold text-white">{season.name}</h3>
                            <p className="text-xs text-zinc-500">Season {season.seasonNumber}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                            <Clock size={14} />
                            <span className="text-sm font-mono">{season.daysRemaining}d left</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                        <Users size={14} />
                        <span>{season.totalParticipants} participants</span>
                    </div>
                </div>
            </div>

            {/* User's Position or Join Button */}
            {userRanking ? (
                <div className="p-4 bg-white/5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                                style={{
                                    backgroundColor: `${season.themeColor}20`,
                                    color: season.themeColor
                                }}
                            >
                                #{userRanking.rank}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Your Position</p>
                                <p className="text-xs text-zinc-500">{userRanking.commits} commits this season</p>
                            </div>
                        </div>
                        <RankChange change={userRanking.rank_change} />
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-white/5 border-b border-white/5">
                    <motion.button
                        onClick={joinSeason}
                        disabled={isJoining}
                        className="w-full py-3 rounded-xl font-medium transition-all"
                        style={{
                            backgroundColor: `${season.themeColor}20`,
                            color: season.themeColor,
                            border: `1px solid ${season.themeColor}40`
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isJoining ? 'Joining...' : 'Join Season'}
                    </motion.button>
                </div>
            )}

            {/* Top Rankings */}
            <div className="p-4">
                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Leaderboard</h4>
                <div className="space-y-2">
                    {rankings.slice(0, 5).map((ranking, i) => (
                        <div
                            key={ranking.user.id}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-lg",
                                i < 3 ? "bg-white/5" : ""
                            )}
                        >
                            <div className="w-6 text-center">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (
                                    <span className="text-xs text-zinc-500">#{ranking.rank}</span>
                                )}
                            </div>
                            <img
                                src={ranking.user.avatar_url || '/default-avatar.png'}
                                alt={ranking.user.username}
                                className="w-7 h-7 rounded-full border border-white/10"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {ranking.user.name || ranking.user.username}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-mono text-zinc-300">{ranking.commits}</p>
                                <RankChange change={ranking.rank_change} small />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rewards Preview */}
            <div className="p-4 border-t border-white/5">
                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Rewards</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {season.rewards.slice(0, 4).map((reward, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-center"
                        >
                            <span className="text-lg">{reward.badge}</span>
                            <p className="text-[10px] text-zinc-500 mt-1">{reward.title}</p>
                            <p className="text-xs text-amber-400">+{reward.xp_bonus} XP</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

function RankChange({ change, small = false }: { change: number; small?: boolean }) {
    if (change === 0) {
        return <Minus size={small ? 12 : 14} className="text-zinc-500" />
    }

    if (change > 0) {
        return (
            <div className={cn("flex items-center gap-0.5 text-emerald-400", small ? "text-[10px]" : "text-xs")}>
                <TrendingUp size={small ? 12 : 14} />
                <span>+{change}</span>
            </div>
        )
    }

    return (
        <div className={cn("flex items-center gap-0.5 text-red-400", small ? "text-[10px]" : "text-xs")}>
            <TrendingDown size={small ? 12 : 14} />
            <span>{change}</span>
        </div>
    )
}
