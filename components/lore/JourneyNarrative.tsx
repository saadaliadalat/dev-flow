'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Scroll, RefreshCw, Sparkles, Loader2 } from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'
import { SPRINGS } from '@/lib/motion'

interface NarrativeData {
    narrative: string
    haiku: string | null
    stats: {
        daysSinceJoin: number
        totalCommits: number
        totalRepos: number
        languages: number
    }
    generatedAt: string
}

export function JourneyNarrative({ className }: { className?: string }) {
    const [data, setData] = useState<NarrativeData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchNarrative = async () => {
        try {
            const res = await fetch('/api/lore/narrative', { credentials: 'include' })
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (err) {
            console.error('Narrative fetch failed:', err)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchNarrative()
    }, [])

    const handleRefresh = () => {
        setIsRefreshing(true)
        fetchNarrative()
    }

    if (isLoading) {
        return (
            <AliveCard className={`p-6 ${className}`} glass>
                <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
            </AliveCard>
        )
    }

    return (
        <AliveCard className={`p-6 relative overflow-hidden group ${className}`} glass>
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <Scroll className="text-amber-500" size={20} />
                    <h2 className="font-heading font-semibold text-white">Your Journey</h2>
                </div>
                <motion.button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                </motion.button>
            </div>

            {/* Narrative */}
            <motion.p
                className="text-zinc-300 italic leading-relaxed relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRINGS.fluid}
                key={data?.generatedAt}
            >
                "{data?.narrative}"
            </motion.p>

            {/* Haiku warning (if present) */}
            {data?.haiku && (
                <motion.div
                    className="mt-4 pt-4 border-t border-white/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={12} className="text-violet-400" />
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Whispered Haiku</span>
                    </div>
                    <p className="text-xs text-zinc-500 italic whitespace-pre-line font-mono">
                        {data.haiku}
                    </p>
                </motion.div>
            )}

            {/* Stats footer */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 relative z-10">
                {[
                    { label: 'Days', value: data?.stats.daysSinceJoin || 0 },
                    { label: 'Commits', value: data?.stats.totalCommits || 0 },
                    { label: 'Repos', value: data?.stats.totalRepos || 0 },
                    { label: 'Languages', value: data?.stats.languages || 0 },
                ].map(stat => (
                    <div key={stat.label} className="text-center">
                        <p className="text-lg font-mono font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>
        </AliveCard>
    )
}
