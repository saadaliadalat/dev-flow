'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flower2, Loader2, Heart, AlertTriangle, Sparkles, Zap } from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'

interface BurnoutOracleProps {
    className?: string
}

interface BurnoutData {
    patterns: Array<{
        type: 'lateNights' | 'highVelocity' | 'noBreaks' | 'overwork' | 'healthy'
        severity: 'none' | 'mild' | 'warning' | 'critical'
        haiku: string
    }>
    primary: {
        type: string
        severity: 'none' | 'mild' | 'warning' | 'critical'
        haiku: string
    }
}

export function BurnoutOracle({ className }: BurnoutOracleProps) {
    const [data, setData] = useState<BurnoutData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function checkBurnout() {
            try {
                const res = await fetch('/api/user/burnout-check')
                if (!res.ok) throw new Error('Failed')
                const json = await res.json()
                setData(json)
            } catch (err) {
                console.error('Burnout check failed:', err)
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        checkBurnout()
    }, [])

    // Loading state
    if (isLoading) {
        return (
            <AliveCard className={`p-6 ${className}`} glass>
                <div className="flex flex-col items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 text-pink-400 animate-spin mb-3" />
                    <p className="text-xs text-zinc-500">Reading your patterns...</p>
                </div>
            </AliveCard>
        )
    }

    // Error state
    if (error || !data) {
        return (
            <AliveCard className={`p-6 ${className}`} glass>
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Flower2 className="w-8 h-8 text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-500">The oracle is resting</p>
                    <p className="text-xs text-zinc-600 mt-1">Check back later</p>
                </div>
            </AliveCard>
        )
    }

    const { primary } = data
    const isHealthy = primary.severity === 'none'

    // Styles based on severity
    const severityConfig = {
        none: {
            icon: Heart,
            iconColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/20',
            bgGradient: 'from-emerald-500/5 to-cyan-500/5',
            glowColor: 'shadow-[0_0_30px_rgba(16,185,129,0.1)]',
            label: 'Balanced',
            labelColor: 'text-emerald-400',
        },
        mild: {
            icon: Sparkles,
            iconColor: 'text-blue-400',
            borderColor: 'border-blue-500/20',
            bgGradient: 'from-blue-500/5 to-indigo-500/5',
            glowColor: 'shadow-[0_0_30px_rgba(59,130,246,0.1)]',
            label: 'Mild',
            labelColor: 'text-blue-400',
        },
        warning: {
            icon: Zap,
            iconColor: 'text-amber-400',
            borderColor: 'border-amber-500/20',
            bgGradient: 'from-amber-500/5 to-orange-500/5',
            glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
            label: 'Warning',
            labelColor: 'text-amber-400',
        },
        critical: {
            icon: AlertTriangle,
            iconColor: 'text-red-400',
            borderColor: 'border-red-500/20',
            bgGradient: 'from-red-500/5 to-rose-500/5',
            glowColor: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]',
            label: 'Critical',
            labelColor: 'text-red-400',
        },
    }

    const config = severityConfig[primary.severity]
    const Icon = config.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <AliveCard
                className={`p-6 bg-gradient-to-br ${config.bgGradient} ${config.borderColor} ${config.glowColor} ${className}`}
                glass
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Flower2 className="text-pink-400" size={18} />
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                            Oracle Reading
                        </span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border ${config.borderColor}`}>
                        <Icon size={12} className={config.iconColor} />
                        <span className={`text-[10px] font-medium ${config.labelColor}`}>
                            {config.label}
                        </span>
                    </div>
                </div>

                {/* Status Icon */}
                <div className="flex justify-center mb-4">
                    <motion.div
                        animate={isHealthy ? {
                            scale: [1, 1.05, 1],
                        } : {
                            rotate: [0, 2, -2, 0],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${isHealthy
                                ? 'bg-emerald-500/10 border border-emerald-500/30'
                                : 'bg-white/5 border border-white/10'
                            }`}
                    >
                        <Icon size={28} className={config.iconColor} />
                    </motion.div>
                </div>

                {/* Haiku */}
                <div className="space-y-1 text-center mb-4">
                    {primary.haiku.split('\n').map((line, i) => (
                        <motion.p
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="text-sm text-zinc-300 font-light italic"
                        >
                            {line}
                        </motion.p>
                    ))}
                </div>

                {/* Wisdom footer */}
                <p className="text-[10px] text-zinc-600 text-center">
                    {isHealthy
                        ? "Your patterns show balance and health."
                        : "A gentle observation from your coding patterns."}
                </p>

                {/* Pattern type indicator */}
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-center">
                    <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                        {primary.type.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                </div>
            </AliveCard>
        </motion.div>
    )
}
