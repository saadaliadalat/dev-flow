'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, BookOpen, Flame, TrendingUp } from 'lucide-react'
import { SPRINGS } from '@/lib/motion'

interface SoulVelocityProps {
    depth: number      // 0-100
    learning: number   // 0-100
    risk: number       // 0-100
    combined?: number  // 0-100 (calculated if not provided)
    className?: string
}

export function SoulVelocityGauge({ depth, learning, risk, combined, className }: SoulVelocityProps) {
    const calculatedCombined = combined ?? Math.round(depth * 0.3 + learning * 0.4 + risk * 0.3)

    const metrics = [
        { label: 'Depth', value: depth, color: '#8B5CF6', icon: Zap, description: 'Focus on mastery' },
        { label: 'Learning', value: learning, color: '#3B82F6', icon: BookOpen, description: 'New patterns acquired' },
        { label: 'Risk', value: risk, color: '#F59E0B', icon: Flame, description: 'Creative courage' },
    ]

    // SVG arc path generator
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

    // Arc segments: 120 degrees each
    const arcConfigs = [
        { start: 0, radius: 85 },    // Depth (outer)
        { start: 120, radius: 70 },  // Learning (middle)
        { start: 240, radius: 55 },  // Risk (inner)
    ]

    return (
        <div className={`relative ${className}`}>
            {/* SVG Gauge */}
            <svg viewBox="0 0 200 200" className="w-full h-auto max-w-[280px] mx-auto">
                {/* Background tracks */}
                {metrics.map((metric, i) => {
                    const config = arcConfigs[i]
                    return (
                        <path
                            key={`bg-${i}`}
                            d={createArc(config.start, config.start + 120, config.radius)}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={8}
                            strokeLinecap="round"
                        />
                    )
                })}

                {/* Filled arcs */}
                {metrics.map((metric, i) => {
                    const config = arcConfigs[i]
                    const arcLength = (metric.value / 100) * 120
                    return (
                        <motion.path
                            key={`arc-${i}`}
                            d={createArc(config.start, config.start + arcLength, config.radius)}
                            fill="none"
                            stroke={metric.color}
                            strokeWidth={8}
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                filter: `drop-shadow(0 0 8px ${metric.color}50)`,
                            }}
                        />
                    )
                })}

                {/* Center Score */}
                <text
                    x="100"
                    y="95"
                    textAnchor="middle"
                    className="fill-white font-mono text-3xl font-bold"
                >
                    {calculatedCombined}
                </text>
                <text
                    x="100"
                    y="115"
                    textAnchor="middle"
                    className="fill-zinc-500 text-xs uppercase tracking-wider"
                >
                    Soul Velocity
                </text>
            </svg>

            {/* Legend */}
            <div className="mt-6 space-y-3">
                {metrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <metric.icon size={14} style={{ color: metric.color }} />
                            <span className="text-sm text-zinc-400">{metric.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: metric.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metric.value}%` }}
                                    transition={SPRINGS.fluid}
                                />
                            </div>
                            <span className="text-sm font-mono text-white w-8 text-right">{metric.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Compact version for dashboard
export function SoulVelocityCompact({ depth, learning, risk, className }: SoulVelocityProps) {
    const combined = Math.round(depth * 0.3 + learning * 0.4 + risk * 0.3)

    return (
        <motion.div
            className={`flex items-center gap-4 ${className}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex items-center gap-2">
                <TrendingUp className="text-violet-500" size={18} />
                <span className="text-sm text-zinc-400">Soul Velocity</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="text-2xl font-mono font-bold text-white">{combined}</span>
                <span className="text-xs text-zinc-500">/100</span>
            </div>
            {/* Mini indicators */}
            <div className="flex gap-1 ml-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8B5CF6', opacity: depth / 100 }} title="Depth" />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6', opacity: learning / 100 }} title="Learning" />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B', opacity: risk / 100 }} title="Risk" />
            </div>
        </motion.div>
    )
}
