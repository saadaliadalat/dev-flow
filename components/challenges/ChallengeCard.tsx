'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Swords, Clock, Trophy, User, Check, X,
    Share2, Loader2, Flame, ChevronRight, Crown,
    GitCommit, Zap, TrendingUp, Sparkles
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

// Animated counter component
function AnimatedScore({ value, isWinning, isTied }: { value: number; isWinning: boolean; isTied: boolean }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const duration = 1000
        const steps = 20
        const increment = value / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setDisplayValue(value)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(current))
            }
        }, duration / steps)
        return () => clearInterval(timer)
    }, [value])

    return (
        <motion.span
            className={cn(
                "text-3xl font-bold font-mono tabular-nums",
                isWinning ? "text-emerald-400" : isTied ? "text-zinc-300" : "text-red-400"
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
        >
            {displayValue}
        </motion.span>
    )
}

// Progress bar showing relative scores
function ScoreProgress({ myScore, opponentScore, isChallenger }: { myScore: number; opponentScore: number; isChallenger: boolean }) {
    const total = myScore + opponentScore || 1
    const myPercentage = Math.min(100, Math.max(0, (myScore / total) * 100))

    return (
        <div className="relative h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            {/* My score from left */}
            <motion.div
                className="absolute left-0 h-full bg-gradient-to-r from-purple-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${myPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
            {/* Center line */}
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-zinc-600 -translate-x-1/2" />
        </div>
    )
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
    const scoreDiff = Math.abs(myScore - opponentScore)

    // Calculate days remaining
    const endDate = new Date(challenge.end_date)
    const startDate = new Date(challenge.start_date)
    const now = new Date()
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const totalDays = challenge.duration_days
    const daysElapsed = totalDays - daysRemaining
    const progressPercent = (daysElapsed / totalDays) * 100

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
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Pending
                    </span>
                )
            case 'active':
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                    </span>
                )
            case 'completed':
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Trophy size={12} />
                        Completed
                    </span>
                )
            case 'declined':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        Declined
                    </span>
                )
            default:
                return null
        }
    }

    const getChallengeTypeIcon = () => {
        switch (challenge.challenge_type) {
            case 'commits': return <GitCommit size={18} className="text-purple-400" />
            case 'streak': return <Flame size={18} className="text-orange-400" />
            case 'prs': return <TrendingUp size={18} className="text-blue-400" />
            default: return <Swords size={18} className="text-purple-400" />
        }
    }

    const getChallengeTypeLabel = () => {
        switch (challenge.challenge_type) {
            case 'commits': return 'Commit Battle'
            case 'streak': return 'Streak Showdown'
            case 'prs': return 'PR Marathon'
            default: return 'Challenge'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative overflow-hidden rounded-2xl border p-5",
                "bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-900/90",
                "backdrop-blur-sm",
                isActive && "border-purple-500/40 shadow-[0_0_30px_rgba(139,92,246,0.15)]",
                isCompleted && challenge.winner_id === currentUserId && "border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
                isCompleted && challenge.winner_id && challenge.winner_id !== currentUserId && "border-red-500/30",
                !isActive && !isCompleted && "border-white/10",
                className
            )}
        >
            {/* Animated glow for winning */}
            {isActive && isWinning && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            {/* Winner celebration effect */}
            {isCompleted && challenge.winner_id === currentUserId && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-emerald-500/5 to-amber-500/5"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2.5 rounded-xl border",
                            challenge.challenge_type === 'commits' && "bg-purple-500/10 border-purple-500/20",
                            challenge.challenge_type === 'streak' && "bg-orange-500/10 border-orange-500/20",
                            challenge.challenge_type === 'prs' && "bg-blue-500/10 border-blue-500/20"
                        )}>
                            {getChallengeTypeIcon()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-white text-lg">{getChallengeTypeLabel()}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-zinc-500">{challenge.duration_days} day challenge</span>
                                {isActive && (
                                    <>
                                        <span className="text-zinc-600">•</span>
                                        <span className={cn(
                                            "text-xs font-medium",
                                            daysRemaining <= 1 ? "text-red-400" : daysRemaining <= 3 ? "text-amber-400" : "text-zinc-400"
                                        )}>
                                            {daysRemaining}d left
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>

                {/* VS Display - Redesigned */}
                <div className="relative bg-zinc-800/50 rounded-xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center justify-between gap-4">
                        {/* You */}
                        <div className="flex-1 text-center">
                            <div className={cn(
                                "relative w-14 h-14 rounded-full mx-auto mb-2",
                                "bg-gradient-to-br from-purple-500 to-violet-600",
                                "flex items-center justify-center",
                                isActive && isWinning && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-900"
                            )}>
                                {isActive && isWinning && (
                                    <motion.div
                                        className="absolute -top-1 -right-1"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <Crown size={12} className="text-white" />
                                        </div>
                                    </motion.div>
                                )}
                                <span className="text-white font-bold text-sm">YOU</span>
                            </div>

                            {(isActive || isCompleted) && (
                                <AnimatedScore value={myScore} isWinning={isWinning} isTied={isTied} />
                            )}

                            <p className="text-xs text-zinc-500 mt-1">
                                {challenge.challenge_type === 'commits' ? 'commits' :
                                    challenge.challenge_type === 'streak' ? 'day streak' : 'PRs'}
                            </p>
                        </div>

                        {/* VS Center */}
                        <div className="flex flex-col items-center px-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-700/50 border border-zinc-600 flex items-center justify-center mb-1">
                                <Swords size={16} className="text-zinc-400" />
                            </div>
                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">vs</span>
                        </div>

                        {/* Opponent */}
                        <div className="flex-1 text-center">
                            {opponent ? (
                                <>
                                    <div className={cn(
                                        "relative w-14 h-14 rounded-full mx-auto mb-2 overflow-hidden",
                                        "border-2",
                                        isActive && !isWinning && !isTied
                                            ? "border-emerald-500 ring-2 ring-emerald-500/30"
                                            : "border-zinc-700"
                                    )}>
                                        {isActive && !isWinning && !isTied && (
                                            <motion.div
                                                className="absolute -top-1 -right-1 z-10"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <Crown size={12} className="text-white" />
                                                </div>
                                            </motion.div>
                                        )}
                                        <img
                                            src={opponent.avatar_url || '/default-avatar.png'}
                                            alt={opponent.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {(isActive || isCompleted) && (
                                        <AnimatedScore
                                            value={opponentScore}
                                            isWinning={!isWinning && !isTied}
                                            isTied={isTied}
                                        />
                                    )}

                                    <p className="text-xs text-zinc-400 mt-1 truncate">@{opponent.username}</p>
                                </>
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center mx-auto mb-2">
                                    <User size={20} className="text-zinc-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Score Progress Bar */}
                    {(isActive || isCompleted) && opponent && (
                        <div className="mt-4 pt-3 border-t border-white/5">
                            <ScoreProgress myScore={myScore} opponentScore={opponentScore} isChallenger={isChallenger} />
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] text-zinc-500">You</span>
                                <span className="text-[10px] text-zinc-500">{opponent.username}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Message */}
                {isActive && (
                    <motion.div
                        className={cn(
                            "rounded-xl p-3 mb-4 text-center border",
                            isWinning ? "bg-emerald-500/10 border-emerald-500/20" :
                                isTied ? "bg-zinc-500/10 border-zinc-500/20" :
                                    "bg-amber-500/10 border-amber-500/20"
                        )}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            {isWinning ? (
                                <>
                                    <Flame size={16} className="text-emerald-400" />
                                    <span className="text-sm font-medium text-emerald-400">
                                        You're ahead by {scoreDiff}! Keep pushing!
                                    </span>
                                </>
                            ) : isTied ? (
                                <>
                                    <Zap size={16} className="text-zinc-400" />
                                    <span className="text-sm text-zinc-400">
                                        It's a tie! One commit could change everything!
                                    </span>
                                </>
                            ) : (
                                <>
                                    <TrendingUp size={16} className="text-amber-400" />
                                    <span className="text-sm text-amber-400">
                                        {scoreDiff} behind — time to catch up!
                                    </span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Winner Display (for completed challenges) */}
                {isCompleted && (
                    <motion.div
                        className={cn(
                            "rounded-xl p-4 mb-4 text-center border",
                            challenge.winner_id === currentUserId
                                ? "bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-emerald-500/10 border-emerald-500/30"
                                : challenge.tie
                                    ? "bg-zinc-500/10 border-zinc-500/30"
                                    : "bg-red-500/10 border-red-500/30"
                        )}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {challenge.winner_id === currentUserId ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Crown size={20} className="text-amber-400" />
                                    <span className="font-bold text-lg text-emerald-400">Victory!</span>
                                    <Sparkles size={16} className="text-amber-400" />
                                </div>
                                <span className="text-sm text-emerald-300/80">+100 XP earned</span>
                            </div>
                        ) : challenge.tie ? (
                            <div className="flex items-center justify-center gap-2">
                                <Swords size={18} className="text-zinc-400" />
                                <span className="text-zinc-300">It's a tie! Both warriors fought equally.</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <span className="font-medium text-red-400">Defeated this time</span>
                                <span className="text-xs text-zinc-500">Challenge them again for a rematch!</span>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {isPending && !isChallenger && (
                        <>
                            <motion.button
                                onClick={handleAccept}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                Accept Challenge
                            </motion.button>
                            <motion.button
                                onClick={handleDecline}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 font-medium hover:bg-zinc-700 transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <X size={16} />
                            </motion.button>
                        </>
                    )}

                    {isPending && isChallenger && (
                        <motion.button
                            onClick={() => onShare?.(challenge.invite_code)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Share2 size={16} />
                            Share Invite Link
                        </motion.button>
                    )}

                    {isActive && (
                        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-purple-500/10 border border-purple-500/20">
                            <Flame size={16} className={cn(
                                isWinning ? "text-emerald-400" : "text-purple-400"
                            )} />
                            <span className={cn(
                                "text-sm font-medium",
                                isWinning ? "text-emerald-300" : "text-purple-300"
                            )}>
                                {isWinning ? "Keep the momentum!" : isTied ? "Break the tie!" : "Time to grind!"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// Empty state for no challenges - Redesigned
export function ChallengesEmptyState({ onCreateChallenge }: { onCreateChallenge: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6"
        >
            <motion.div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6"
                animate={{
                    boxShadow: ['0 0 20px rgba(139,92,246,0.2)', '0 0 40px rgba(139,92,246,0.3)', '0 0 20px rgba(139,92,246,0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Swords size={36} className="text-purple-400" />
            </motion.div>

            <h3 className="text-xl font-bold text-white mb-2">No Active Challenges</h3>
            <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
                Challenge a friend to a coding duel and see who can ship more code!
            </p>

            <motion.button
                onClick={onCreateChallenge}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
            >
                <Swords size={20} />
                Start a Challenge
                <ChevronRight size={18} />
            </motion.button>
        </motion.div>
    )
}
