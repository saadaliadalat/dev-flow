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
    color?: 'default' | 'green' | 'red' | 'yellow' | 'purple' | 'cyan' | 'blue' | 'orange'
    loading?: boolean
}

const colorClasses = {
    default: {
        icon: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        glow: 'hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.1)]',
        sparkle: 'bg-white'
    },
    green: {
        icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        glow: 'hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.2)]',
        sparkle: 'bg-emerald-400'
    },
    red: {
        icon: 'bg-red-500/10 text-red-400 border-red-500/20',
        glow: 'hover:shadow-[0_0_40px_-5px_rgba(239,68,68,0.2)]',
        sparkle: 'bg-red-400'
    },
    yellow: {
        icon: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        glow: 'hover:shadow-[0_0_40px_-5px_rgba(234,179,8,0.2)]',
        sparkle: 'bg-yellow-400'
    },
    purple: {
        icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        glow: 'hover:shadow-[0_0_40px_-5px_rgba(168,85,247,0.2)]',
        sparkle: 'bg-purple-400'
    },
    cyan: {
        icon: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        glow: 'hover:shadow-[0_0_40px_-5px_rgba(34,211,238,0.2)]',
        sparkle: 'bg-cyan-400'
    },
    blue: {
        icon: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        glow: 'hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.2)]',
        sparkle: 'bg-blue-400'
    },
    orange: {
        icon: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        glow: 'hover:shadow-[0_0_40px_-5px_rgba(249,115,22,0.2)]',
        sparkle: 'bg-orange-400'
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

    // Creating a random sparkline path for visual effect
    const sparklinePath = "M0 20 Q 10 10, 20 18 T 40 15 T 60 5 T 80 12 T 100 8"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={`
                relative p-6 rounded-3xl 
                bg-[#09090b]/80 border border-white/5 
                backdrop-blur-xl overflow-hidden group 
                transition-all duration-300
                ${colors.glow}
            `}
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Sparkle Effect */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${colors.sparkle}`} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3.5 rounded-2xl border ${colors.icon} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon size={24} strokeWidth={1.5} />
                    </div>
                    {change !== undefined && (
                        <div className={`
                            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                            ${change > 0
                                ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'
                                : change < 0
                                    ? 'text-red-400 bg-red-500/5 border-red-500/10'
                                    : 'text-zinc-400 bg-zinc-500/5 border-zinc-500/10'
                            }`}>
                            {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                            {change > 0 ? '+' : ''}{change}%
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-9 w-32 bg-white/5 rounded-lg animate-pulse" />
                            <div className="h-4 w-24 bg-white/5 rounded-lg animate-pulse opacity-50" />
                        </div>
                    ) : (
                        <>
                            <div className="text-4xl font-bold text-white font-display tracking-tight group-hover:tracking-normal transition-all duration-300">
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-500 font-medium">
                                    {title}
                                </span>
                                {changeLabel && (
                                    <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                        {changeLabel}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Decorative Sparkline */}
                <svg className="absolute bottom-0 right-0 w-32 h-16 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none text-white" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
                    <path d={sparklinePath} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    <path d={`${sparklinePath} V 30 H 0 Z`} fill="currentColor" fillOpacity="0.2" />
                </svg>
            </div>
        </motion.div>
    )
}
