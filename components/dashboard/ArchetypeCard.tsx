'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Share2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { Archetype, ArchetypeDefinition, ArchetypeKey } from '@/types'
import { ARCHETYPES } from '@/lib/devflow-data'

interface ArchetypeCardProps {
    className?: string
    onShare?: () => void
}

export function ArchetypeCard({ className = '', onShare }: ArchetypeCardProps) {
    const [archetype, setArchetype] = useState<Archetype | null>(null)
    const [definition, setDefinition] = useState<ArchetypeDefinition | null>(null)
    const [canReveal, setCanReveal] = useState(false)
    const [daysUntilReveal, setDaysUntilReveal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isRevealing, setIsRevealing] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [revealAnimation, setRevealAnimation] = useState(false)

    useEffect(() => {
        fetchArchetype()
    }, [])

    async function fetchArchetype() {
        try {
            const res = await fetch('/api/archetype')
            const data = await res.json()
            if (res.ok) {
                setArchetype(data.archetype)
                setDefinition(data.definition)
                setCanReveal(data.can_reveal)
                setDaysUntilReveal(data.days_until_reveal || 0)
            }
        } catch (error) {
            console.error('Failed to fetch archetype:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function revealArchetype() {
        setIsRevealing(true)
        try {
            const res = await fetch('/api/archetype', { method: 'POST' })
            const data = await res.json()
            if (res.ok && data.archetype) {
                // Trigger reveal animation
                setRevealAnimation(true)
                setTimeout(() => {
                    setArchetype(data.archetype)
                    setDefinition(data.archetype.definition)
                    setRevealAnimation(false)
                }, 1500)
            }
        } catch (error) {
            console.error('Failed to reveal archetype:', error)
        } finally {
            setIsRevealing(false)
        }
    }

    if (isLoading) {
        return (
            <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse ${className}`}>
                <div className="h-6 w-32 bg-zinc-800 rounded mb-4" />
                <div className="h-12 w-48 bg-zinc-800 rounded mb-2" />
                <div className="h-4 w-full bg-zinc-800 rounded" />
            </div>
        )
    }

    // Reveal Animation State
    if (revealAnimation) {
        return (
            <div className={`rounded-2xl border border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8 ${className}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center py-8"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles size={48} className="text-purple-400" />
                    </motion.div>
                    <p className="text-lg font-medium text-purple-300 mt-4">
                        Analyzing your patterns...
                    </p>
                </motion.div>
            </div>
        )
    }

    // No archetype yet - show reveal CTA
    if (!archetype || !definition) {
        return (
            <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
                <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={28} className="text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                        Your Developer Archetype
                    </h3>
                    {canReveal ? (
                        <>
                            <p className="text-sm text-zinc-400 mb-4">
                                We've analyzed your patterns. Ready to discover who you are?
                            </p>
                            <button
                                onClick={revealArchetype}
                                disabled={isRevealing}
                                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                            >
                                {isRevealing ? 'Revealing...' : 'Reveal My Archetype'}
                            </button>
                        </>
                    ) : (
                        <p className="text-sm text-zinc-500">
                            {daysUntilReveal > 0
                                ? `${daysUntilReveal} more day${daysUntilReveal > 1 ? 's' : ''} of activity needed`
                                : 'Keep coding to unlock your archetype'
                            }
                        </p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border overflow-hidden ${className}`}
            style={{
                borderColor: `${definition.color}40`,
                background: `linear-gradient(to bottom right, ${definition.color}10, transparent)`
            }}
        >
            {/* Header */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">{definition.emoji}</span>
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                                Your Archetype
                            </span>
                            <h3
                                className="text-xl font-bold"
                                style={{ color: definition.color }}
                            >
                                {definition.name}
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onShare}
                        className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                    >
                        <Share2 size={16} />
                    </button>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                    {definition.description}
                </p>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 mb-2 block">
                            Strengths
                        </span>
                        <ul className="space-y-1">
                            {definition.strengths.map((strength, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 mb-2 block">
                            Weaknesses
                        </span>
                        <ul className="space-y-1">
                            {definition.weaknesses.map((weakness, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                                    <span className="w-1 h-1 rounded-full bg-amber-500" />
                                    {weakness}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Toggle Details */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full py-3 px-6 bg-white/5 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
            >
                {showDetails ? (
                    <>Hide Details <ChevronUp size={14} /></>
                ) : (
                    <>Show Details <ChevronDown size={14} /></>
                )}
            </button>

            {/* Expanded Details */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 border-t border-white/5"
                    >
                        <div className="pt-4 space-y-4">
                            {/* Confidence */}
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Confidence</span>
                                <span className="text-white font-mono">
                                    {Math.round((archetype.confidence_score || 0.85) * 100)}%
                                </span>
                            </div>

                            {/* Assigned date */}
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Assigned</span>
                                <span className="text-white font-mono">
                                    {new Date(archetype.assigned_at).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Evolution hint */}
                            <p className="text-[10px] text-zinc-600 text-center pt-2">
                                Archetypes evolve every 2 weeks based on behavior changes
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
