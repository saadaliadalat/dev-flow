'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Target, TrendingUp, Award, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PersonalGoalsProps {
    todayCommits: number
    weekCommits: number
    currentStreak: number
}

export function PersonalGoals({ todayCommits, weekCommits, currentStreak }: PersonalGoalsProps) {
    const [goals, setGoals] = useState({ dailyGoal: 3, weeklyGoal: 15 })

    useEffect(() => {
        const saved = localStorage.getItem('devflow_goals')
        if (saved) {
            setGoals(JSON.parse(saved))
        }
    }, [])

    const dailyProgress = Math.min((todayCommits / goals.dailyGoal) * 100, 100)
    const weeklyProgress = Math.min((weekCommits / goals.weeklyGoal) * 100, 100)

    return (
        <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-white" />
                <h3 className="font-bold text-white">Your Goals</h3>
            </div>

            <div className="space-y-5">
                {/* Daily Goal */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-400">Today's Commits</span>
                        <span className="text-sm font-mono text-white">
                            {todayCommits}/{goals.dailyGoal}
                        </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${dailyProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${dailyProgress >= 100 ? 'bg-emerald-500' : 'bg-white'
                                }`}
                        />
                    </div>
                    {dailyProgress >= 100 && (
                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Daily goal achieved! 🎉
                        </p>
                    )}
                </div>

                {/* Weekly Goal */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-400">This Week</span>
                        <span className="text-sm font-mono text-white">
                            {weekCommits}/{goals.weeklyGoal}
                        </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${weeklyProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                            className={`h-full rounded-full ${weeklyProgress >= 100 ? 'bg-emerald-500' : 'bg-zinc-400'
                                }`}
                        />
                    </div>
                </div>

                {/* Streak */}
                <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                <span className="text-lg">🔥</span>
                            </div>
                            <div>
                                <span className="text-sm text-zinc-400">Current Streak</span>
                                <p className="text-xl font-bold text-white">{currentStreak} days</p>
                            </div>
                        </div>
                        <Calendar className="w-5 h-5 text-zinc-600" />
                    </div>
                </div>
            </div>
        </GlassCard>
    )
}
