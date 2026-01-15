'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Flame, GitCommit, GitPullRequest, Trophy, Zap,
    Calendar, ExternalLink, MapPin, Briefcase, Twitter,
    Linkedin, Globe, ChevronRight, Swords, Star
} from 'lucide-react'
import { SocialShareButtons } from '@/components/share/SocialShareButtons'
import Link from 'next/link'

interface PublicProfileData {
    user: {
        id: string
        username: string
        name: string | null
        avatarUrl: string | null
        bio: string | null
        githubUrl: string | null
        developerDna: any
    }
    stats: {
        totalCommits: number
        totalPRs: number
        currentStreak: number
        longestStreak: number
        productivityScore: number
        xp: number
        level: number
        levelTitle: string
        memberSince: string
    }
    achievements: Array<{
        id: string
        name: string
        description: string
        icon: string
        tier: string
        unlocked_at: string
    }>
    activity: Array<{
        date: string
        total_commits: number
    }>
    challenges: {
        won: number
        played: number
        winRate: number
    }
    profile: {
        openToWork: boolean
        openToFreelance: boolean
        twitterUrl: string | null
        linkedinUrl: string | null
        portfolioUrl: string | null
    } | null
}

interface PublicProfilePageProps {
    data: PublicProfileData
}

export function PublicProfilePage({ data }: PublicProfilePageProps) {
    const { user, stats, achievements, activity, challenges, profile } = data

    const memberSinceDate = new Date(stats.memberSince).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-zinc-950/80">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                        <Zap size={24} className="text-purple-400" />
                        <span className="font-bold">DevFlow</span>
                    </Link>
                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition-all"
                    >
                        Create Your Profile
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-start gap-6 mb-10"
                >
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={user.avatarUrl || '/default-avatar.png'}
                            alt={user.username}
                            className="w-32 h-32 rounded-3xl border-4 border-white/10 shadow-2xl"
                        />
                        {profile?.openToWork && (
                            <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-emerald-500 text-[10px] font-bold text-white uppercase tracking-wider">
                                Open to Work
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">
                                {user.name || user.username}
                            </h1>
                            <div
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                                style={{
                                    backgroundColor: getLevelColor(stats.level) + '20',
                                    color: getLevelColor(stats.level),
                                    border: `1px solid ${getLevelColor(stats.level)}40`
                                }}
                            >
                                Lv.{stats.level} {stats.levelTitle}
                            </div>
                        </div>
                        <p className="text-zinc-500 mb-3">@{user.username}</p>

                        {user.bio && (
                            <p className="text-zinc-400 mb-4 max-w-lg">{user.bio}</p>
                        )}

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {user.githubUrl && (
                                <a
                                    href={user.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            )}
                            {profile?.twitterUrl && (
                                <a
                                    href={profile.twitterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                                >
                                    <Twitter size={18} />
                                </a>
                            )}
                            {profile?.linkedinUrl && (
                                <a
                                    href={profile.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                                >
                                    <Linkedin size={18} />
                                </a>
                            )}
                            {profile?.portfolioUrl && (
                                <a
                                    href={profile.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                                >
                                    <Globe size={18} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Share */}
                    <div className="flex flex-col gap-2">
                        <SocialShareButtons
                            url={`https://devflow.io/u/${user.username}`}
                            title={`Check out ${user.name || user.username}'s developer profile on DevFlow!`}
                        />
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
                >
                    <StatCard
                        icon={<Flame size={20} className="text-amber-400" />}
                        value={stats.currentStreak}
                        label="Day Streak"
                        highlight
                    />
                    <StatCard
                        icon={<GitCommit size={20} className="text-blue-400" />}
                        value={stats.totalCommits.toLocaleString()}
                        label="Commits"
                    />
                    <StatCard
                        icon={<GitPullRequest size={20} className="text-emerald-400" />}
                        value={stats.totalPRs}
                        label="PRs Merged"
                    />
                    <StatCard
                        icon={<Zap size={20} className="text-purple-400" />}
                        value={stats.xp.toLocaleString()}
                        label="Total XP"
                    />
                </motion.div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column - Activity */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Activity Heatmap Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl bg-zinc-900/50 border border-white/10 p-5"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">Activity (Last 30 Days)</h3>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: 30 }).map((_, i) => {
                                    const dayActivity = activity[i]
                                    const commits = dayActivity?.total_commits || 0
                                    const intensity = Math.min(4, Math.floor(commits / 3))
                                    return (
                                        <div
                                            key={i}
                                            className="aspect-square rounded-sm"
                                            style={{
                                                backgroundColor: intensity === 0
                                                    ? 'rgba(255,255,255,0.05)'
                                                    : `rgba(139, 92, 246, ${0.2 + intensity * 0.2})`
                                            }}
                                            title={`${commits} commits`}
                                        />
                                    )
                                })}
                            </div>
                        </motion.div>

                        {/* Achievements */}
                        {achievements.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="rounded-2xl bg-zinc-900/50 border border-white/10 p-5"
                            >
                                <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {achievements.map((achievement) => (
                                        <div
                                            key={achievement.id}
                                            className="p-3 rounded-xl bg-white/5 border border-white/5 text-center"
                                        >
                                            <span className="text-2xl block mb-1">{achievement.icon}</span>
                                            <p className="text-xs text-zinc-400 truncate">{achievement.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Challenge Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-2xl bg-zinc-900/50 border border-white/10 p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Swords size={18} className="text-purple-400" />
                                <h3 className="font-semibold text-white">Challenges</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Played</span>
                                    <span className="text-white font-mono">{challenges.played}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Won</span>
                                    <span className="text-emerald-400 font-mono">{challenges.won}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Win Rate</span>
                                    <span className="text-purple-400 font-mono">{challenges.winRate}%</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Records */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-2xl bg-zinc-900/50 border border-white/10 p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy size={18} className="text-amber-400" />
                                <h3 className="font-semibold text-white">Personal Bests</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Longest Streak</span>
                                    <span className="text-amber-400 font-mono">{stats.longestStreak} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Member Since</span>
                                    <span className="text-zinc-400">{memberSinceDate}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Footer CTA */}
            <div className="relative z-10 border-t border-white/5 py-12">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">Build Your Developer Proof</h2>
                    <p className="text-zinc-500 mb-6">Join DevFlow and turn your commits into an undeniable career asset.</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition-all"
                    >
                        Get Started Free
                        <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

function StatCard({
    icon,
    value,
    label,
    highlight = false
}: {
    icon: React.ReactNode
    value: string | number
    label: string
    highlight?: boolean
}) {
    return (
        <div className={`rounded-xl p-4 border ${highlight
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-white/5 border-white/10'
            }`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
            </div>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
        </div>
    )
}

function getLevelColor(level: number): string {
    if (level >= 100) return '#ec4899' // Immortal - pink
    if (level >= 50) return '#ef4444'  // Legend - red
    if (level >= 30) return '#f59e0b'  // Architect - amber
    if (level >= 20) return '#8b5cf6'  // Builder - purple
    if (level >= 10) return '#10b981'  // Shipper - emerald
    if (level >= 5) return '#3b82f6'   // Contributor - blue
    return '#71717a'                    // Newcomer - zinc
}
