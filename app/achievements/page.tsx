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
            if (!session?.user) return

            try {
                // Fetch achievements from API (fixes RLS issue)
                const res = await fetch('/api/achievements')
                const data = await res.json()

                if (res.ok && data.achievements) {
                    // Map achievements with icon components
                    const iconMap: Record<string, any> = {
                        '🔥': Flame,
                        '⚡': Zap,
                        '💯': Trophy,
                        '📝': GitCommit,
                        '🚀': GitCommit,
                        '🏆': Trophy,
                        '🦉': Moon,
                        '🌅': Sun,
                        '🌍': Code,
                        '🎮': Calendar,
                        '🔀': GitCommit,
                        '🎯': Star,
                        '👑': Trophy,
                        '🎉': Zap,
                        '📅': Calendar,
                    }

                    const formatted = data.achievements.map((ach: any) => ({
                        id: ach.achievement_key,
                        title: ach.title,
                        description: ach.description,
                        icon: iconMap[ach.icon] || Trophy,
                        tier: ach.tier,
                        unlocked: ach.is_unlocked,
                        unlockedAt: ach.unlocked_at,
                        progress: ach.current_progress,
                        target: ach.target_progress
                    }))

                    setAchievements(formatted)
                } else {
                    console.error('Failed to fetch achievements:', data.error)
                }
            } catch (error) {
                console.error('Error fetching achievements:', error)
            } finally {
                setIsLoading(false)
            }
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

                                {!achievement.unlocked && achievement.progress > 0 && achievement.target && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-[10px] font-mono text-zinc-600 mb-1">
                                            <span>Progress</span>
                                            <span>{achievement.progress}/{achievement.target}</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-primary to-cyan-primary transition-all duration-500"
                                                style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
