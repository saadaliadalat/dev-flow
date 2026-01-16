'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Swords, Plus, Filter, Loader2 } from 'lucide-react'
import { ChallengeCard, ChallengesEmptyState, type Challenge } from '@/components/challenges/ChallengeCard'
import { CreateChallengeModal } from '@/components/challenges/CreateChallengeModal'

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [currentUserId, setCurrentUserId] = useState('')

    useEffect(() => {
        fetchChallenges()
        fetchCurrentUser()
    }, [filter])

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('/api/user/me')
            if (res.ok) {
                const data = await res.json()
                setCurrentUserId(data.user?.id || '')
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
        }
    }

    const fetchChallenges = async () => {
        setIsLoading(true)
        try {
            // Update scores before fetching (ensures real data)
            await fetch('/api/challenges/update-scores', { method: 'POST' }).catch(() => { })

            const params = new URLSearchParams()
            if (filter !== 'all') params.set('status', filter)

            const res = await fetch(`/api/challenges?${params}`)
            if (res.ok) {
                const data = await res.json()
                setChallenges(data.challenges || [])
            }
        } catch (error) {
            console.error('Failed to fetch challenges:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAccept = async (id: string) => {
        try {
            await fetch('/api/challenges', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge_id: id, action: 'accept' })
            })
            fetchChallenges()
        } catch (error) {
            console.error('Failed to accept challenge:', error)
        }
    }

    const handleDecline = async (id: string) => {
        try {
            await fetch('/api/challenges', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge_id: id, action: 'decline' })
            })
            fetchChallenges()
        } catch (error) {
            console.error('Failed to decline challenge:', error)
        }
    }

    const handleShare = (inviteCode: string) => {
        const url = `${window.location.origin}/challenge/${inviteCode}`
        navigator.clipboard.writeText(url)
        alert('Invite link copied!')
    }

    const activeChallenges = challenges.filter(c => c.status === 'active')
    const pendingChallenges = challenges.filter(c => c.status === 'pending')
    const completedChallenges = challenges.filter(c => c.status === 'completed')

    return (
        <div className="min-h-screen p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                        <Swords size={28} className="text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Challenges</h1>
                        <p className="text-sm text-zinc-500">1v1 coding duels with friends</p>
                    </div>
                </div>

                <motion.button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={18} />
                    New Challenge
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6">
                {(['all', 'active', 'pending', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                            ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                            : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'active' && activeChallenges.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-500 text-white text-xs">
                                {activeChallenges.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-purple-400" />
                </div>
            ) : challenges.length === 0 ? (
                <ChallengesEmptyState onCreateChallenge={() => setShowCreateModal(true)} />
            ) : (
                <div className="space-y-8">
                    {/* Active Challenges */}
                    {filter === 'all' || filter === 'active' ? (
                        activeChallenges.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Challenges
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {activeChallenges.map((challenge) => (
                                        <ChallengeCard
                                            key={challenge.id}
                                            challenge={challenge}
                                            currentUserId={currentUserId}
                                            onShare={handleShare}
                                        />
                                    ))}
                                </div>
                            </section>
                        )
                    ) : null}

                    {/* Pending Challenges */}
                    {filter === 'all' || filter === 'pending' ? (
                        pendingChallenges.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Pending Challenges
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {pendingChallenges.map((challenge) => (
                                        <ChallengeCard
                                            key={challenge.id}
                                            challenge={challenge}
                                            currentUserId={currentUserId}
                                            onAccept={handleAccept}
                                            onDecline={handleDecline}
                                            onShare={handleShare}
                                        />
                                    ))}
                                </div>
                            </section>
                        )
                    ) : null}

                    {/* Completed Challenges */}
                    {filter === 'all' || filter === 'completed' ? (
                        completedChallenges.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Completed
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {completedChallenges.map((challenge) => (
                                        <ChallengeCard
                                            key={challenge.id}
                                            challenge={challenge}
                                            currentUserId={currentUserId}
                                        />
                                    ))}
                                </div>
                            </section>
                        )
                    ) : null}
                </div>
            )}

            {/* Create Modal */}
            <CreateChallengeModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchChallenges()
                    setShowCreateModal(false)
                }}
            />
        </div>
    )
}
