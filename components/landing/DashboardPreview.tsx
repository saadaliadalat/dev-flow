'use client'

import React, { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import { GitCommit, GitPullRequest, Flame, TrendingUp, Activity } from 'lucide-react'

export function DashboardPreview() {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"]
    })

    const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 1])

    return (
        <div ref={ref} className="relative w-full max-w-[1200px] mx-auto aspect-[16/9] perspective-1000 mb-20">
            {/* Glow Behind */}
            <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full opacity-30 pointer-events-none" />

            <motion.div
                style={{
                    rotateX,
                    scale,
                    opacity,
                    transformStyle: 'preserve-3d'
                }}
                className="w-full h-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative bg-[#09090b]"
            >
                {/* Top Bar */}
                <div className="h-12 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl flex items-center justify-between px-6">
                    <div className="text-white font-semibold flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center">
                            <Activity size={10} className="text-zinc-400" />
                        </span>
                        DevFlow
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100%-48px)]">

                    {/* Productivity Score Card */}
                    <div className="col-span-1 md:col-span-1 p-6 rounded-xl bg-gradient-to-br from-zinc-800/10 to-transparent border border-white/5 flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-colors" />
                        <div className="text-zinc-400 text-sm mb-2 relative z-10">Productivity Score</div>
                        <div className="text-5xl font-bold text-white mb-4 relative z-10 tracking-tight">87</div>
                        <div className="flex items-center gap-2 text-green-400 text-sm relative z-10 font-mono">
                            <TrendingUp className="w-4 h-4" />
                            +12%
                        </div>
                    </div>

                    {/* Stats Cards Column */}
                    <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Commits', value: '247', icon: GitCommit, color: 'text-white' },
                            { label: 'Pull Requests', value: '42', icon: GitPullRequest, color: 'text-indigo-400' },
                            { label: 'Streak Days', value: '15', icon: Flame, color: 'text-orange-400' }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/20 transition-colors group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
                                </div>
                                <div className="text-zinc-500 text-sm">{stat.label}</div>
                            </div>
                        ))}

                        {/* Commit Heatmap - Spanning full width of the 3 cols */}
                        <div className="col-span-1 sm:col-span-3 p-6 rounded-xl bg-zinc-900/40 border border-white/5 flex flex-col justify-center">
                            <div className="text-white font-medium mb-4 flex items-center justify-between">
                                <span>Activity Heatmap</span>
                                <span className="text-xs text-zinc-500">Last 12 Months</span>
                            </div>
                            <div className="flex gap-1 h-32 w-full overflow-hidden">
                                {Array.from({ length: 50 }).map((_, colIndex) => (
                                    <div key={colIndex} className="flex flex-col gap-1 flex-1">
                                        {Array.from({ length: 7 }).map((_, rowIndex) => {
                                            const seed = colIndex * 7 + rowIndex
                                            const opacity = (Math.sin(seed * 9999) + 1) / 2
                                            const isActive = opacity > 0.4;
                                            return (
                                                <div
                                                    key={rowIndex}
                                                    className={`rounded-sm flex-1 transition-all duration-500 hover:scale-110`}
                                                    style={{
                                                        backgroundColor: isActive
                                                            ? (opacity > 0.8 ? '#a855f7' : (opacity > 0.6 ? '#7c3aed' : '#6b21a8'))
                                                            : '#27272a',
                                                        opacity: isActive ? 1 : 0.3
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtle Scan Line */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-[scan_4s_ease-in-out_infinite] pointer-events-none" />
            </motion.div>
        </div>
    )
}
