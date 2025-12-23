'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PremiumStatCardProps {
    label: string
    value: number
    suffix?: string
    prefix?: string
    change?: number
    changeLabel?: string
    icon: React.ReactNode
    accentColor?: 'blue' | 'emerald' | 'amber' | 'purple'
    sparklineData?: number[]
}

const accentColors = {
    blue: {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.2)',
        text: 'var(--accent-blue)',
        glow: 'rgba(59, 130, 246, 0.3)',
    },
    emerald: {
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.2)',
        text: 'var(--accent-emerald)',
        glow: 'rgba(16, 185, 129, 0.3)',
    },
    amber: {
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.2)',
        text: 'var(--accent-amber)',
        glow: 'rgba(245, 158, 11, 0.3)',
    },
    purple: {
        bg: 'rgba(139, 92, 246, 0.1)',
        border: 'rgba(139, 92, 246, 0.2)',
        text: 'var(--accent-purple)',
        glow: 'rgba(139, 92, 246, 0.3)',
    },
}

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1500) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, amount: 0.5 })

    useEffect(() => {
        if (!inView) return

        let startTime: number
        let animationFrame: number

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)

            // Easing function (ease-out-expo)
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            setCount(Math.floor(eased * end))

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            }
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [end, duration, inView])

    return { count, ref }
}

// Mini Sparkline Component
function Sparkline({ data, color }: { data: number[], color: string }) {
    if (!data || data.length < 2) return null

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const width = 100
    const height = 40

    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((value - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg
            className="absolute bottom-0 right-0 w-24 h-10 opacity-30"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <polygon
                points={`0,${height} ${points} ${width},${height}`}
                fill={`url(#sparkGrad-${color})`}
            />
        </svg>
    )
}

export function PremiumStatCard({
    label,
    value,
    suffix = '',
    prefix = '',
    change,
    changeLabel,
    icon,
    accentColor = 'blue',
    sparklineData,
}: PremiumStatCardProps) {
    const { count, ref } = useAnimatedCounter(value)
    const colors = accentColors[accentColor]

    const getTrendIcon = () => {
        if (!change) return <Minus size={12} />
        return change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />
    }

    const getTrendColor = () => {
        if (!change) return 'text-[var(--text-tertiary)]'
        return change > 0 ? 'text-[var(--accent-emerald)]' : 'text-[var(--accent-red)]'
    }

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
            transition={{ duration: 0.2 }}
            className="stat-card group cursor-default"
            role="region"
            aria-label={`${label}: ${value}${suffix}`}
        >
            {/* Background Sparkline */}
            {sparklineData && (
                <Sparkline data={sparklineData} color={colors.text} />
            )}

            {/* Icon */}
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110"
                style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                }}
            >
                <div style={{ color: colors.text }}>{icon}</div>
            </div>

            {/* Label */}
            <p className="text-sm text-[var(--text-tertiary)] mb-1 font-medium">{label}</p>

            {/* Value */}
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white tabular-nums tracking-tight">
                    {prefix}{count.toLocaleString()}{suffix}
                </span>

                {/* Change Badge */}
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor()}`}>
                        {getTrendIcon()}
                        <span>{change > 0 ? '+' : ''}{change}%</span>
                    </div>
                )}
            </div>

            {/* Change Label */}
            {changeLabel && (
                <p className="text-xs text-[var(--text-muted)] mt-1">{changeLabel}</p>
            )}
        </motion.div>
    )
}

// Skeleton variant for loading
export function StatCardSkeleton() {
    return (
        <div className="stat-card animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] mb-3" />
            <div className="w-20 h-4 rounded bg-[var(--bg-elevated)] mb-2" />
            <div className="w-32 h-8 rounded bg-[var(--bg-elevated)]" />
        </div>
    )
}
