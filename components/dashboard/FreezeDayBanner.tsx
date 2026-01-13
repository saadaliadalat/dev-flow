'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Snowflake, Sparkles, AlertTriangle } from 'lucide-react'

interface FreezeDayData {
    freezeDays: number
    freezeDaysUsed: number
    streakProtected: boolean
    justEarned: boolean
}

interface FreezeDayBannerProps {
    currentStreak: number
    todayCommits: number
    className?: string
}

export function FreezeDayBanner({ currentStreak, todayCommits, className = '' }: FreezeDayBannerProps) {
    const [data, setData] = useState<FreezeDayData | null>(null)
    const [showEarnedAnimation, setShowEarnedAnimation] = useState(false)
    const [showUsedAnimation, setShowUsedAnimation] = useState(false)

    useEffect(() => {
        // Check freeze day status from the streak update response
        // This is called after the main dashboard loads
        fetch('/api/user/freeze-status')
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                if (json) {
                    setData(json)
                    if (json.justEarned) {
                        setShowEarnedAnimation(true)
                        setTimeout(() => setShowEarnedAnimation(false), 3000)
                    }
                    if (json.streakProtected) {
                        setShowUsedAnimation(true)
                        setTimeout(() => setShowUsedAnimation(false), 3000)
                    }
                }
            })
            .catch(() => { })
    }, [])

    // Don't render if no data or no freeze days and nothing happening
    if (!data || (data.freezeDays === 0 && !showEarnedAnimation && !showUsedAnimation)) {
        return null
    }

    return (
        <div className={className}>
            <AnimatePresence>
                {/* Earned Animation */}
                {showEarnedAnimation && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            >
                                <Sparkles className="text-emerald-400" size={24} />
                            </motion.div>
                            <div>
                                <p className="text-sm font-semibold text-emerald-400">
                                    🎉 Freeze Day Earned!
                                </p>
                                <p className="text-xs text-zinc-400">
                                    You've unlocked a streak insurance day for hitting a 7-day milestone!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Used Animation */}
                {showUsedAnimation && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/30"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                            >
                                <Shield className="text-blue-400" size={24} />
                            </motion.div>
                            <div>
                                <p className="text-sm font-semibold text-blue-400">
                                    🛡️ Streak Protected!
                                </p>
                                <p className="text-xs text-zinc-400">
                                    A freeze day was used to save your {currentStreak}-day streak!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Freeze Day Counter Badge */}
            {data.freezeDays > 0 && !showEarnedAnimation && !showUsedAnimation && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-fit"
                >
                    <Snowflake size={14} className="text-cyan-400" />
                    <span className="text-xs font-medium text-cyan-400">
                        {data.freezeDays} Freeze {data.freezeDays === 1 ? 'Day' : 'Days'}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                        Streak Insurance
                    </span>
                </motion.div>
            )}
        </div>
    )
}

// Compact version for sidebar or header
export function FreezeDayBadge() {
    const [freezeDays, setFreezeDays] = useState<number | null>(null)

    useEffect(() => {
        fetch('/api/user/freeze-status')
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                if (json) setFreezeDays(json.freezeDays)
            })
            .catch(() => { })
    }, [])

    if (!freezeDays || freezeDays === 0) return null

    return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Snowflake size={12} className="text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400">{freezeDays}</span>
        </div>
    )
}
