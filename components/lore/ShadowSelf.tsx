'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Ghost, GitCommit, GitPullRequest, Eye } from 'lucide-react'
import { SPRINGS } from '@/lib/motion'
import { AliveCard } from '@/components/ui/AliveCard'

interface ShadowData {
    shipped: { commits: number; prs: number; reviews: number }
    shadow: { commits: number; prs: number; reviews: number }
    realization: { commits: number; prs: number; reviews: number; overall: number }
    message: string
    daysSinceJoin: number
}

interface ShadowSelfProps {
    className?: string
}

export function ShadowSelf({ className }: ShadowSelfProps) {
    const [data, setData] = useState<ShadowData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchShadow() {
            try {
                const res = await fetch('/api/user/shadow-self')
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (err) {
                console.error('Shadow self fetch failed:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchShadow()
    }, [])

    if (isLoading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-48 bg-white/5 rounded-3xl" />
            </div>
        )
    }

    if (!data) return null

    const metrics = [
        { label: 'Commits', shipped: data.shipped.commits, shadow: data.shadow.commits, icon: GitCommit, color: '#8B5CF6' },
        { label: 'PRs', shipped: data.shipped.prs, shadow: data.shadow.prs, icon: GitPullRequest, color: '#3B82F6' },
        { label: 'Reviews', shipped: data.shipped.reviews, shadow: data.shadow.reviews, icon: Eye, color: '#10B981' },
    ]

    return (
        <AliveCard className={`p-6 ${className}`} glass>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Ghost className="text-zinc-600" size={24} />
                    </motion.div>
                    <div>
                        <h3 className="font-heading font-semibold text-white">Shadow Self</h3>
                        <p className="text-xs text-zinc-500">The version that never shipped</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-mono font-bold text-white">
                        {Math.round(data.realization.overall * 100)}%
                    </span>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Realized</p>
                </div>
            </div>

            {/* Comparison Bars */}
            <div className="space-y-4">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <metric.icon size={14} style={{ color: metric.color }} />
                                <span className="text-xs text-zinc-400">{metric.label}</span>
                            </div>
                            <div className="text-xs font-mono">
                                <span className="text-white">{metric.shipped}</span>
                                <span className="text-zinc-600"> / </span>
                                <span className="text-zinc-500">{metric.shadow}</span>
                            </div>
                        </div>

                        {/* Bar container */}
                        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                            {/* Shadow (potential) - dimmer, behind */}
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full opacity-20"
                                style={{ backgroundColor: metric.color }}
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={SPRINGS.fluid}
                            />
                            {/* Shipped (actual) - brighter, front */}
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{ backgroundColor: metric.color }}
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.min(100, (metric.shipped / Math.max(metric.shadow, 1)) * 100)}%`
                                }}
                                transition={{ ...SPRINGS.fluid, delay: 0.2 }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Message */}
            <motion.p
                className="text-xs text-zinc-500 mt-6 text-center italic border-t border-white/5 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                "{data.message}"
            </motion.p>
        </AliveCard>
    )
}
