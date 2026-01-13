'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, TrendingDown, TrendingUp, Flame, Zap, ArrowRight } from 'lucide-react'

interface Directive {
    headline: string
    subtext: string
    impact: 'low' | 'medium' | 'critical'
    action: string
    metric: string
    delta: {
        previous: number
        current: number
        change: number
    }
    type: 'drop' | 'opportunity' | 'streak' | 'momentum'
}

const IMPACT_STYLES = {
    critical: {
        bg: 'from-red-500/20 to-orange-500/10',
        border: 'border-red-500/30',
        icon: AlertTriangle,
        iconColor: 'text-red-400',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]'
    },
    medium: {
        bg: 'from-amber-500/15 to-orange-500/5',
        border: 'border-amber-500/20',
        icon: TrendingDown,
        iconColor: 'text-amber-400',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]'
    },
    low: {
        bg: 'from-emerald-500/10 to-cyan-500/5',
        border: 'border-emerald-500/20',
        icon: TrendingUp,
        iconColor: 'text-emerald-400',
        glow: ''
    }
}

export function TodaysDirective({ className }: { className?: string }) {
    const [directive, setDirective] = useState<Directive | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch('/api/dashboard/directive', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.directive) setDirective(data.directive)
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    if (isLoading) {
        return (
            <div className={`animate-pulse rounded-2xl bg-white/5 h-32 ${className}`} />
        )
    }

    if (!directive) return null

    const style = IMPACT_STYLES[directive.impact]
    const Icon = style.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.bg} border ${style.border} ${style.glow} ${className}`}
        >
            {/* Pulse animation for critical */}
            {directive.impact === 'critical' && (
                <motion.div
                    className="absolute inset-0 bg-red-500/10"
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            <div className="relative p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {/* Impact Badge */}
                        <div className="flex items-center gap-2 mb-3">
                            <motion.div
                                animate={directive.impact === 'critical' ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Icon size={18} className={style.iconColor} />
                            </motion.div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${style.iconColor}`}>
                                {directive.impact === 'critical' ? 'Action Required' :
                                    directive.impact === 'medium' ? 'Attention' : 'Status'}
                            </span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-xl font-bold text-white mb-1">
                            {directive.headline}
                        </h2>
                        <p className="text-sm text-zinc-400 mb-4">
                            {directive.subtext}
                        </p>

                        {/* Action CTA */}
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 cursor-pointer hover:bg-white/15 transition-colors group"
                            whileHover={{ x: 5 }}
                        >
                            <Zap size={14} className="text-violet-400" />
                            <span className="text-sm font-medium text-white">
                                {directive.action}
                            </span>
                            <ArrowRight size={14} className="text-zinc-500 group-hover:text-violet-400 transition-colors" />
                        </motion.div>
                    </div>

                    {/* Delta Display */}
                    {directive.delta.change !== 0 && (
                        <div className="text-right">
                            <div className={`text-3xl font-mono font-bold ${directive.delta.change > 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {directive.delta.change > 0 ? '+' : ''}{directive.delta.change}%
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                                {directive.delta.previous} → {directive.delta.current}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
