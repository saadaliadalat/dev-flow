'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Coffee, Zap, Moon } from 'lucide-react'

interface PersonalInsight {
    type: 'tip' | 'achievement' | 'warning' | 'insight'
    title: string
    message: string
    icon: any
}

interface PersonalInsightsProps {
    userName: string
    productivityScore: number
    currentStreak: number
    totalCommits: number
    mostActiveHour?: number
}

export function PersonalInsights({
    userName,
    productivityScore,
    currentStreak,
    totalCommits,
    mostActiveHour = 14
}: PersonalInsightsProps) {
    // Generate personalized insights based on user data
    const insights: PersonalInsight[] = []

    // Productivity insight
    if (productivityScore >= 80) {
        insights.push({
            type: 'achievement',
            title: 'You are on fire!',
            message: `Your productivity score is ${productivityScore}. Top 5% of developers!`,
            icon: Zap
        })
    } else if (productivityScore >= 50) {
        insights.push({
            type: 'insight',
            title: 'Good progress',
            message: `Score: ${productivityScore}. Keep pushing to reach the top tier!`,
            icon: TrendingUp
        })
    }

    // Streak insight
    if (currentStreak >= 7) {
        insights.push({
            type: 'achievement',
            title: 'Week warrior!',
            message: `${currentStreak} day streak! You are building great habits.`,
            icon: Sparkles
        })
    } else if (currentStreak === 0) {
        insights.push({
            type: 'tip',
            title: 'Start a new streak',
            message: 'Make a commit today to start building momentum!',
            icon: Coffee
        })
    }

    // Time-based insight
    if (mostActiveHour >= 22 || mostActiveHour <= 4) {
        insights.push({
            type: 'warning',
            title: 'Night owl detected',
            message: 'You code late at night. Consider your sleep schedule!',
            icon: Moon
        })
    }

    // Add a motivational tip if no other insights
    if (insights.length === 0) {
        insights.push({
            type: 'tip',
            title: `Keep going, ${userName}!`,
            message: 'Every commit counts. Small progress adds up to big results.',
            icon: Sparkles
        })
    }

    const getTypeStyles = (type: PersonalInsight['type']) => {
        switch (type) {
            case 'achievement':
                return 'border-emerald-500/30 bg-emerald-500/10'
            case 'warning':
                return 'border-amber-500/30 bg-amber-500/10'
            case 'tip':
                return 'border-blue-500/30 bg-blue-500/10'
            default:
                return 'border-white/10 bg-white/5'
        }
    }

    const getIconColor = (type: PersonalInsight['type']) => {
        switch (type) {
            case 'achievement':
                return 'text-emerald-400'
            case 'warning':
                return 'text-amber-400'
            case 'tip':
                return 'text-blue-400'
            default:
                return 'text-white'
        }
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Personal Insights
            </h3>

            {insights.map((insight, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-xl border ${getTypeStyles(insight.type)}`}
                >
                    <div className="flex gap-3 items-start">
                        <div className={`mt-0.5 ${getIconColor(insight.type)}`}>
                            <insight.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-white text-sm">{insight.title}</p>
                            <p className="text-zinc-400 text-sm">{insight.message}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
