'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Zap, Brain, Code2, Globe, Calendar, ArrowRight,
    TrendingUp, Activity, Layers, Sparkles
} from 'lucide-react'
import { PremiumStatCard } from '@/components/dashboard/PremiumStatCard'
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart'
import { ActivityHeatmap } from '@/components/analytics/ActivityHeatmap'
import { LanguageDNA } from '@/components/analytics/LanguageDNA'

// Mock Data for "God Level" Demo
const productivityData = Array.from({ length: 30 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 50) + 50 + (i * 2), // Upward trend
}))

const heatmapData = Array.from({ length: 365 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (364 - i))
    return {
        date: date.toISOString().split('T')[0],
        count: Math.random() > 0.3 ? Math.floor(Math.random() * 15) : 0
    }
})

const languageData = [
    { name: 'TypeScript', percentage: 45, color: '#3178C6' },
    { name: 'Python', percentage: 25, color: '#3776AB' },
    { name: 'Rust', percentage: 15, color: '#DEA584' },
    { name: 'Go', percentage: 10, color: '#00ADD8' },
    { name: 'Other', percentage: 5, color: '#6e7681' },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }
    }
}

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30')

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 p-1" // minimal padding fix
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-3">
                        <Sparkles size={12} />
                        <span>God Mode Active</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Deep Analytics
                        <span className="text-zinc-500 font-normal text-2xl">/</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                            Overview
                        </span>
                    </h1>
                    <p className="text-zinc-400 mt-2 max-w-lg">
                        Real-time insights into your coding velocity, cognitive load, and architectural impact.
                    </p>
                </div>

                <div className="flex bg-[var(--bg-elevated)] p-1 rounded-lg border border-white/5">
                    {(['7', '30', '90'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === range
                                    ? 'bg-[var(--accent-purple)] text-white shadow-lg shadow-purple-900/20'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {range}d
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* KPI Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <PremiumStatCard
                    label="Focus Score"
                    value={92}
                    suffix="/100"
                    change={4.5}
                    icon={<Brain size={18} />}
                    accentColor="purple"
                    sparklineData={[60, 65, 78, 85, 82, 90, 92]}
                />
                <PremiumStatCard
                    label="Deep Work Hours"
                    value={48}
                    suffix="h"
                    change={12}
                    icon={<Zap size={18} />}
                    accentColor="blue"
                    sparklineData={[20, 35, 40, 48]}
                />
                <PremiumStatCard
                    label="Lines of Code"
                    value={12450}
                    change={-2.3}
                    icon={<Code2 size={18} />}
                    accentColor="emerald"
                />
                <PremiumStatCard
                    label="Global Impact"
                    value={850}
                    suffix="k"
                    icon={<Globe size={18} />}
                    accentColor="amber"
                />
            </motion.div>

            {/* Main Chart Area */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 premium-card p-6 min-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Activity size={18} className="text-purple-400" />
                                Productivity Velocity
                            </h2>
                            <p className="text-sm text-zinc-500">Lines of code vs. complexity impact</p>
                        </div>
                    </div>
                    <div className="flex-1">
                        <AnalyticsChart
                            data={productivityData}
                            dataKey="value"
                            xAxisKey="name"
                            height={320}
                        />
                    </div>
                </div>

                {/* Language DNA */}
                <div className="premium-card p-6 flex flex-col">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Layers size={18} className="text-blue-400" />
                        Code DNA
                    </h2>
                    <div className="flex-1 flex flex-col justify-center">
                        <LanguageDNA data={languageData} />

                        <div className="mt-6 space-y-3">
                            {languageData.map((lang, i) => (
                                <div key={lang.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: lang.color }} />
                                        <span className="text-zinc-300">{lang.name}</span>
                                    </div>
                                    <span className="text-zinc-500 font-mono">{lang.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Heatmap Section */}
            <motion.div variants={itemVariants} className="premium-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-400" />
                        Activity Matrix
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-[var(--bg-elevated)]" />
                            <div className="w-3 h-3 rounded-sm bg-purple-900/40" />
                            <div className="w-3 h-3 rounded-sm bg-purple-700/60" />
                            <div className="w-3 h-3 rounded-sm bg-purple-500/80" />
                            <div className="w-3 h-3 rounded-sm bg-purple-400" />
                        </div>
                        <span>More</span>
                    </div>
                </div>
                <div className="w-full overflow-x-auto pb-2">
                    <div className="min-w-[800px]">
                        <ActivityHeatmap data={heatmapData} />
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                        * Activity heatmap includes code commits, reviews, and architectural planning.
                    </p>
                    <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                        View Detailed Log <ArrowRight size={12} />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}
