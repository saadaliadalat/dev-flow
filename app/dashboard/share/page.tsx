'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Share2, Copy, Check, Twitter, Linkedin,
    Image, Code, ExternalLink, Sparkles
} from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'
import { useSession } from 'next-auth/react'

interface UserStats {
    username: string
    score: number
    streak: number
    velocity: number
    commits: number
    title: string
}

export default function SharePage() {
    const { data: session } = useSession()
    const [stats, setStats] = useState<UserStats | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        // Fetch user stats
        Promise.all([
            fetch('/api/user/me').then(r => r.json()),
            fetch('/api/user/soul-velocity').then(r => r.json()),
        ]).then(([userData, velocityData]) => {
            if (userData.user) {
                setStats({
                    username: (session?.user as any)?.username || userData.user.github_username || 'developer',
                    score: userData.user.productivity_score || 75,
                    streak: userData.user.current_streak || 0,
                    velocity: velocityData.combined || 60,
                    commits: userData.user.total_commits || 0,
                    title: getTitle(userData.user.productivity_score || 0),
                })
            }
        })
    }, [session])

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Share2 size={32} className="text-violet-400" />
                    <p className="text-zinc-500">Loading your shareable links...</p>
                </div>
            </div>
        )
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://devflow.app'
    const cardUrl = `${baseUrl}/api/share/card?user=${stats.username}&score=${stats.score}&streak=${stats.streak}&velocity=${stats.velocity}&commits=${stats.commits}&title=${encodeURIComponent(stats.title)}`
    const profileUrl = `${baseUrl}/u/${stats.username}`

    const twitterText = `I'm a ${stats.title} with a ${stats.streak}-day streak and ${stats.score} DEV Score on @DevFlowApp 🔥\n\nTrack your coding journey: ${profileUrl}`
    const linkedinText = `Check out my developer stats on DevFlow! ${stats.streak}-day streak, ${stats.commits} commits. ${profileUrl}`

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                    <Share2 className="text-violet-400" />
                    Share Your LORE
                </h1>
                <p className="text-sm text-zinc-500">
                    Let the world know about your coding journey
                </p>
            </div>

            {/* Preview Card */}
            <AliveCard className="p-6" glass>
                <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                    <Image size={18} className="text-violet-400" />
                    Social Card Preview
                </h3>
                <div className="rounded-xl overflow-hidden border border-white/10">
                    <img
                        src={cardUrl}
                        alt="Your DevFlow Card"
                        className="w-full"
                    />
                </div>
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={() => copyToClipboard(cardUrl, 'card')}
                        className="btn-secondary flex items-center gap-2"
                    >
                        {copiedId === 'card' ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === 'card' ? 'Copied!' : 'Copy Image URL'}
                    </button>
                    <a
                        href={cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary flex items-center gap-2"
                    >
                        <ExternalLink size={14} />
                        Open
                    </a>
                </div>
            </AliveCard>

            {/* Social Sharing */}
            <div className="grid md:grid-cols-2 gap-6">
                <AliveCard className="p-6" glass>
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        <Twitter size={18} className="text-sky-400" />
                        Share on X/Twitter
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                        {twitterText}
                    </p>
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full justify-center"
                    >
                        Tweet Your Stats
                    </a>
                </AliveCard>

                <AliveCard className="p-6" glass>
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        <Linkedin size={18} className="text-blue-500" />
                        Share on LinkedIn
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                        {linkedinText}
                    </p>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full justify-center"
                    >
                        Post on LinkedIn
                    </a>
                </AliveCard>
            </div>

            {/* README Badges - DYNAMIC */}
            <AliveCard className="p-6" glass>
                <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                    <Code size={18} className="text-emerald-400" />
                    GitHub README Badges
                </h3>
                <p className="text-sm text-zinc-500 mb-2">
                    Add these badges to your GitHub profile or project READMEs.
                    <span className="text-violet-400 ml-1">Updates automatically!</span>
                </p>
                <p className="text-xs text-zinc-600 mb-4 font-mono bg-zinc-900/50 p-2 rounded">
                    Tip: These badges fetch your real-time stats from DevFlow
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Score Badge */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white">DEV Score</span>
                            <img
                                src={`${baseUrl}/api/badge/${stats.username}?type=score`}
                                alt="Score"
                                className="h-5"
                            />
                        </div>
                        <div className="flex gap-2">
                            <code className="flex-1 text-[10px] bg-zinc-900 p-2 rounded text-violet-400 overflow-x-auto whitespace-nowrap">
                                ![DevFlow Score]({baseUrl}/api/badge/{stats.username}?type=score)
                            </code>
                            <button
                                onClick={() => copyToClipboard(`![DevFlow Score](${baseUrl}/api/badge/${stats.username}?type=score)`, 'score-badge')}
                                className="p-2 rounded bg-white/5 hover:bg-white/10 text-zinc-400 shrink-0"
                            >
                                {copiedId === 'score-badge' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white">Streak</span>
                            <img
                                src={`${baseUrl}/api/badge/${stats.username}?type=streak`}
                                alt="Streak"
                                className="h-5"
                            />
                        </div>
                        <div className="flex gap-2">
                            <code className="flex-1 text-[10px] bg-zinc-900 p-2 rounded text-violet-400 overflow-x-auto whitespace-nowrap">
                                ![DevFlow Streak]({baseUrl}/api/badge/{stats.username}?type=streak)
                            </code>
                            <button
                                onClick={() => copyToClipboard(`![DevFlow Streak](${baseUrl}/api/badge/${stats.username}?type=streak)`, 'streak-badge')}
                                className="p-2 rounded bg-white/5 hover:bg-white/10 text-zinc-400 shrink-0"
                            >
                                {copiedId === 'streak-badge' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Commits Badge */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white">Total Commits</span>
                            <img
                                src={`${baseUrl}/api/badge/${stats.username}?type=commits`}
                                alt="Commits"
                                className="h-5"
                            />
                        </div>
                        <div className="flex gap-2">
                            <code className="flex-1 text-[10px] bg-zinc-900 p-2 rounded text-violet-400 overflow-x-auto whitespace-nowrap">
                                ![DevFlow Commits]({baseUrl}/api/badge/{stats.username}?type=commits)
                            </code>
                            <button
                                onClick={() => copyToClipboard(`![DevFlow Commits](${baseUrl}/api/badge/${stats.username}?type=commits)`, 'commits-badge')}
                                className="p-2 rounded bg-white/5 hover:bg-white/10 text-zinc-400 shrink-0"
                            >
                                {copiedId === 'commits-badge' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Rank Badge */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white">Rank</span>
                            <img
                                src={`${baseUrl}/api/badge/${stats.username}?type=rank`}
                                alt="Rank"
                                className="h-5"
                            />
                        </div>
                        <div className="flex gap-2">
                            <code className="flex-1 text-[10px] bg-zinc-900 p-2 rounded text-violet-400 overflow-x-auto whitespace-nowrap">
                                ![DevFlow Rank]({baseUrl}/api/badge/{stats.username}?type=rank)
                            </code>
                            <button
                                onClick={() => copyToClipboard(`![DevFlow Rank](${baseUrl}/api/badge/${stats.username}?type=rank)`, 'rank-badge')}
                                className="p-2 rounded bg-white/5 hover:bg-white/10 text-zinc-400 shrink-0"
                            >
                                {copiedId === 'rank-badge' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* All badges combined snippet */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-violet-400">📋 Copy All Badges</span>
                        <button
                            onClick={() => copyToClipboard(
                                `[![DevFlow Score](${baseUrl}/api/badge/${stats.username}?type=score)](${baseUrl}/u/${stats.username})\n[![DevFlow Streak](${baseUrl}/api/badge/${stats.username}?type=streak)](${baseUrl}/u/${stats.username})\n[![DevFlow Commits](${baseUrl}/api/badge/${stats.username}?type=commits)](${baseUrl}/u/${stats.username})`,
                                'all-badges'
                            )}
                            className="btn-secondary text-xs"
                        >
                            {copiedId === 'all-badges' ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy All</>}
                        </button>
                    </div>
                    <p className="text-xs text-zinc-500">
                        Paste this in your README to show all badges with links back to your profile
                    </p>
                </div>
            </AliveCard>

            {/* Challenge Link */}
            <AliveCard className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/5 border-violet-500/20" glass>
                <h3 className="font-heading font-semibold text-white mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" />
                    Challenge a Friend
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Send this link to challenge someone to beat your streak
                </p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        readOnly
                        value={`${baseUrl}/challenge/${stats.username}`}
                        className="flex-1 px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
                    />
                    <button
                        onClick={() => copyToClipboard(`${baseUrl}/challenge/${stats.username}`, 'challenge')}
                        className="btn-primary"
                    >
                        {copiedId === 'challenge' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </AliveCard>
        </motion.div>
    )
}

function getTitle(score: number): string {
    if (score >= 90) return 'Legendary Developer'
    if (score >= 80) return 'Code Wizard'
    if (score >= 70) return 'Code Warrior'
    if (score >= 60) return 'Rising Developer'
    if (score >= 40) return 'Code Explorer'
    return 'Code Initiate'
}
