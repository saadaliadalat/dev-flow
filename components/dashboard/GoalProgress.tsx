'use client'

import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface GoalProgressProps {
    label: string
    current: number
    target: number
    unit?: string
    color?: 'blue' | 'emerald' | 'amber' | 'purple'
}

const colorConfig = {
    blue: { // Mapped to White/Silver
        gradient: 'linear-gradient(90deg, #FFFFFF, #e4e4e7)',
        bg: '#27272a', // Zinc-800 Track
        glow: 'rgba(255, 255, 255, 0.2)',
    },
    emerald: { // Mapped to White/Silver
        gradient: 'linear-gradient(90deg, #FFFFFF, #e4e4e7)',
        bg: 'rgba(255, 255, 255, 0.1)',
        glow: 'rgba(255, 255, 255, 0.2)',
    },
    amber: { // Mapped to White/Silver
        gradient: 'linear-gradient(90deg, #FFFFFF, #e4e4e7)',
        bg: 'rgba(255, 255, 255, 0.1)',
        glow: 'rgba(255, 255, 255, 0.2)',
    },
    purple: { // Mapped to White/Silver (or Purple if requested? Prompt said "Daily Goals" progress bars to be White)
        gradient: 'linear-gradient(90deg, #FFFFFF, #e4e4e7)',
        bg: 'rgba(255, 255, 255, 0.1)',
        glow: 'rgba(255, 255, 255, 0.2)',
    },
}

export function GoalProgress({
    label,
    current,
    target,
    unit = '',
    color = 'blue',
}: GoalProgressProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })
    const percentage = Math.min((current / target) * 100, 100)
    const colors = colorConfig[color]

    return (
        <div ref={ref} className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)] font-medium">{label}</span>
                <span className="text-white font-semibold tabular-nums">
                    {current.toLocaleString()}{unit} / {target.toLocaleString()}{unit}
                </span>
            </div>

            {/* Progress Bar */}
            <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.bg }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${percentage.toFixed(0)}% complete`}
            >
                <motion.div
                    className="h-full rounded-full relative"
                    style={{
                        background: colors.gradient,
                        boxShadow: `0 0 10px ${colors.glow}`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${percentage}%` : 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-100%', '400%'] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Percentage */}
            <div className="text-right">
                <span className="text-xs text-[var(--text-muted)]">{percentage.toFixed(0)}% complete</span>
            </div>
        </div>
    )
}

// Circular Progress variant
interface CircularProgressProps {
    percentage: number
    size?: number
    strokeWidth?: number
    color?: 'blue' | 'emerald' | 'amber' | 'purple'
    label?: string
}

export function CircularProgress({
    percentage,
    size = 80,
    strokeWidth = 6,
    color = 'blue',
    label,
}: CircularProgressProps) {
    const ref = useRef<SVGSVGElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })
    const colors = colorConfig[color]

    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    ref={ref}
                    width={size}
                    height={size}
                    className="-rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--bg-elevated)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="url(#circleGradient)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: isInView ? offset : circumference }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        style={{ filter: `drop-shadow(0 0 6px ${colors.glow})` }}
                    />
                    <defs>
                        <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color === 'blue' ? '#3B82F6' : color === 'emerald' ? '#10B981' : color === 'amber' ? '#F59E0B' : '#8B5CF6'} />
                            <stop offset="100%" stopColor={color === 'blue' ? '#60A5FA' : color === 'emerald' ? '#34D399' : color === 'amber' ? '#FBBF24' : '#A78BFA'} />
                        </linearGradient>
                    </defs>
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white tabular-nums">{percentage}%</span>
                </div>
            </div>
            {label && (
                <span className="text-xs text-[var(--text-tertiary)] text-center">{label}</span>
            )}
        </div>
    )
}

// Skeleton
export function GoalProgressSkeleton() {
    return (
        <div className="space-y-2 animate-pulse">
            <div className="flex justify-between">
                <div className="w-24 h-4 rounded bg-[var(--bg-elevated)]" />
                <div className="w-16 h-4 rounded bg-[var(--bg-elevated)]" />
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-elevated)]" />
        </div>
    )
}
