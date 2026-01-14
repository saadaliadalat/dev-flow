'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, AlertTriangle, X, Clock, Zap } from 'lucide-react'
import Link from 'next/link'

interface StreakData {
    currentStreak: number
    longestStreak: number
    lastActivityDate: string | null
    hoursUntilStreakBreak: number
}

export function StreakWarning() {
    const [data, setData] = useState<StreakData | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if already dismissed today
        const dismissedKey = `streak-warning-dismissed-${new Date().toISOString().split('T')[0]}`
        if (localStorage.getItem(dismissedKey)) {
            setIsDismissed(true)
            return
        }

        async function checkStreak() {
            try {
                const res = await fetch('/api/user/streak-status')
                if (res.ok) {
                    const result = await res.json()
                    setData(result)
                }
            } catch (err) {
                console.error('Streak check failed:', err)
            }
        }
        checkStreak()
    }, [])

    const handleDismiss = () => {
        const dismissedKey = `streak-warning-dismissed-${new Date().toISOString().split('T')[0]}`
        localStorage.setItem(dismissedKey, 'true')
        setIsDismissed(true)
        setIsVisible(false)
    }

    // Don't show if dismissed, no data, or streak is safe
    if (isDismissed || !data || data.currentStreak === 0) return null

    // Only warn if less than 8 hours left
    const isUrgent = data.hoursUntilStreakBreak <= 8
    const isCritical = data.hoursUntilStreakBreak <= 3

    if (!isUrgent) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className={`fixed top-4 right-4 z-50 max-w-sm rounded-2xl border backdrop-blur-xl shadow-2xl ${isCritical
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-orange-500/10 border-orange-500/30'
                        }`}
                >
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl ${isCritical ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    {isCritical
                                        ? <AlertTriangle className="w-6 h-6 text-red-400" />
                                        : <Flame className="w-6 h-6 text-orange-400" />
                                    }
                                </motion.div>
                            </div>

                            <div className="flex-1">
                                <h4 className={`font-bold ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                                    {isCritical ? '🚨 Streak Emergency!' : '⚠️ Streak at Risk!'}
                                </h4>
                                <p className="text-sm text-zinc-400 mt-1">
                                    Your <span className="text-white font-bold">{data.currentStreak}-day streak</span> will break in{' '}
                                    <span className={`font-mono font-bold ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                                        {data.hoursUntilStreakBreak}h
                                    </span>
                                </p>

                                <div className="flex items-center gap-2 mt-3">
                                    <Link
                                        href="/dashboard"
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${isCritical
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-orange-500 text-white hover:bg-orange-600'
                                            }`}
                                    >
                                        <Zap className="w-3 h-3" />
                                        Save Streak
                                    </Link>
                                    <button
                                        onClick={handleDismiss}
                                        className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="text-zinc-600 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
