'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Swords, Send, User, Mail, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateChallengeModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function CreateChallengeModal({ isOpen, onClose, onSuccess }: CreateChallengeModalProps) {
    const [step, setStep] = useState<'type' | 'opponent' | 'confirm'>('type')
    const [challengeType, setChallengeType] = useState<'commits' | 'streak' | 'prs'>('commits')
    const [duration, setDuration] = useState(7)
    const [opponentType, setOpponentType] = useState<'username' | 'email'>('username')
    const [opponentValue, setOpponentValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [inviteLink, setInviteLink] = useState('')

    const challengeTypes = [
        { id: 'commits', label: 'Most Commits', description: 'Who can ship more code?', icon: '📦' },
        { id: 'streak', label: 'Longest Streak', description: 'Who can stay consistent?', icon: '🔥' },
        { id: 'prs', label: 'Most PRs', description: 'Who ships more features?', icon: '🚀' },
    ]

    const durations = [
        { days: 3, label: '3 Days' },
        { days: 7, label: '1 Week' },
        { days: 14, label: '2 Weeks' },
        { days: 30, label: '1 Month' },
    ]

    const handleSubmit = async () => {
        if (!opponentValue.trim()) {
            setError('Please enter a username or email')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challenged_username: opponentType === 'username' ? opponentValue : undefined,
                    challenged_email: opponentType === 'email' ? opponentValue : undefined,
                    challenge_type: challengeType,
                    duration_days: duration,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create challenge')
            }

            if (data.inviteLink) {
                setInviteLink(data.inviteLink)
                setStep('confirm')
            }

            onSuccess?.()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink)
    }

    const resetAndClose = () => {
        setStep('type')
        setChallengeType('commits')
        setDuration(7)
        setOpponentValue('')
        setInviteLink('')
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={resetAndClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <Swords size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">Challenge a Friend</h2>
                                <p className="text-xs text-zinc-500">1v1 coding duel</p>
                            </div>
                        </div>
                        <button
                            onClick={resetAndClose}
                            className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        {step === 'type' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-zinc-400 mb-2 block">Challenge Type</label>
                                    <div className="space-y-2">
                                        {challengeTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setChallengeType(type.id as any)}
                                                className={cn(
                                                    "w-full p-4 rounded-xl border text-left transition-all",
                                                    challengeType === type.id
                                                        ? "bg-purple-500/10 border-purple-500/30"
                                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{type.icon}</span>
                                                    <div>
                                                        <p className="font-medium text-white">{type.label}</p>
                                                        <p className="text-xs text-zinc-500">{type.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-zinc-400 mb-2 block">Duration</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {durations.map((d) => (
                                            <button
                                                key={d.days}
                                                onClick={() => setDuration(d.days)}
                                                className={cn(
                                                    "p-2 rounded-lg border text-sm font-medium transition-all",
                                                    duration === d.days
                                                        ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                                                        : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                                                )}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep('opponent')}
                                    className="w-full py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition-all"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {step === 'opponent' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-zinc-400 mb-2 block">Find opponent by</label>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <button
                                            onClick={() => setOpponentType('username')}
                                            className={cn(
                                                "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                                opponentType === 'username'
                                                    ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                                                    : "bg-white/5 border-white/10 text-zinc-400"
                                            )}
                                        >
                                            <User size={16} />
                                            Username
                                        </button>
                                        <button
                                            onClick={() => setOpponentType('email')}
                                            className={cn(
                                                "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                                opponentType === 'email'
                                                    ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                                                    : "bg-white/5 border-white/10 text-zinc-400"
                                            )}
                                        >
                                            <Mail size={16} />
                                            Email
                                        </button>
                                    </div>

                                    <input
                                        type={opponentType === 'email' ? 'email' : 'text'}
                                        value={opponentValue}
                                        onChange={(e) => setOpponentValue(e.target.value)}
                                        placeholder={opponentType === 'email' ? 'friend@example.com' : '@username'}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none transition-colors"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-400">{error}</p>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setStep('type')}
                                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-medium hover:bg-white/10 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Send Challenge
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'confirm' && (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Swords size={32} className="text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Challenge Created!</h3>
                                <p className="text-sm text-zinc-500 mb-4">
                                    Share this link with your opponent:
                                </p>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={inviteLink}
                                        readOnly
                                        className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300 font-mono"
                                    />
                                    <button
                                        onClick={copyInviteLink}
                                        className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition-all"
                                    >
                                        Copy
                                    </button>
                                </div>

                                <button
                                    onClick={resetAndClose}
                                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-medium hover:bg-white/10 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
