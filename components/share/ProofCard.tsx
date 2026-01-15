'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Flame, GitCommit, GitPullRequest, Trophy, Zap, Calendar, ArrowUp } from 'lucide-react'

export type ProofCardType = 'streak' | 'weekly' | 'achievement' | 'year_review'

interface ProofCardProps {
    type: ProofCardType
    data: ProofCardData
    className?: string
}

export interface ProofCardData {
    username: string
    avatarUrl?: string
    // Streak data
    streakDays?: number
    // Weekly data
    weeklyCommits?: number
    weeklyPRs?: number
    weeklyRank?: number
    weeklyChange?: number
    // Achievement data
    achievementTitle?: string
    achievementIcon?: string
    achievementDate?: string
    // Year review data
    yearCommits?: number
    yearPRs?: number
    longestStreak?: number
    // Level data
    level?: number
    levelTitle?: string
}

export function ProofCard({ type, data, className = '' }: ProofCardProps) {
    const getCardContent = () => {
        switch (type) {
            case 'streak':
                return <StreakCard data={data} />
            case 'weekly':
                return <WeeklyCard data={data} />
            case 'achievement':
                return <AchievementCard data={data} />
            case 'year_review':
                return <YearReviewCard data={data} />
            default:
                return null
        }
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Card Container */}
            <div className="w-[600px] h-[315px] bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                </div>

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                    {getCardContent()}

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {data.avatarUrl && (
                                <img
                                    src={data.avatarUrl}
                                    alt={data.username}
                                    className="w-8 h-8 rounded-full border border-white/20"
                                />
                            )}
                            <span className="text-sm text-zinc-400">@{data.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-purple-400" />
                            <span className="text-xs text-zinc-500 font-mono">devflow.io</span>
                        </div>
                    </div>
                </div>

                {/* Border */}
                <div className="absolute inset-0 rounded-xl border border-white/10" />
            </div>
        </div>
    )
}

// Streak Milestone Card
function StreakCard({ data }: { data: ProofCardData }) {
    return (
        <>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs text-amber-400/80 uppercase tracking-wider font-medium mb-1">
                        🔥 Streak Milestone
                    </p>
                    <h2 className="text-4xl font-bold text-white">
                        {data.streakDays} Days
                    </h2>
                </div>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Flame size={48} className="text-amber-400 fill-amber-400" />
                </motion.div>
            </div>
            <p className="text-lg text-zinc-300 leading-relaxed">
                Shipped code every single day.
                <br />
                <span className="text-zinc-500">Consistency is the ultimate superpower.</span>
            </p>
            {data.level && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full">
                    <span className="text-xs text-purple-300">Level {data.level} {data.levelTitle}</span>
                </div>
            )}
        </>
    )
}

// Weekly Performance Card
function WeeklyCard({ data }: { data: ProofCardData }) {
    return (
        <>
            <div className="mb-4">
                <p className="text-xs text-violet-400/80 uppercase tracking-wider font-medium mb-1">
                    📊 This Week in Code
                </p>
                <h2 className="text-2xl font-bold text-white">Weekly Performance</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <GitCommit size={20} className="text-blue-400 mb-2" />
                    <p className="text-2xl font-bold text-white font-mono">{data.weeklyCommits || 0}</p>
                    <p className="text-xs text-zinc-500">Commits</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <GitPullRequest size={20} className="text-emerald-400 mb-2" />
                    <p className="text-2xl font-bold text-white font-mono">{data.weeklyPRs || 0}</p>
                    <p className="text-xs text-zinc-500">PRs Merged</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <Trophy size={20} className="text-amber-400 mb-2" />
                    <p className="text-2xl font-bold text-white font-mono">#{data.weeklyRank || '—'}</p>
                    <p className="text-xs text-zinc-500">Rank</p>
                    {data.weeklyChange && data.weeklyChange > 0 && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                            <ArrowUp size={10} /> {data.weeklyChange}
                        </span>
                    )}
                </div>
            </div>
        </>
    )
}

// Achievement Card
function AchievementCard({ data }: { data: ProofCardData }) {
    return (
        <>
            <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                    <div className="mb-4 text-6xl">{data.achievementIcon || '🏆'}</div>
                    <p className="text-xs text-emerald-400/80 uppercase tracking-wider font-medium mb-2">
                        Achievement Unlocked
                    </p>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {data.achievementTitle || 'Unknown Achievement'}
                    </h2>
                    {data.achievementDate && (
                        <p className="text-sm text-zinc-500 flex items-center justify-center gap-2">
                            <Calendar size={14} />
                            {data.achievementDate}
                        </p>
                    )}
                </div>
            </div>
        </>
    )
}

// Year in Review Card
function YearReviewCard({ data }: { data: ProofCardData }) {
    return (
        <>
            <div className="mb-4">
                <p className="text-xs text-purple-400/80 uppercase tracking-wider font-medium mb-1">
                    ✨ Year in Review
                </p>
                <h2 className="text-2xl font-bold text-white">2025 Wrapped</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="text-center">
                    <p className="text-3xl font-bold text-white font-mono">{data.yearCommits?.toLocaleString() || 0}</p>
                    <p className="text-xs text-zinc-500">Commits</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-white font-mono">{data.yearPRs || 0}</p>
                    <p className="text-xs text-zinc-500">PRs Merged</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-amber-400 font-mono">{data.longestStreak || 0}</p>
                    <p className="text-xs text-zinc-500">Longest Streak</p>
                </div>
            </div>
            <p className="text-sm text-zinc-400 text-center">
                Another year of shipping. Keep building. 🚀
            </p>
        </>
    )
}

// Export card dimensions for OG image generation
export const PROOF_CARD_DIMENSIONS = {
    width: 1200,
    height: 630,
    scale: 2, // For high DPI
}
