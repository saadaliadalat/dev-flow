'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Star, GitCommit, Activity, Eye, RefreshCw } from 'lucide-react'
import { Constellation } from '@/components/lore/ConstellationGraph'
import { AliveCard } from '@/components/ui/AliveCard'

interface ConstellationNode {
    id: string
    name: string
    fullName: string
    language: string
    commits: number
    stars: number
    forks: number
    mass: number
    brightness: number
    daysSinceCommit: number
}

interface ConstellationEdge {
    source: string
    target: string
    language: string
    strength: number
}

interface ConstellationData {
    nodes: ConstellationNode[]
    edges: ConstellationEdge[]
    stats: {
        totalStars: number
        totalCommits: number
        uniqueLanguages: number
        activeRepos: number
        dimEmbers: number
    }
}

export default function ConstellationPage() {
    const [data, setData] = useState<ConstellationData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/constellation')
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to fetch')
            }
            const json = await res.json()
            setData(json)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-violet-400" />
                        Your Constellation
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Every repo is a star. Their light fades with inactivity.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={isLoading}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Bar */}
            {data && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-5 gap-4"
                >
                    <StatCard
                        icon={<Star size={16} className="text-amber-400" />}
                        label="Total Stars"
                        value={data.stats.totalStars}
                    />
                    <StatCard
                        icon={<GitCommit size={16} className="text-violet-400" />}
                        label="Commits"
                        value={data.stats.totalCommits}
                    />
                    <StatCard
                        icon={<Activity size={16} className="text-emerald-400" />}
                        label="Languages"
                        value={data.stats.uniqueLanguages}
                    />
                    <StatCard
                        icon={<Sparkles size={16} className="text-cyan-400" />}
                        label="Active Stars"
                        value={data.stats.activeRepos}
                        highlight
                    />
                    <StatCard
                        icon={<Eye size={16} className="text-zinc-500" />}
                        label="Dim Embers"
                        value={data.stats.dimEmbers}
                        muted
                    />
                </motion.div>
            )}

            {/* Constellation View */}
            <AliveCard className="overflow-hidden" glass>
                {isLoading ? (
                    <div className="h-[500px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            >
                                <Sparkles size={32} className="text-violet-400" />
                            </motion.div>
                            <p className="text-zinc-500 text-sm">Mapping your stars...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="h-[500px] flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-red-400 mb-2">{error}</p>
                            <button onClick={fetchData} className="btn-secondary">
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : data ? (
                    <Constellation
                        nodes={data.nodes}
                        edges={data.edges}
                        width={900}
                        height={500}
                        className="w-full"
                    />
                ) : null}
            </AliveCard>

            {/* Info */}
            <div className="text-center text-xs text-zinc-600 max-w-lg mx-auto">
                <p>
                    Stars pulse when recently active. Connections form between repos sharing languages.
                    The brighter the core, the more alive your project.
                </p>
            </div>
        </motion.div>
    )
}

function StatCard({
    icon,
    label,
    value,
    highlight = false,
    muted = false
}: {
    icon: React.ReactNode
    label: string
    value: number
    highlight?: boolean
    muted?: boolean
}) {
    return (
        <div className={`p-4 rounded-xl border ${highlight
                ? 'bg-cyan-500/5 border-cyan-500/20'
                : muted
                    ? 'bg-zinc-800/30 border-zinc-700/30'
                    : 'bg-white/5 border-white/10'
            }`}>
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-xs text-zinc-500">{label}</span>
            </div>
            <span className={`text-xl font-bold font-mono ${highlight ? 'text-cyan-400' : muted ? 'text-zinc-500' : 'text-white'
                }`}>
                {value.toLocaleString()}
            </span>
        </div>
    )
}
