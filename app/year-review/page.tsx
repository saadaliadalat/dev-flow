'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { containerVariants, itemVariants } from '@/lib/animations'
import { GitCommit, Flame, Trophy, Code, Star, Calendar, TrendingUp, Award } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/landing/Navbar'

export default function YearReviewPage() {
    const { data: session } = useSession()
    const [reviewData, setReviewData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const currentYear = new Date().getFullYear()

    useEffect(() => {
        async function fetchYearReview() {
            try {
                const res = await fetch('/api/analytics/year-review')
                const data = await res.json()

                if (res.ok) {
                    setReviewData(data)
                }
            } catch (error) {
                console.error('Error fetching year review:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (session) fetchYearReview()
    }, [session])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-deep text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary mx-auto mb-4" />
                    <p className="text-zinc-400">Loading your year in code...</p>
                </div>
            </div>
        )
    }

    if (!reviewData) {
        return (
            <div className="min-h-screen bg-bg-deep text-white">
                <Navbar />
                <div className="container mx-auto px-4 pt-32 pb-20 text-center">
                    <h1 className="text-4xl font-bold mb-4">Year in Review</h1>
                    <p className="text-zinc-400">Not enough data to generate your year review yet.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-bg-deep text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-radial from-purple-primary/10 via-transparent to-transparent opacity-30" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-primary/20 rounded-full filter blur-[120px] animate-pulse" />

            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-display font-bold mb-4">
                            Your <span className="text-transparent bg-clip-text bg-gradient-primary">{currentYear}</span> in Code
                        </h1>
                        <p className="text-xl text-zinc-400">
                            {session?.user?.name}'s coding journey
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {/* Total Commits */}
                        <motion.div variants={itemVariants}>
                            <GlassCard className="p-8 text-center" glow="cyan">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-primary/20 flex items-center justify-center">
                                    <GitCommit size={32} className="text-cyan-primary" />
                                </div>
                                <div className="text-5xl font-bold font-display mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-primary to-purple-primary">
                                    {reviewData.totalCommits?.toLocaleString()}
                                </div>
                                <div className="text-sm text-zinc-400 uppercase tracking-wider font-mono">
                                    Total Commits
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Longest Streak */}
                        <motion.div variants={itemVariants}>
                            <GlassCard className="p-8 text-center" glow="purple">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-primary/20 flex items-center justify-center">
                                    <Flame size={32} className="text-purple-primary" />
                                </div>
                                <div className="text-5xl font-bold font-display mb-2 text-white">
                                    {reviewData.longestStreak} Days
                                </div>
                                <div className="text-sm text-zinc-400 uppercase tracking-wider font-mono">
                                    Longest Streak
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Top Languages */}
                        <motion.div variants={itemVariants}>
                            <GlassCard className="p-8" glow="none">
                                <div className="flex items-center gap-3 mb-4">
                                    <Code size={20} className="text-purple-primary" />
                                    <h3 className="font-bold text-white">Top Languages</h3>
                                </div>
                                <div className="space-y-3">
                                    {reviewData.topLanguages?.slice(0, 5).map((lang: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-zinc-300">{lang.language}</span>
                                            <span className="text-purple-primary font-mono text-sm">{lang.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Productivity Score */}
                        <motion.div variants={itemVariants}>
                            <GlassCard className="p-8 text-center" glow="none">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                                    <Trophy size={32} className="text-yellow-500" />
                                </div>
                                <div className="text-5xl font-bold font-display mb-2 text-white">
                                    {reviewData.avgProductivityScore}
                                </div>
                                <div className="text-sm text-zinc-400 uppercase tracking-wider font-mono mb-2">
                                    Avg Productivity Score
                                </div>
                                <div className="text-xs text-purple-primary">
                                    Top {reviewData.percentile}% globally
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>

                    {/* Additional Stats */}
                    <motion.div variants={itemVariants}>
                        <GlassCard className="p-8 mb-16">
                            <h3 className="text-2xl font-bold mb-6 text-center">More Highlights</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {reviewData.activeDays}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                                        Active Days
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {reviewData.totalRepos}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                                        Repos
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {reviewData.weekendCommits}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                                        Weekend Commits
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {reviewData.mostProductiveHour}:00
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                                        Peak Hour
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Share CTA */}
                    <motion.div variants={itemVariants} className="text-center">
                        <button className="px-8 py-4 rounded-xl bg-gradient-primary text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-2xl shadow-purple-primary/50">
                            Share Your Year in Code 🚀
                        </button>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}
