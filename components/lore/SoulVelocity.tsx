'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { Zap, BookOpen, Flame, TrendingUp, Info, Sparkles } from 'lucide-react'
import { SPRINGS } from '@/lib/motion'

interface SoulVelocityData {
    depth: number
    learning: number
    risk: number
    combined?: number
    message?: string
    history?: number[] // Last 30 days
    streak?: number
    recencyWeight?: number
}

interface SoulVelocityProps extends SoulVelocityData {
    className?: string
    showFormula?: boolean
}

// Dynamic color based on score
function getScoreColor(score: number): { primary: string; glow: string; gradient: string[] } {
    if (score < 30) return {
        primary: '#EF4444',
        glow: 'rgba(239, 68, 68, 0.5)',
        gradient: ['#DC2626', '#F97316']
    }
    if (score < 50) return {
        primary: '#F59E0B',
        glow: 'rgba(245, 158, 11, 0.5)',
        gradient: ['#F59E0B', '#FBBF24']
    }
    if (score < 70) return {
        primary: '#8B5CF6',
        glow: 'rgba(139, 92, 246, 0.5)',
        gradient: ['#8B5CF6', '#A78BFA']
    }
    return {
        primary: '#06B6D4',
        glow: 'rgba(6, 182, 212, 0.6)',
        gradient: ['#8B5CF6', '#06B6D4']
    }
}

// Motivational quotes based on score trend
const SOUL_QUOTES = {
    rising: [
        "Your momentum is undeniable. Keep climbing.",
        "The best code is yet to come.",
        "You're writing history with every commit.",
    ],
    stable: [
        "Consistency is the ultimate superpower.",
        "Steady hands build lasting empires.",
        "Every line matters. Keep going.",
    ],
    falling: [
        "Even stars need to rest before shining brighter.",
        "The comeback is always stronger than the setback.",
        "Your next session could change everything.",
    ],
    low: [
        "The ember never dies. Ready when you are.",
        "One commit. That's all it takes to restart.",
        "Your tools await. The code misses you.",
    ],
}

function getDailyQuote(score: number, history: number[] = []): string {
    const today = new Date().getDate()
    let category: keyof typeof SOUL_QUOTES = 'stable'

    if (history.length >= 2) {
        const recent = history.slice(0, 7).reduce((a, b) => a + b, 0) / Math.max(history.slice(0, 7).length, 1)
        const older = history.slice(7, 14).reduce((a, b) => a + b, 0) / Math.max(history.slice(7, 14).length, 1)
        if (recent > older * 1.1) category = 'rising'
        else if (recent < older * 0.9) category = 'falling'
    }

    if (score < 30) category = 'low'

    const quotes = SOUL_QUOTES[category]
    return quotes[today % quotes.length]
}

