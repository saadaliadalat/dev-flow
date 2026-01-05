'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { containerVariants, itemVariants } from '@/lib/animations'
import { Trophy, Medal, Flame, Search } from 'lucide-react'
import { supabaseBrowser as supabase } from '@/lib/supabase-browser'
import { Navbar } from '@/components/landing/Navbar'

export default function LeaderboardPage() {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchLeaderboard() {
            // Fetch users ordered by productivity_score descending
            const { data } = await supabase
                .from('users')
                .select('id, name, username, avatar_url, productivity_score, total_commits, current_streak')
                .order('productivity_score', { ascending: false })
                .limit(50)

            if (data) setUsers(data)
            setIsLoading(false)
        }
        fetchLeaderboard()
    }, [])

    return (
        <div className="min-h-screen bg-bg-deep text-white selection:bg-purple-primary/30">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold font-display mb-4">
                            Global <span className="text-transparent bg-clip-text bg-gradient-primary">Leaderboard</span>
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-zinc-400 max-w-xl mx-auto">
                            The top 1% of developers building the future. Compete, climb the ranks, and prove your coding prowess.
                        </motion.p>
                    </div>

                    <GlassCard className="overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                            <div className="col-span-1 text-center">Rank</div>
                            <div className="col-span-6 md:col-span-5">Developer</div>
                            <div className="col-span-2 text-center hidden md:block">Streak</div>
                            <div className="col-span-2 text-center hidden md:block">Commits</div>
                            <div className="col-span-3 md:col-span-2 text-right">Score</div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-white/5">
                            {isLoading ? (
                                // Skeleton Loading
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                                        <div className="w-8 h-8 bg-white/10 rounded-full" />
                                        <div className="flex-1 h-4 bg-white/5 rounded" />
                                    </div>
                                ))
                            ) : users.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                    No data available yet. Be the first to join!
                                </div>
                            ) : (
                                users.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        variants={itemVariants}
                                        className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="col-span-1 text-center font-bold font-mono">
                                            {index === 0 && <span className="text-yellow-400 text-xl">🥇</span>}
                                            {index === 1 && <span className="text-zinc-400 text-xl">🥈</span>}
                                            {index === 2 && <span className="text-amber-700 text-xl">🥉</span>}
                                            {index > 2 && <span className="text-zinc-500">#{index + 1}</span>}
                                        </div>

                                        <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10 group-hover:border-purple-primary/50 transition-colors">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                                                        {user.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-purple-400 transition-colors">
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-zinc-500 font-mono">
                                                    @{user.username || 'dev'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-center hidden md:flex items-center justify-center gap-1 text-zinc-400">
                                            <Flame size={14} className={user.current_streak > 0 ? "text-orange-500" : "text-zinc-700"} />
                                            <span className="font-mono">{user.current_streak}</span>
                                        </div>

                                        <div className="col-span-2 text-center hidden md:block text-zinc-400 font-mono">
                                            {user.total_commits?.toLocaleString()}
                                        </div>

                                        <div className="col-span-3 md:col-span-2 text-right">
                                            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono font-bold text-white">
                                                {user.productivity_score}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </main>
        </div>
    )
}
