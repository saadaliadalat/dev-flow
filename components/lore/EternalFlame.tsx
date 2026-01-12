'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { SPRINGS } from '@/lib/motion'

interface EternalFlameProps {
    className?: string
    compact?: boolean
}

interface FlameData {
    eternityDays: number
    intensity: number
    status: 'blazing' | 'burning' | 'glowing' | 'ember'
    currentStreak: number
    longestStreak: number
    message: string
}

export function EternalFlame({ className, compact = false }: EternalFlameProps) {
    const [data, setData] = useState<FlameData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchFlame() {
            try {
                const res = await fetch('/api/user/eternal-flame', {
                    credentials: 'include',
                })
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                } else {
                    // Use fallback data instead of error
                    setData({
                        eternityDays: 1,
                        intensity: 0.5,
                        status: 'glowing',
                        currentStreak: 0,
                        longestStreak: 0,
                        message: "Your creative journey begins here.",
                    })
                }
            } catch (err) {
                console.error('Eternal flame fetch failed:', err)
                // Use fallback data instead of error
                setData({
                    eternityDays: 1,
                    intensity: 0.5,
                    status: 'glowing',
                    currentStreak: 0,
                    longestStreak: 0,
                    message: "Your creative journey begins here.",
                })
            } finally {
                setIsLoading(false)
            }
        }
        fetchFlame()
    }, [])

    // Loading state - show a pulsing flame
    if (isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center ${className}`}>
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <Flame size={48} className="text-amber-500/30" />
                </motion.div>
                <div className="mt-4 h-8 w-20 bg-white/5 rounded-lg animate-pulse" />
            </div>
        )
    }

    // Always show data now (either real or fallback)
    if (!data) {
        return null
    }

    const flameColors = {
        blazing: '#F59E0B',
        burning: '#FB923C',
        glowing: '#FBBF24',
        ember: '#78716C',
    }

    const flameColor = flameColors[data.status]

    if (compact) {
        return (
            <motion.div
                className={`flex items-center gap-3 ${className}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    animate={{
                        scale: [1, 1.1 * data.intensity, 1],
                        opacity: [data.intensity, 1, data.intensity],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Flame size={20} style={{ color: flameColor }} />
                </motion.div>
                <div>
                    <span className="text-lg font-mono font-bold text-white">{data.eternityDays.toLocaleString()}</span>
                    <span className="text-xs text-zinc-500 ml-1">days</span>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            className={`relative ${className}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Flame Container */}
            <div className="relative flex flex-col items-center">
                {/* Animated Flame */}
                <motion.div
                    className="relative"
                    animate={{
                        scale: [1, 1.05 * data.intensity, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {/* Outer Glow */}
                    <div
                        className="absolute inset-0 blur-xl rounded-full"
                        style={{
                            backgroundColor: flameColor,
                            opacity: 0.3 * data.intensity,
                        }}
                    />

                    {/* Main Flame Icon */}
                    <motion.div
                        animate={{
                            y: [0, -3, 0],
                            rotate: [-2, 2, -2],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Flame
                            size={64}
                            style={{ color: flameColor }}
                            className="drop-shadow-[0_0_20px_currentColor]"
                        />
                    </motion.div>
                </motion.div>

                {/* Days Counter */}
                <div className="mt-4 text-center">
                    <motion.span
                        className="text-4xl font-mono font-bold text-white"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {data.eternityDays.toLocaleString()}
                    </motion.span>
                    <p className="text-sm text-zinc-400 mt-1">Days of Creative Presence</p>
                </div>

                {/* Status Message */}
                <motion.p
                    className="text-xs text-zinc-500 mt-3 text-center italic max-w-[200px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    "{data.message}"
                </motion.p>

                {/* Active Streak Badge */}
                {data.currentStreak > 0 && (
                    <div className="mt-4 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                        <span className="text-xs text-amber-400 font-medium">
                            🔥 {data.currentStreak} day active streak
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
