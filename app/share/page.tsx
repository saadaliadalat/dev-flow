'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Navbar } from '@/components/landing/Navbar'
import { useSession } from 'next-auth/react'
import { Share2, Download, Copy, Check, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface UserStats {
    total_commits: number
    current_streak: number
    longest_streak: number
    productivity_score: number
    total_prs: number
    total_issues: number
    total_reviews: number
    total_repos: number
    username: string
    name: string
    avatar_url: string
    last_synced: string | null
}

export default function ShareProfilePage() {
    const { data: session } = useSession()
    const [copied, setCopied] = useState(false)
    const [stats, setStats] = useState<UserStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dataVerified, setDataVerified] = useState(false)

    const profileUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/u/${stats?.username || session?.user?.name?.replace(/\s+/g, '').toLowerCase()}`
        : ''

    // Fetch real user stats from API
    useEffect(() => {
        async function fetchUserStats() {
            if (!session) return

            try {
                setIsLoading(true)
                setError(null)

                const res = await fetch('/api/user/me')
                const data = await res.json()

                if (res.ok && data.user) {
                    setStats({
                        total_commits: data.user.total_commits || 0,
                        current_streak: data.user.current_streak || 0,
                        longest_streak: data.user.longest_streak || 0,
                        productivity_score: data.user.productivity_score || 0,
                        total_prs: data.user.total_prs || 0,
                        total_issues: data.user.total_issues || 0,
                        total_reviews: data.user.total_reviews || 0,
                        total_repos: data.user.total_repos || 0,
                        username: data.user.username || '',
                        name: data.user.name || session.user?.name || 'Developer',
                        avatar_url: data.user.avatar_url || session.user?.image || '',
                        last_synced: data.user.last_synced
                    })

                    // Verify data is fresh (synced within last 24 hours)
                    if (data.user.last_synced) {
                        const lastSync = new Date(data.user.last_synced)
                        const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60)
                        setDataVerified(hoursSinceSync < 24)
                    }
                } else {
                    setError('Failed to load profile data')
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load profile')
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserStats()
    }, [session])

    const handleCopy = () => {
        navigator.clipboard.writeText(profileUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSync = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/github/sync', { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                // Refetch user data after sync
                const userRes = await fetch('/api/user/me')
                const userData = await userRes.json()

                if (userRes.ok && userData.user) {
                    setStats({
                        total_commits: userData.user.total_commits || 0,
                        current_streak: userData.user.current_streak || 0,
                        longest_streak: userData.user.longest_streak || 0,
                        productivity_score: userData.user.productivity_score || 0,
                        total_prs: userData.user.total_prs || 0,
                        total_issues: userData.user.total_issues || 0,
                        total_reviews: userData.user.total_reviews || 0,
                        total_repos: userData.user.total_repos || 0,
                        username: userData.user.username || '',
                        name: userData.user.name || session?.user?.name || 'Developer',
                        avatar_url: userData.user.avatar_url || session?.user?.image || '',
                        last_synced: userData.user.last_synced
                    })
                    setDataVerified(true)
                }
            }
        } catch (err) {
            console.error('Sync failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate percentile based on productivity score
    const getPercentile = (score: number) => {
        if (score >= 90) return 'TOP 1%'
        if (score >= 75) return 'TOP 5%'
        if (score >= 60) return 'TOP 10%'
        if (score >= 40) return 'TOP 25%'
        return 'TOP 50%'
    }

    return (
        <div className="min-h-screen bg-bg-deep text-white">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20 flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold font-display mb-2">Share Your Flow</h1>
                    <p className="text-zinc-400">Show off your stats with a generated developer card.</p>

                    {/* Data freshness indicator */}
                    {stats?.last_synced && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                            {dataVerified ? (
                                <span className="flex items-center gap-1 text-green-400">
                                    <CheckCircle2 size={14} />
                                    Data Verified
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-yellow-400">
                                    <AlertCircle size={14} />
                                    Data may be outdated
                                </span>
                            )}
                            <span className="text-zinc-500">|</span>
                            <span className="text-zinc-500">
                                Last synced: {new Date(stats.last_synced).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="w-[350px] md:w-[400px] h-[600px] flex items-center justify-center">
                        <div className="text-center">
                            <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                            <p className="text-zinc-400">Loading your stats...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="w-[350px] md:w-[400px] p-8 text-center">
                        <AlertCircle className="mx-auto mb-4 text-red-400" size={32} />
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={handleSync}
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            Try Syncing Data
                        </button>
                    </div>
                )}

                {/* The Share Card - With REAL data */}
                {!isLoading && !error && stats && (
                    <>
                        <div className="relative group perspective-1000 mb-8">
                            <GlassCard className="w-[350px] md:w-[400px] h-[600px] relative overflow-hidden bg-zinc-900 border-zinc-800 p-0 flex flex-col">

                                {/* Background Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-cyan-900/30" />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen" />

                                {/* Content */}
                                <div className="relative z-10 flex-1 p-8 flex flex-col items-center text-center">

                                    {/* Logo */}
                                    <div className="w-full flex justify-between items-center mb-12 opacity-80">
                                        <span className="font-mono text-xs tracking-[0.2em] font-bold">DEVFLOW {new Date().getFullYear()}</span>
                                        <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                                    </div>

                                    {/* Avatar */}
                                    <div className="relative mb-6">
                                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-white/20 to-white/0 backdrop-blur-md border border-white/10">
                                            <img
                                                src={stats.avatar_url || session?.user?.image || 'https://github.com/shadcn.png'}
                                                alt={stats.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black font-bold font-mono text-xs rounded-full shadow-lg">
                                            {getPercentile(stats.productivity_score)}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold font-display mb-1">{stats.name}</h2>
                                    <p className="text-zinc-500 font-mono text-xs mb-8">@{stats.username || 'developer'}</p>

                                    {/* Stats Grid - REAL DATA */}
                                    <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <p className="text-xs text-zinc-400 font-mono uppercase">Commits</p>
                                            <p className="text-3xl font-bold text-white mt-1">
                                                {stats.total_commits.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <p className="text-xs text-zinc-400 font-mono uppercase">Streak</p>
                                            <p className="text-3xl font-bold text-emerald-400 mt-1">
                                                {stats.current_streak}<span className="text-sm">d</span>
                                            </p>
                                        </div>
                                        <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/20">
                                            <p className="text-xs text-purple-300 font-mono uppercase">Productivity Score</p>
                                            <p className="text-4xl font-bold text-white mt-1">
                                                {stats.productivity_score}<span className="text-lg opacity-50">/100</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Additional Stats */}
                                    <div className="grid grid-cols-3 gap-2 w-full text-center">
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <p className="text-lg font-bold text-white">{stats.total_prs}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase">PRs</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <p className="text-lg font-bold text-white">{stats.total_issues}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase">Issues</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <p className="text-lg font-bold text-white">{stats.total_repos}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase">Repos</p>
                                        </div>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="p-6 bg-black/40 backdrop-blur-md border-t border-white/5 flex justify-between items-center relative z-10">
                                    <div className="text-left">
                                        <p className="text-[10px] text-zinc-500 font-mono uppercase">Generated by</p>
                                        <p className="text-sm font-bold text-white">DevFlow</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                                        <Share2 size={14} />
                                    </div>
                                </div>

                            </GlassCard>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 flex-wrap justify-center">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">
                                <Download size={18} />
                                Download Image
                            </button>
                            <button
                                onClick={handleSync}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                                Refresh Data
                            </button>
                        </div>

                        {/* Data Accuracy Note */}
                        <div className="mt-8 max-w-md text-center">
                            <p className="text-xs text-zinc-500">
                                Stats are synced from your GitHub profile. Click "Refresh Data" to ensure accuracy.
                                <br />
                                Productivity Score = Commits x 10 + PRs x 25 + Issues x 15 + Reviews x 20
                            </p>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