// Sparkline component for history
function Sparkline({ data, color, className }: { data: number[]; color: string; className?: string }) {
    if (!data || data.length < 2) return null

    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const range = max - min || 1
    const width = 100
    const height = 30

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className={`${className}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
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
                className="opacity-60"
            />
            <polygon
                points={`0,${height} ${points} ${width},${height}`}
                fill="url(#sparklineGradient)"
            />
        </svg>
    )
}

// Animated number with spring physics
function AnimatedScore({ value, color }: { value: number; color: string }) {
    const spring = useSpring(0, { stiffness: 50, damping: 20 })
    const display = useTransform(spring, Math.round)
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        spring.set(value)
        const unsubscribe = display.on('change', (v) => setDisplayValue(v))
        return unsubscribe
    }, [value, spring, display])

    return (
        <motion.span
            className="font-mono text-5xl font-black"
            style={{ color }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
            {displayValue}
        </motion.span>
    )
}

// Particle effect for glow
function ParticleRing({ color, intensity }: { color: string; intensity: number }) {
    const particleCount = Math.floor(intensity * 12)

    return (
        <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: particleCount }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                        backgroundColor: color,
                        left: '50%',
                        top: '50%',
                    }}
                    animate={{
                        x: [0, Math.cos((i / particleCount) * Math.PI * 2) * (40 + Math.random() * 20)],
                        y: [0, Math.sin((i / particleCount) * Math.PI * 2) * (40 + Math.random() * 20)],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: 2 + Math.random(),
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

export function SoulVelocityGauge({
    depth,
    learning,
    risk,
    combined,
    message,
    history = [],
    streak = 1,
    recencyWeight = 1,
    className,
    showFormula = false,
}: SoulVelocityProps) {
    const [showTooltip, setShowTooltip] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    // Real formula: Soul Velocity = (0.4×Depth + 0.4×Learning + 0.2×Risk) × recency × streak
    const baseScore = depth * 0.4 + learning * 0.4 + risk * 0.2
    const calculatedCombined = combined ?? Math.round(baseScore * recencyWeight * Math.min(1 + streak * 0.02, 1.3))
    const finalScore = Math.min(100, Math.max(0, calculatedCombined))

    const scoreColors = getScoreColor(finalScore)
    const quote = getDailyQuote(finalScore, history)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const metrics = [
        {
            label: 'Depth',
            value: depth,
            color: '#8B5CF6',
            icon: Zap,
            description: 'Commit complexity & review depth',
            formula: 'lines_changed × files_touched × review_quality'
        },
        {
            label: 'Learning',
            value: learning,
            color: '#3B82F6',
            icon: BookOpen,
            description: 'New patterns & exploration',
            formula: 'new_repos + new_languages + docs_touched'
        },
        {
            label: 'Risk',
            value: risk,
            color: '#F59E0B',
            icon: Flame,
            description: 'Creative courage & experimentation',
            formula: 'experimental_branches + refactors + new_tech'
        },
    ]

    // SVG arc path generator with smooth curves
    const createArc = (startAngle: number, endAngle: number, radius: number) => {
        const startRad = (startAngle - 90) * (Math.PI / 180)
        const endRad = (endAngle - 90) * (Math.PI / 180)
        const x1 = 100 + radius * Math.cos(startRad)
        const y1 = 100 + radius * Math.sin(startRad)
        const x2 = 100 + radius * Math.cos(endRad)
        const y2 = 100 + radius * Math.sin(endRad)
        const largeArc = endAngle - startAngle > 180 ? 1 : 0
        return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
    }

    const arcConfigs = [
        { start: -30, end: 90, radius: 88 },   // Depth (top-right)
        { start: 90, end: 210, radius: 88 },   // Learning (bottom)
        { start: 210, end: 330, radius: 88 },  // Risk (top-left)
    ]

    return (
        <div className={`relative ${className}`}>
            {/* Main Gauge Container */}
            <div className="relative">
                {/* Particle effects for high scores */}
                {finalScore > 60 && <ParticleRing color={scoreColors.primary} intensity={finalScore / 100} />}

                {/* SVG Gauge */}
                <motion.svg
                    viewBox="0 0 200 200"
                    className="w-full h-auto max-w-[300px] mx-auto"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                >
                    {/* Defs for gradients and filters */}
                    <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        {metrics.map((m, i) => (
                            <linearGradient key={`grad-${i}`} id={`arcGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={m.color} stopOpacity="1" />
                                <stop offset="100%" stopColor={m.color} stopOpacity="0.6" />
                            </linearGradient>
                        ))}
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={scoreColors.gradient[0]} />
                            <stop offset="100%" stopColor={scoreColors.gradient[1]} />
                        </linearGradient>
                    </defs>

                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="92"
                        fill="none"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="4"
                    />

                    {/* Background tracks */}
                    {metrics.map((metric, i) => {
                        const config = arcConfigs[i]
                        return (
                            <path
                                key={`bg-${i}`}
                                d={createArc(config.start, config.end, config.radius)}
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth={10}
                                strokeLinecap="round"
                            />
                        )
                    })}

                    {/* Filled arcs with spring animation */}
                    {metrics.map((metric, i) => {
                        const config = arcConfigs[i]
                        const arcRange = config.end - config.start
                        const arcLength = config.start + (metric.value / 100) * arcRange
                        return (
                            <motion.path
                                key={`arc-${i}`}
                                d={createArc(config.start, arcLength, config.radius)}
                                fill="none"
                                stroke={`url(#arcGrad${i})`}
                                strokeWidth={10}
                                strokeLinecap="round"
                                filter="url(#glow)"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={isLoaded ? { pathLength: 1, opacity: 1 } : {}}
                                transition={{
                                    type: 'spring',
                                    stiffness: 40,
                                    damping: 15,
                                    delay: i * 0.15,
                                }}
                            />
                        )
                    })}

                    {/* Inner sparkline ring */}
                    {history.length > 0 && (
                        <foreignObject x="35" y="65" width="130" height="30">
                            <Sparkline data={history.slice(0, 14).reverse()} color={scoreColors.primary} className="w-full h-full opacity-40" />
                        </foreignObject>
                    )}
                </motion.svg>

                {/* Center content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <AnimatedScore value={finalScore} color={scoreColors.primary} />
                    <motion.span
                        className="text-xs text-zinc-500 uppercase tracking-widest mt-1"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        Soul Velocity
                    </motion.span>

                    {/* Formula info button */}
                    <motion.button
                        className="mt-2 p-1 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
                        onClick={() => setShowTooltip(!showTooltip)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Info size={14} className="text-zinc-600" />
                    </motion.button>
                </div>
            </div>

            {/* Formula tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl min-w-[280px]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-violet-400" />
                            <span className="text-xs text-zinc-400 font-mono">THE FORMULA</span>
                        </div>
                        <code className="text-xs text-violet-300 block mb-3 bg-black/30 p-2 rounded font-mono">
                            SV = (0.4×D + 0.4×L + 0.2×R) × recency × streak
                        </code>
                        <div className="space-y-1 text-[10px] text-zinc-500">
                            <p><span className="text-violet-400">D</span> = Depth (commit complexity)</p>
                            <p><span className="text-blue-400">L</span> = Learning (exploration)</p>
                            <p><span className="text-amber-400">R</span> = Risk (experimentation)</p>
                        </div>
                        <button
                            className="mt-3 text-[10px] text-zinc-600 hover:text-zinc-400"
                            onClick={() => setShowTooltip(false)}
                        >
                            tap to close
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Metric bars */}
            <div className="mt-6 space-y-3">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        className="group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 100 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <metric.icon size={14} style={{ color: metric.color }} />
                                <span className="text-sm text-zinc-400">{metric.label}</span>
                                <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {metric.description}
                                </span>
                            </div>
                            <span className="text-sm font-mono text-white font-semibold">{metric.value}</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full relative"
                                style={{
                                    background: `linear-gradient(90deg, ${metric.color}, ${metric.color}99)`,
                                    boxShadow: `0 0 10px ${metric.color}50`,
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 50,
                                    damping: 15,
                                    delay: 0.4 + i * 0.1,
                                }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Motivational quote */}
            <motion.div
                className="mt-6 pt-4 border-t border-white/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <p className="text-sm text-zinc-500 italic text-center">"{quote}"</p>
            </motion.div>
        </div>
    )
}

// Compact version for dashboard
export function SoulVelocityCompact({ depth, learning, risk, className }: SoulVelocityProps) {
    const combined = Math.round(depth * 0.4 + learning * 0.4 + risk * 0.2)
    const colors = getScoreColor(combined)

    return (
        <motion.div
            className={`flex items-center gap-4 ${className}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex items-center gap-2">
                <TrendingUp style={{ color: colors.primary }} size={18} />
                <span className="text-sm text-zinc-400">Soul Velocity</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="text-2xl font-mono font-bold" style={{ color: colors.primary }}>{combined}</span>
                <span className="text-xs text-zinc-500">/100</span>
            </div>
            {/* Mini arc indicators */}
            <div className="flex gap-1 ml-2">
                {[
                    { value: depth, color: '#8B5CF6' },
                    { value: learning, color: '#3B82F6' },
                    { value: risk, color: '#F59E0B' },
                ].map((m, i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: m.color }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, opacity: m.value / 100 }}
                        transition={{ delay: i * 0.1 }}
                    />
                ))}
            </div>
        </motion.div>
    )
}
