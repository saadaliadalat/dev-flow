'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Copy, Check, Send, X, Swords, Link2, Twitter, MessageCircle } from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'

interface ChallengeModalProps {
    isOpen: boolean
    onClose: () => void
    userName: string
    userRank: number
    userScore: number
}

export function ChallengeModal({ isOpen, onClose, userName, userRank, userScore }: ChallengeModalProps) {
    const [copied, setCopied] = useState(false)
    const [email, setEmail] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [sent, setSent] = useState(false)

    const challengeUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/challenge?from=${encodeURIComponent(userName)}&rank=${userRank}`
        : ''

    const challengeMessage = `🏆 I'm ranked #${userRank} on DevFlow with ${userScore.toLocaleString()} XP. Think you can beat me? Join and let's compete! ${challengeUrl}`

    const handleCopy = async () => {
        await navigator.clipboard.writeText(challengeUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSendChallenge = async () => {
        if (!email || !email.includes('@')) return
        setIsSending(true)

        try {
            await fetch('/api/social/challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    fromUser: userName,
                    fromRank: userRank,
                    fromScore: userScore
                })
            })
            setSent(true)
            setTimeout(() => {
                setSent(false)
                setEmail('')
            }, 3000)
        } catch (err) {
            console.error(err)
        } finally {
            setIsSending(false)
        }
    }

    const shareToTwitter = () => {
        const text = encodeURIComponent(challengeMessage)
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-md w-full"
                    >
                        <AliveCard className="p-6" glass>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-violet-500/20">
                                        <Swords className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Challenge a Friend</h3>
                                        <p className="text-xs text-zinc-500">Invite them to compete on DevFlow</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Your Stats Preview */}
                            <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-2xl p-4 mb-6 border border-violet-500/20">
                                <p className="text-xs text-zinc-500 mb-1">Your Challenge Card</p>
                                <p className="text-white">
                                    <span className="font-bold text-violet-400">#{userRank}</span> ranked with{' '}
                                    <span className="font-bold text-white">{userScore.toLocaleString()} XP</span>
                                </p>
                            </div>

                            {/* Email Invite */}
                            <div className="mb-6">
                                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                                    Send via Email
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="friend@email.com"
                                        className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                    <button
                                        onClick={handleSendChallenge}
                                        disabled={isSending || !email}
                                        className="px-4 py-2 rounded-xl bg-violet-500 text-white font-medium text-sm hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                    >
                                        {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                        {sent ? 'Sent!' : 'Send'}
                                    </button>
                                </div>
                            </div>

                            {/* Share Link */}
                            <div className="mb-6">
                                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                                    Share Link
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm truncate">
                                        {challengeUrl}
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 flex items-center gap-2 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Social Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={shareToTwitter}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] font-medium text-sm hover:bg-[#1DA1F2]/20 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Twitter className="w-4 h-4" />
                                    Share on X
                                </button>
                                <button
                                    onClick={() => {
                                        const url = `https://wa.me/?text=${encodeURIComponent(challengeMessage)}`
                                        window.open(url, '_blank')
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm hover:bg-emerald-500/20 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp
                                </button>
                            </div>
                        </AliveCard>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Button to trigger the modal
export function ChallengeButton({ userName, userRank, userScore }: { userName: string, userRank: number, userScore: number }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-500 hover:to-indigo-500 flex items-center gap-2 shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30"
            >
                <Swords className="w-4 h-4" />
                Challenge a Friend
            </button>
            <ChallengeModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                userName={userName}
                userRank={userRank}
                userScore={userScore}
            />
        </>
    )
}
