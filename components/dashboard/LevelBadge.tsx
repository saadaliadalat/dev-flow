'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ChevronUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
    className?: string
    compact?: boolean
    showXpToday?: boolean
}

interface XpData {
    xp: number
    xpFormatted: string
    xpToday: number
    level: number
    title: string
    color: string
    progress: number
    xpForCurrentLevel: number
    xpForNextLevel: number
    nextMilestone: {
        level: number
        title: string
        xpRequired: number
        xpRemaining: number
    } | null
}

export function LevelBadge({ className, compact = false, showXpToday = true }: LevelBadgeProps) {
    const [data, setData] = useState<XpData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        async function fetchXp() {
            try {
                const res = await fetch('/api/user/xp')
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (error) {
                console.error('Error fetching XP:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchXp()
    }, [])

    if (isLoading) {
        return (
            <div className={cn('animate-pulse', className)}>
                <div className="h-10 w-32 bg-white/5 rounded-xl" />
            </div>
        )
    }

    if (!data) return null

    if (compact) {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10',
                    className
                )}
            >
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: data.color }}
                />
                <span className="text-xs font-medium text-white">Lv.{data.level}</span>
                <span className="text-xs text-zinc-500">{data.title}</span>
            </div>
        )
    }

    return (
        <div className={cn('relative', className)}>
            {/* Main Badge */}
            <motion.div
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 cursor-pointer hover:border-white/20 transition-colors group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Level Circle */}
                <div className="relative">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        {/* Background circle */}
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="none"
                            stroke={data.color}
                            strokeWidth="3"
                            strokeDasharray={`${data.progress} 100`}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                        />
                    </svg>
                    <span
                        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                        style={{ color: data.color }}
                    >
                        {data.level}
                    </span>
                </div>

                {/* Level Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{data.title}</span>
                        {data.xpToday > 0 && showXpToday && (
                            <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-medium">
                                <Zap size={10} />
                                +{data.xpToday} today
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-mono">
                            {data.xpFormatted} XP
                        </span>
                        {data.nextMilestone && (
                            <span className="text-[10px] text-zinc-600">
                                → {data.nextMilestone.xpRemaining.toLocaleString()} to {data.nextMilestone.title}
                            </span>
                        )}
                    </div>
                </div>

                {/* Expand Icon */}
                <ChevronUp
                    size={14}
                    className={cn(
                        'text-zinc-500 transition-transform',
                        showDetails ? 'rotate-180' : 'rotate-0'
                    )}
                />
            </motion.div>

            {/* Expanded Details */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl bg-zinc-900/95 border border-white/10 backdrop-blur-xl shadow-2xl z-50"
                    >
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">Progress to Lv.{data.level + 1}</span>
                                <span className="text-zinc-400">{data.progress}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: data.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.progress}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] mt-1 text-zinc-600 font-mono">
                                <span>{data.xpForCurrentLevel.toLocaleString()}</span>
                                <span>{data.xpForNextLevel.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* XP Sources */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                How to earn XP
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Daily commit: +10 XP
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Streak: +5 XP/day
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    PR merged: +50 XP
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    7/7 week: +200 XP
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Compact version for use in headers
export function LevelChip({ className }: { className?: string }) {
    const [data, setData] = useState<XpData | null>(null)

    useEffect(() => {
        async function fetchXp() {
            try {
                const res = await fetch('/api/user/xp')
                if (res.ok) {
                    setData(await res.json())
                }
            } catch (error) {
                console.error('Error fetching XP:', error)
            }
        }
        fetchXp()
    }, [])

    if (!data) return null

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
                className
            )}
            style={{
                backgroundColor: `${data.color}20`,
                color: data.color,
                border: `1px solid ${data.color}40`,
            }}
        >
            <Sparkles size={10} />
            Lv.{data.level} {data.title}
        </div>
    )
}
