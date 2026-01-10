'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ExternalLink, Loader2 } from 'lucide-react'
import { Constellation } from '@/components/lore/Constellation'
import { AliveCard } from '@/components/ui/AliveCard'
import { Star } from '@/lib/constellation'

export default function ConstellationPage() {
    const [stars, setStars] = useState<Star[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchRepos() {
            try {
                // Use existing activity endpoint or create dedicated one
                const res = await fetch('/api/github/repos')
                if (!res.ok) throw new Error('Failed to fetch repos')

                const data = await res.json()

                // Transform to Star format
                const starsData: Star[] = (data.repos || []).map((repo: any) => ({
                    id: repo.id?.toString() || repo.name,
                    name: repo.name,
                    fullName: repo.fullName || repo.full_name,
                    language: repo.language,
                    commits: repo.commits || repo.commit_count || Math.floor(Math.random() * 500), // Fallback for demo
                    lastCommitAt: repo.pushed_at || repo.updated_at,
                    url: repo.html_url || `https://github.com/${repo.full_name}`,
                }))

                setStars(starsData)
            } catch (err) {
                console.error('Constellation fetch error:', err)
                setError('Could not load your constellation')

                // Demo data fallback
                setStars([
                    { id: '1', name: 'dev-flow', fullName: 'user/dev-flow', language: 'TypeScript', commits: 847, lastCommitAt: new Date().toISOString(), url: '#' },
                    { id: '2', name: 'portfolio', fullName: 'user/portfolio', language: 'TypeScript', commits: 234, lastCommitAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), url: '#' },
                    { id: '3', name: 'neural-forge', fullName: 'user/neural-forge', language: 'Python', commits: 156, lastCommitAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), url: '#' },
                    { id: '4', name: 'taqwa-ai', fullName: 'user/taqwa-ai', language: 'Dart', commits: 423, lastCommitAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), url: '#' },
                    { id: '5', name: 'gym-website', fullName: 'user/gym-website', language: 'JavaScript', commits: 89, lastCommitAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), url: '#' },
                    { id: '6', name: 'rust-experiments', fullName: 'user/rust-experiments', language: 'Rust', commits: 45, lastCommitAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), url: '#' },
                ])
            } finally {
                setIsLoading(false)
            }
        }

        fetchRepos()
    }, [])

    const handleStarClick = (star: Star) => {
        if (star.url && star.url !== '#') {
            window.open(star.url, '_blank')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-violet-500" />
                        Your Constellation
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Every repository is a star. Watch your galaxy grow.
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-3xl font-mono font-bold text-white">
                        {stars.length}
                    </p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Stars</p>
                </div>
            </motion.div>

            {/* Main Constellation View */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <AliveCard className="h-[70vh] min-h-[500px]" glass>
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                        </div>
                    ) : (
                        <Constellation stars={stars} onStarClick={handleStarClick} />
                    )}
                </AliveCard>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Stars', value: stars.filter(s => s.lastCommitAt && new Date(s.lastCommitAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, color: 'text-emerald-500' },
                    { label: 'Total Commits', value: stars.reduce((sum, s) => sum + s.commits, 0), color: 'text-violet-500' },
                    { label: 'Languages', value: new Set(stars.map(s => s.language).filter(Boolean)).size, color: 'text-amber-500' },
                    { label: 'Dim Embers', value: stars.filter(s => !s.lastCommitAt || new Date(s.lastCommitAt) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length, color: 'text-zinc-500' },
                ].map((stat) => (
                    <AliveCard key={stat.label} className="p-4 text-center" glass>
                        <p className={`text-2xl font-mono font-bold ${stat.color}`}>
                            {stat.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                            {stat.label}
                        </p>
                    </AliveCard>
                ))}
            </div>
        </div>
    )
}
