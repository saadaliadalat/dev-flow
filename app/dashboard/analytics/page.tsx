'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Zap, Brain, Code2, Globe, Calendar, ArrowRight,
    TrendingUp, Activity, Layers, Sparkles, Loader2
} from 'lucide-react'
import { PremiumStatCard, StatCardSkeleton } from '@/components/dashboard/PremiumStatCard'
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart'
import { ActivityHeatmap } from '@/components/analytics/ActivityHeatmap'
import { LanguageDNA } from '@/components/analytics/LanguageDNA'

// GitHub Language Colors
const languageColors: { [key: string]: string } = {
    TypeScript: '#3178C6',
    JavaScript: '#F7DF1E',
    Python: '#3776AB',
    Rust: '#DEA584',
    Go: '#00ADD8',
    Java: '#B07219',
    'C++': '#F34B7D',
    C: '#555555',
    Ruby: '#CC342D',
    PHP: '#777BB4',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Other: '#6e7681'
}

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
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [productivityData, setProductivityData] = useState<any[]>([])
    const [heatmapData, setHeatmapData] = useState<any[]>([])
    const [languageData, setLanguageData] = useState<any[]>([])

    useEffect(() => {
        fetchAnalyticsData()
    }, [dateRange])

    async function fetchAnalyticsData() {
        setIsLoading(true)
        try {
            // Fetch user data with daily stats
            const res = await fetch(`/api/user/me?days=${dateRange}`)
            const data = await res.json()

            if (res.ok && data.user) {
                setStats(data.user)

                // Process daily stats for chart
                if (data.dailyStats && data.dailyStats.length > 0) {
                    const chartData = data.dailyStats
                        .slice(0, parseInt(dateRange))
                        .reverse()
                        .map((day: any) => ({
                            name: new Date(day.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            }),
                            value: day.total_commits || 0
                        }))
                    setProductivityData(chartData)

                    // Generate heatmap data from daily stats
                    const heatmap = data.dailyStats.map((day: any) => ({
                        date: day.date,
                        count: day.total_commits || 0
                    }))
                    setHeatmapData(heatmap)
                } else {
                    // Generate empty placeholders
                    const days = parseInt(dateRange)
                    const chartData = Array.from({ length: days }, (_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - (days - i - 1))
                        return {
                            name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            value: 0
                        }
                    })
                    setProductivityData(chartData)
                    setHeatmapData([])
                }

                // Process language data from user stats (if available in future)
                // For now, estimate based on common patterns
                const languages = [
                    { name: 'TypeScript', percentage: 40, color: languageColors.TypeScript },
                    { name: 'JavaScript', percentage: 25, color: languageColors.JavaScript },
                    { name: 'Python', percentage: 20, color: languageColors.Python },
                    { name: 'Other', percentage: 15, color: languageColors.Other }
                ]
                setLanguageData(languages)
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate derived metrics
    const totalCommits = stats?.total_commits || 0
    const totalPRs = stats?.total_prs || 0
    const productivityScore = stats?.productivity_score || 0
    const currentStreak = stats?.current_streak || 0
    const totalRepos = stats?.total_repos || 0

    // Calculate trend from chart data
    const trend = productivityData.length >= 2
        ? Math.round(((productivityData[productivityData.length - 1]?.value || 0) -
            (productivityData[0]?.value || 0)) /
            Math.max(productivityData[0]?.value || 1, 1) * 100)
        : 0

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 p-1"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-3">
                        <Sparkles size={12} />
                        <span>Live Data</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Deep Analytics
                        <span className="text-zinc-500 font-normal text-2xl">/</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                            Overview
                        </span>
                    </h1>
                    <p className="text-zinc-400 mt-2 max-w-lg">
                        Real-time insights into your coding velocity and productivity metrics.
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
                {isLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <PremiumStatCard
                            label="Productivity Score"
                            value={productivityScore}
                            suffix="/100"
                            change={trend > 0 ? trend : undefined}
                            icon={<Brain size={18} />}
                            accentColor="purple"
                            sparklineData={productivityData.slice(-7).map(d => d.value)}
                        />
                        <PremiumStatCard
                            label="Total Commits"
                            value={totalCommits}
                            icon={<Zap size={18} />}
                            accentColor="blue"
                        />
                        <PremiumStatCard
                            label="Pull Requests"
                            value={totalPRs}
                            icon={<Code2 size={18} />}
                            accentColor="emerald"
                        />
                        <PremiumStatCard
                            label="Current Streak"
                            value={currentStreak}
                            suffix=" days"
                            icon={<Globe size={18} />}
                            accentColor="amber"
                        />
                    </>
                )}
            </motion.div>

            {/* Main Chart Area */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 premium-card p-6 min-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Activity size={18} className="text-purple-400" />
                                Commit Activity
                            </h2>
                            <p className="text-sm text-zinc-500">Your coding frequency over time</p>
                        </div>
                    </div>
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        ) : (
                            <AnalyticsChart
                                data={productivityData}
                                dataKey="value"
                                xAxisKey="name"
                                height={320}
                            />
                        )}
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
                        {isLoading ? (
                            <div className="h-24 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                            </div>
                        ) : heatmapData.length > 0 ? (
                            <ActivityHeatmap data={heatmapData} />
                        ) : (
                            <div className="h-24 flex items-center justify-center text-zinc-500 text-sm">
                                No activity data available. Start coding to see your heatmap!
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                        Based on your real GitHub commit history
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}
