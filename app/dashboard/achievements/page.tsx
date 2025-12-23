'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Lock, Zap, Code, GitCommit, Bug, Coffee, Rocket, Star, Shield, Target, Flame } from 'lucide-react'

// Achievement Data
const achievements = [
    {
        id: 'first-commit',
        title: 'First Commit',
        description: 'Pushed your first code to the repository.',
        icon: GitCommit,
        unlocked: true,
        date: '2024-01-10'
    },
    {
        id: 'bug-hunter',
        title: 'Bug Hunter',
        description: 'Resolved 10 critical issues.',
        icon: Bug,
        unlocked: true,
        date: '2024-03-15'
    },
    {
        id: 'midnight-coder',
        title: 'Midnight Coder',
        description: 'Committed code between 2 AM and 5 AM.',
        icon: Coffee,
        unlocked: true,
        date: '2024-02-20'
    },
    {
        id: '10x-engineer',
        title: '10x Engineer',
        description: 'Maintained a productivity score of 95+ for a week.',
        icon: Zap,
        unlocked: false,
    },
    {
        id: 'ship-it',
        title: 'Ship It!',
        description: 'Deployed to production 5 times in one day.',
        icon: Rocket,
        unlocked: false,
    },
    {
        id: 'clean-code',
        title: 'Clean Code',
        description: 'Passed 50 PR reviews without comments.',
        icon: Shield,
        unlocked: false,
    },
    {
        id: 'streak-master',
        title: 'Streak Master',
        description: ' coded for 30 consecutive days.',
        icon: Flame,
        unlocked: true,
        date: '2024-04-01'
    },
    {
        id: 'goal-crusher',
        title: 'Goal Crusher',
        description: 'Completed 5 active directives.',
        icon: Target,
        unlocked: false,
    },
    {
        id: 'star-struck',
        title: 'Star Struck',
        description: 'Received 100 stars on your repositories.',
        icon: Star,
        unlocked: false,
    },
    {
        id: 'polyglot',
        title: 'Polyglot',
        description: 'Contributed in 5 different languages.',
        icon: Code,
        unlocked: false,
    }
]

export default function AchievementsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Achievements</h1>
                <p className="text-[var(--text-tertiary)]">Unlock badges by mastering your workflow.</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {achievements.map((achievement, i) => {
                    const Icon = achievement.icon

                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`aspect-square relative group rounded-2xl flex flex-col items-center justify-center p-4 text-center border transition-all duration-300 ${achievement.unlocked
                                    ? 'bg-zinc-900 border-purple-500/30 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] hover:border-purple-500/50'
                                    : 'bg-zinc-950 border-zinc-900 opacity-50 grayscale'
                                }`}
                        >
                            {/* Inner Glow for Unlocked */}
                            {achievement.unlocked && (
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}

                            {/* Icon Container */}
                            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${achievement.unlocked
                                    ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-inner'
                                    : 'bg-zinc-900'
                                }`}>
                                <Icon size={24} className={achievement.unlocked ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-zinc-600'} />
                                {!achievement.unlocked && (
                                    <div className="absolute -top-1 -right-1 bg-zinc-950 rounded-full p-1 border border-zinc-800">
                                        <Lock size={10} className="text-zinc-500" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <h3 className={`text-sm font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                                {achievement.title}
                            </h3>
                            <p className="text-[10px] text-zinc-500 leading-tight line-clamp-2">
                                {achievement.description}
                            </p>

                            {/* Unlocked Date */}
                            {achievement.unlocked && achievement.date && (
                                <span className="absolute bottom-3 text-[9px] text-zinc-600 font-mono">
                                    {achievement.date}
                                </span>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
