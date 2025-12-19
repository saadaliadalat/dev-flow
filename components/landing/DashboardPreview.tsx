'use client'

import { motion } from 'framer-motion'
import { GitCommit, GitPullRequest, Flame, TrendingUp, Activity } from 'lucide-react'

export function DashboardPreview() {
    return (
        <div className="relative w-full max-w-[1200px] mx-auto perspective-[2000px]">
            {/* Glow Behind */}
            <div className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />

            <motion.div
                initial={{ rotateX: 20, rotateY: 0, opacity: 0, y: 100 }}
                whileInView={{ rotateX: 20, rotateY: 0, opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#09090b] to-[#18181b] border border-zinc-500/20 shadow-2xl relative"
            >
                {/* Top Bar */}
                <div className="h-12 border-b border-purple-500/10 bg-purple-500/5 backdrop-blur-xl flex items-center justify-between px-6">
                    <div className="text-white font-semibold flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-purple-500/20 flex items-center justify-center">
                            <Activity size={10} className="text-purple-400" />
                        </span>
                        DevFlow
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-600/50" />
                        <div className="w-3 h-3 rounded-full bg-zinc-600/50" />
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100%-48px)]">

                    {/* Productivity Score Card */}
                    <div className="col-span-1 md:col-span-1 p-6 rounded-xl bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/30 flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full group-hover:bg-purple-500/30 transition-colors" />
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
                            { label: 'Commits', value: '247', icon: GitCommit, color: 'text-purple-400' },
                            { label: 'Pull Requests', value: '42', icon: GitPullRequest, color: 'text-indigo-400' },
                            { label: 'Streak Days', value: '15', icon: Flame, color: 'text-orange-400' }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-colors group">
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
                        <div className="col-span-1 sm:col-span-3 p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col justify-center">
                            <div className="text-white font-medium mb-4 flex items-center justify-between">
                                <span>Activity Heatmap</span>
                                <span className="text-xs text-zinc-500">Last 12 Months</span>
                            </div>
                            <div className="flex gap-1 h-32 w-full overflow-hidden mask-gradient-right">
                                {Array.from({ length: 50 }).map((_, colIndex) => (
                                    <div key={colIndex} className="flex flex-col gap-1 flex-1">
                                        {Array.from({ length: 7 }).map((_, rowIndex) => {
                                            const opacity = Math.random();
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-[scan_4s_ease-in-out_infinite] pointer-events-none" />
            </motion.div>

            <style jsx global>{`
                @keyframes scan {
                    0%, 100% { transform: translateY(-100%); }
                    50% { transform: translateY(100%); }
                }
                .mask-gradient-right {
                    mask-image: linear-gradient(to right, black 80%, transparent 100%);
                }
            `}</style>
        </div>
    )
}
