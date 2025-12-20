'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon: LucideIcon
    color?: 'default' | 'green' | 'red' | 'yellow' | 'purple' | 'cyan'
    loading?: boolean
}

const colorClasses = {
    default: {
        icon: 'bg-white/10 text-white border-white/20',
        glow: ''
    },
    green: {
        icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.1)]'
    },
    red: {
        icon: 'bg-red-500/10 text-red-400 border-red-500/20',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.1)]'
    },
    yellow: {
        icon: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        glow: 'shadow-[0_0_30px_rgba(234,179,8,0.1)]'
    },
    purple: {
        icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        glow: 'shadow-[0_0_30px_rgba(168,85,247,0.1)]'
    },
    cyan: {
        icon: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        glow: 'shadow-[0_0_30px_rgba(34,211,238,0.1)]'
    }
}

export function StatsCard({
    title,
    value,
    change,
    changeLabel,
    icon: Icon,
    color = 'default',
    loading = false
}: StatsCardProps) {
    const colors = colorClasses[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-6 rounded-2xl bg-bg-elevated/50 border border-white/5 backdrop-blur-xl overflow-hidden group hover:border-white/10 transition-all ${colors.glow}`}
        >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${colors.icon}`}>
                        <Icon size={20} />
                    </div>
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${change > 0
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : change < 0
                                ? 'text-red-400 bg-red-500/10'
                                : 'text-zinc-400 bg-zinc-500/10'
                            }`}>
                            {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                            {change > 0 ? '+' : ''}{change}%
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-2">
                        <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                    </div>
                ) : (
                    <>
                        <div className="text-3xl font-bold text-white font-display tracking-tight mb-1">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                        <div className="text-sm text-zinc-500 font-mono uppercase tracking-wider">
                            {title}
                        </div>
                        {changeLabel && (
                            <div className="text-xs text-zinc-600 mt-1">
                                {changeLabel}
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    )
}
