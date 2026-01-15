'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Swords, Clock, Trophy, User, Check, X,
    Share2, Loader2, Flame, ChevronRight, Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Challenge {
    id: string
    challenger_id: string
    challenged_id: string | null
    challenge_type: 'commits' | 'streak' | 'prs'
    duration_days: number
    start_date: string
    end_date: string
    status: 'pending' | 'active' | 'completed' | 'expired' | 'declined'
    challenger_score: number
    challenged_score: number
    winner_id: string | null
    tie: boolean
    invite_code: string
    challenger?: {
        id: string
        username: string
        avatar_url: string
        level: number
        level_title: string
    }
    challenged?: {
        id: string
        username: string
        avatar_url: string
        level: number
        level_title: string
    }
}

interface ChallengeCardProps {
    challenge: Challenge
    currentUserId: string
    onAccept?: (id: string) => void
    onDecline?: (id: string) => void
    onShare?: (inviteCode: string) => void
    className?: string
}

export function ChallengeCard({
    challenge,
    currentUserId,
    onAccept,
    onDecline,
    onShare,
    className
}: ChallengeCardProps) {
    const [isLoading, setIsLoading] = useState(false)

    const isChallenger = challenge.challenger_id === currentUserId
    const isPending = challenge.status === 'pending'
    const isActive = challenge.status === 'active'
    const isCompleted = challenge.status === 'completed'

    // Determine opponent
    const opponent = isChallenger ? challenge.challenged : challenge.challenger
    const myScore = isChallenger ? challenge.challenger_score : challenge.challenged_score
    const opponentScore = isChallenger ? challenge.challenged_score : challenge.challenger_score
    const isWinning = myScore > opponentScore
    const isTied = myScore === opponentScore

    // Calculate days remaining
    const endDate = new Date(challenge.end_date)
    const now = new Date()
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    // Handle actions
    const handleAccept = async () => {
        if (!onAccept) return
        setIsLoading(true)
        await onAccept(challenge.id)
        setIsLoading(false)
    }

    const handleDecline = async () => {
        if (!onDecline) return
        setIsLoading(true)
        await onDecline(challenge.id)
        setIsLoading(false)
    }

    const getStatusBadge = () => {
        switch (challenge.status) {
            case 'pending':
                return (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Pending
                    </span>
                )
            case 'active':
                return (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active
                    </span>
                )
            case 'completed':
                return (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Completed
                    </span>
                )
            case 'declined':
                return (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        Declined
                    </span>
                )
            default:
                return null
        }
    }

    const getChallengeTypeLabel = () => {
        switch (challenge.challenge_type) {
            case 'commits': return 'Most Commits'
            case 'streak': return 'Longest Streak'
            case 'prs': return 'Most PRs'
            default: return 'Challenge'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-white/10 p-5",
                isActive && "border-purple-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]",
                className
            )}
        >
            {/* Background Gradient for Active */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-amber-500/5" />
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Swords size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{getChallengeTypeLabel()}</h3>
                            <p className="text-xs text-zinc-500">{challenge.duration_days} days</p>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>

                {/* VS Display */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    {/* You */}
                    <div className="flex-1 text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-2 text-white font-bold">
                            YOU
                        </div>
                        {isActive && (
                            <p className={cn(
                                "text-2xl font-bold font-mono",
                                isWinning ? "text-emerald-400" : isTied ? "text-zinc-400" : "text-red-400"
                            )}>
                                {myScore}
                            </p>
                        )}
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">vs</span>
                        {isActive && (
                            <div className="flex items-center gap-1 mt-1">
                                <Clock size={12} className="text-zinc-500" />
                                <span className="text-xs text-zinc-500">{daysRemaining}d left</span>
                            </div>
                        )}
                    </div>

                    {/* Opponent */}
                    <div className="flex-1 text-center">
                        {opponent ? (
                            <>
                                <img
                                    src={opponent.avatar_url || '/default-avatar.png'}
                                    alt={opponent.username}
                                    className="w-12 h-12 rounded-full border-2 border-white/10 mx-auto mb-2"
                                />
                                {isActive && (
                                    <p className={cn(
                                        "text-2xl font-bold font-mono",
                                        !isWinning && !isTied ? "text-emerald-400" : isTied ? "text-zinc-400" : "text-red-400"
                                    )}>
                                        {opponentScore}
                                    </p>
                                )}
                                <p className="text-xs text-zinc-500">@{opponent.username}</p>
                            </>
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center mx-auto mb-2">
                                <User size={20} className="text-zinc-600" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Winner Display (for completed challenges) */}
                {isCompleted && (
                    <div className={cn(
                        "rounded-xl p-3 mb-4 text-center",
                        challenge.winner_id === currentUserId
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : challenge.tie
                                ? "bg-zinc-500/10 border border-zinc-500/30"
                                : "bg-red-500/10 border border-red-500/30"
                    )}>
                        {challenge.winner_id === currentUserId ? (
                            <div className="flex items-center justify-center gap-2">
                                <Crown size={18} className="text-amber-400" />
                                <span className="font-semibold text-emerald-400">You Won! +{100} XP</span>
                            </div>
                        ) : challenge.tie ? (
                            <span className="text-zinc-400">It's a tie!</span>
                        ) : (
                            <span className="text-red-400">You lost. Better luck next time!</span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {isPending && !isChallenger && (
                        <>
                            <motion.button
                                onClick={handleAccept}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                Accept
                            </motion.button>
                            <motion.button
                                onClick={handleDecline}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <X size={16} />
                                Decline
                            </motion.button>
                        </>
                    )}

                    {isPending && isChallenger && (
                        <motion.button
                            onClick={() => onShare?.(challenge.invite_code)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-medium hover:bg-white/10 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Share2 size={16} />
                            Share Invite Link
                        </motion.button>
                    )}

                    {isActive && (
                        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Flame size={16} className="text-purple-400" />
                            <span className="text-sm text-purple-300">
                                {isWinning ? "You're winning!" : isTied ? "It's tied!" : "Push harder!"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// Empty state for no challenges
export function ChallengesEmptyState({ onCreateChallenge }: { onCreateChallenge: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 px-6"
        >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Swords size={32} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Active Challenges</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                Challenge a friend to a coding duel and see who can ship more!
            </p>
            <motion.button
                onClick={onCreateChallenge}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Swords size={18} />
                Start a Challenge
                <ChevronRight size={16} />
            </motion.button>
        </motion.div>
    )
}
