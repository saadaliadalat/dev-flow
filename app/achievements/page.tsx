'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { containerVariants, itemVariants } from '@/lib/animations'
import { Trophy, Lock, Star, Zap, GitCommit, Calendar, Clock, Code } from 'lucide-react'
import { supabaseBrowser as supabase } from '@/lib/supabase-browser'
import { Navbar } from '@/components/landing/Navbar'
import { useSession } from 'next-auth/react'

export default function AchievementsPage() {
    const { data: session } = useSession()
    const [achievements, setAchievements] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchAchievements() {
            if (!session?.user?.id) return

            // 1. Get all standardized achievements
            // Note: In a real DB we'd have an 'achievements_def' table. 
            // For now, I'll hardcode the definitions and check which ones the user has unlocked in 'user_achievements'

            // Mock definitions for the UI
            const definitions = [
                { id: 'first_commit', title: 'Hello World', description: 'Make your first commit', icon: GitCommit, tier: 'bronze' },
                { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: Flame, tier: 'silver' },
                { id: 'streak_30', title: 'Unstoppable', description: 'Maintain a 30-day streak', icon: Zap, tier: 'gold' },
                { id: 'commits_100', title: 'Centurion', description: 'Reach 100 total commits', icon: Trophy, tier: 'silver' },
                { id: 'commits_1000', title: 'Kilo-committer', description: 'Reach 1,000 total commits', icon: Trophy, tier: 'platinum' },
                { id: 'night_owl', title: 'Night Owl', description: 'Commit between 12 AM and 4 AM', icon: Moon, tier: 'bronze' },
                { id: 'early_bird', title: 'Early Bird', description: 'Commit between 5 AM and 8 AM', icon: Sun, tier: 'bronze' },
                { id: 'weekend_warrior', title: 'Weekend Warrior', description: 'Code on 4 consecutive weekends', icon: Calendar, tier: 'silver' },
            ]

            // 2. Get user's unlocked achievements
            // NOTE: We need to resolve the user's DB ID first if session.user.id is GitHub ID.
            // Simplified for now:
            const { data: user } = await supabase.from('users').select('id').eq('email', session.user.email).single()

            if (user) {
                const { data: unlocked } = await supabase
                    .from('achievements') // Assuming this table links users to achievements
                    .select('achievement_type, unlocked_at')
                    .eq('user_id', user.id)

                const unlockedSet = new Set(unlocked?.map(u => u.achievement_type))

                const merged = definitions.map(def => ({
                    ...def,
                    unlocked: unlockedSet.has(def.id),
                    unlockedAt: unlocked?.find(u => u.achievement_type === def.id)?.unlocked_at
                }))

                setAchievements(merged)
            }
            setIsLoading(false)
        }

        if (session) fetchAchievements()
    }, [session])

    // Icon Mapping Helpers (need to import these if valid)
    const Flame = ({ className }: { className?: string }) => <span className={className}>🔥</span>
    const Moon = ({ className }: { className?: string }) => <span className={className}>🌙</span>
    const Sun = ({ className }: { className?: string }) => <span className={className}>☀️</span>

    return (
        <div className="min-h-screen bg-bg-deep text-white selection:bg-purple-primary/30">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-5xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold font-display mb-4">
                            Your <span className="text-transparent bg-clip-text bg-gradient-primary">Hall of Fame</span>
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-zinc-400 max-w-xl mx-auto">
                            Badges won through consistency, volume, and pure coding dedication.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {achievements.map((achievement, i) => (
                            <motion.div
                                key={achievement.id}
                                variants={itemVariants}
                                className={`relative group p-6 rounded-2xl border transition-all duration-300 ${achievement.unlocked
                                        ? 'bg-gradient-to-br from-white/5 to-white/0 border-white/10 hover:border-purple-primary/50'
                                        : 'bg-black/40 border-white/5 opacity-60 grayscale'
                                    }`}
                            >
                                <div className="absolute top-4 right-4">
                                    {achievement.unlocked ? (
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    ) : (
                                        <Lock size={14} className="text-zinc-600" />
                                    )}
                                </div>

                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl ${achievement.unlocked ? 'bg-purple-primary/20 text-purple-primary' : 'bg-white/5 text-zinc-600'
                                    }`}>
                                    <achievement.icon size={24} />
                                </div>

                                <h3 className={`font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                                    {achievement.title}
                                </h3>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    {achievement.description}
                                </p>

                                {achievement.unlocked && achievement.unlockedAt && (
                                    <p className="mt-4 text-[10px] font-mono text-purple-400/80 uppercase tracking-widest">
                                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
