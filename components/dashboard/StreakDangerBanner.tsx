'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Clock, AlertTriangle, X, Shield, Loader2 } from 'lucide-react'

interface StreakBannerProps {
    currentStreak: number
    todayCommits: number
    className?: string
}

export function StreakDangerBanner({ currentStreak, todayCommits, className }: StreakBannerProps) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
    const [isDismissed, setIsDismissed] = useState(false)
    const [freezesAvailable, setFreezesAvailable] = useState(0)
    const [isUsingFreeze, setIsUsingFreeze] = useState(false)
    const [freezeUsed, setFreezeUsed] = useState(false)

    // Fetch freeze status
    useEffect(() => {
        async function fetchFreezes() {
            try {
                const res = await fetch('/api/user/streak-freeze')
                if (res.ok) {
                    const data = await res.json()
                    setFreezesAvailable(data.freezesAvailable || 0)
                }
            } catch (error) {
                console.error('Error fetching freezes:', error)
            }
        }
        if (currentStreak > 0 && todayCommits === 0) {
            fetchFreezes()
        }
    }, [currentStreak, todayCommits])

    // Calculate time until midnight (streak death)
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            const midnight = new Date()
            midnight.setHours(24, 0, 0, 0)
            const diff = midnight.getTime() - now.getTime()

            return {
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            }
        }

        setTimeLeft(calculateTimeLeft())
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
        return () => clearInterval(timer)
    }, [])

    const handleUseFreeze = async () => {
        if (freezesAvailable <= 0 || isUsingFreeze) return

        setIsUsingFreeze(true)
        try {
            const res = await fetch('/api/user/streak-freeze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'use' }),
            })
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setFreezeUsed(true)
                    setFreezesAvailable(data.freezesRemaining)
                }
            }
        } catch (error) {
            console.error('Error using freeze:', error)
        } finally {
            setIsUsingFreeze(false)
        }
    }

    // Don't show if:
    // - Already committed today
    // - No streak to lose
    // - User dismissed
    // - Freeze was just used
    if (todayCommits > 0 || currentStreak === 0 || isDismissed || freezeUsed) {
        // Show success message if freeze was used
        if (freezeUsed) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-4"
                >
                    <div className="flex items-center gap-3">
                        <Shield className="text-emerald-400" size={24} />
                        <div>
                            <p className="font-semibold text-emerald-300">Streak Protected! 🛡️</p>
                            <p className="text-sm text-zinc-400">
                                Your {currentStreak}-day streak is safe. You have {freezesAvailable} freeze{freezesAvailable !== 1 ? 's' : ''} remaining.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )
        }
        return null
    }

    const isCritical = timeLeft.hours < 2
    const isWarning = timeLeft.hours < 6

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className={`relative overflow-hidden rounded-2xl ${className}`}
            >
                {/* Background with animated gradient */}
                <motion.div
                    className={`absolute inset-0 ${isCritical
                        ? 'bg-gradient-to-r from-red-600/30 via-orange-500/20 to-red-600/30'
                        : isWarning
                            ? 'bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-orange-500/20'
                            : 'bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-violet-500/15'
                        }`}
                    animate={isCritical ? {
                        opacity: [0.8, 1, 0.8],
                        scale: [1, 1.01, 1]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />

                {/* Border glow */}
                <div className={`absolute inset-0 rounded-2xl border ${isCritical ? 'border-red-500/50' : isWarning ? 'border-orange-500/30' : 'border-violet-500/20'
                    }`} />

                <div className="relative px-6 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        {/* Animated Flame */}
                        <motion.div
                            animate={{
                                scale: isCritical ? [1, 1.2, 1] : [1, 1.1, 1],
                                rotate: isCritical ? [-5, 5, -5] : 0
                            }}
                            transition={{
                                duration: isCritical ? 0.5 : 2,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                            className="relative"
                        >
                            <Flame
                                size={28}
                                className={`${isCritical ? 'text-red-400 fill-red-400' :
                                    isWarning ? 'text-orange-400 fill-orange-400' :
                                        'text-violet-400'
                                    }`}
                            />
                            {isCritical && (
                                <motion.div
                                    className="absolute inset-0 bg-red-500/50 blur-md rounded-full"
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                />
                            )}
                        </motion.div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${isCritical ? 'text-red-300' : isWarning ? 'text-orange-300' : 'text-violet-300'
                                    }`}>
                                    {isCritical ? '⚠️ STREAK DYING' : `Your ${currentStreak}-day streak`}
                                </span>
                                {isCritical && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                        className="text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full font-mono"
                                    >
                                        CRITICAL
                                    </motion.span>
                                )}
                            </div>
                            <p className="text-sm text-zinc-400">
                                {isCritical
                                    ? 'Push 1 commit NOW to save your streak!'
                                    : 'No activity detected today. Keep the fire alive.'}
                            </p>
                        </div>
                    </div>

                    {/* Actions: Freeze + Timer */}
                    <div className="flex items-center gap-4">
                        {/* Streak Freeze Button */}
                        {freezesAvailable > 0 && (
                            <motion.button
                                onClick={handleUseFreeze}
                                disabled={isUsingFreeze}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 font-medium hover:from-blue-500/30 hover:to-cyan-500/30 transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isUsingFreeze ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Shield size={16} />
                                )}
                                <span className="text-sm">
                                    Use Freeze ({freezesAvailable})
                                </span>
                            </motion.button>
                        )}

                        {/* Countdown Timer */}
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
                                <Clock size={12} />
                                <span>Time remaining</span>
                            </div>
                            <motion.div
                                animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="flex gap-1 font-mono font-bold"
                            >
                                <TimeUnit value={timeLeft.hours} label="h" critical={isCritical} />
                                <span className={isCritical ? 'text-red-400' : 'text-zinc-500'}>:</span>
                                <TimeUnit value={timeLeft.minutes} label="m" critical={isCritical} />
                                <span className={isCritical ? 'text-red-400' : 'text-zinc-500'}>:</span>
                                <TimeUnit value={timeLeft.seconds} label="s" critical={isCritical} />
                            </motion.div>
                        </div>

                        <button
                            onClick={() => setIsDismissed(true)}
                            className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

function TimeUnit({ value, label, critical }: { value: number; label: string; critical: boolean }) {
    return (
        <span className={`${critical ? 'text-red-400' : 'text-white'}`}>
            {String(value).padStart(2, '0')}
            <span className="text-xs text-zinc-500">{label}</span>
        </span>
    )
}
