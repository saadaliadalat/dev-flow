'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, RefreshCw, Sparkles } from 'lucide-react'
import { DailyVerdict as VerdictType, VerdictSeverity } from '@/types'

interface DailyVerdictProps {
    className?: string
    onShare?: () => void
    variant?: 'full' | 'minimal'
}

export function DailyVerdict({ className = '', onShare, variant = 'full' }: DailyVerdictProps) {
    const [verdict, setVerdict] = useState<VerdictType & { emoji?: string } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        fetchVerdict()
    }, [])

    async function fetchVerdict() {
        try {
            const res = await fetch('/api/verdict')
            const data = await res.json()
            if (res.ok && data.verdict) {
                setVerdict(data.verdict)
            }
        } catch (error) {
            console.error('Failed to fetch verdict:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function refreshVerdict() {
        setIsRefreshing(true)
        try {
            const res = await fetch('/api/verdict', { method: 'POST' })
            const data = await res.json()
            if (res.ok && data.verdict) {
                setVerdict(data.verdict)
            }
        } catch (error) {
            console.error('Failed to refresh verdict:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    const getSeverityStyles = (severity: VerdictSeverity) => {
        switch (severity) {
            case 'praise':
                return {
                    bg: 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10',
                    border: 'border-emerald-500/30',
                    text: 'text-emerald-400',
                    glow: 'shadow-emerald-500/20'
                }
            case 'warning':
                return {
                    bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10',
                    border: 'border-amber-500/30',
                    text: 'text-amber-400',
                    glow: 'shadow-amber-500/20'
                }
            case 'critical':
                return {
                    bg: 'bg-gradient-to-br from-red-500/10 to-rose-500/10',
                    border: 'border-red-500/30',
                    text: 'text-red-400',
                    glow: 'shadow-red-500/20'
                }
            default:
                return {
                    bg: 'bg-gradient-to-br from-zinc-500/10 to-slate-500/10',
                    border: 'border-zinc-500/30',
                    text: 'text-zinc-400',
                    glow: 'shadow-zinc-500/20'
                }
        }
    }

    if (isLoading) {
        return variant === 'minimal' ? (
            <div className={`animate-pulse ${className}`}>
                <div className="h-8 w-64 bg-zinc-800 rounded mb-2" />
                <div className="h-4 w-48 bg-zinc-800 rounded" />
            </div>
        ) : (
            <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse ${className}`}>
                <div className="h-6 w-16 bg-zinc-800 rounded mb-4" />
                <div className="h-8 w-3/4 bg-zinc-800 rounded mb-2" />
                <div className="h-4 w-1/2 bg-zinc-800 rounded" />
            </div>
        )
    }

    if (!verdict) {
        return variant === 'minimal' ? (
            <div className={`animate-pulse ${className}`}>
                <div className="h-8 w-48 bg-zinc-800 rounded" />
            </div>
        ) : (
            <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
                <div className="text-center py-4">
                    <Sparkles size={32} className="mx-auto mb-2 text-purple-500 opacity-50" />
                    <p className="text-zinc-500 text-sm">Loading your daily verdict...</p>
                </div>
            </div>
        )
    }

    const styles = getSeverityStyles(verdict.severity)

    if (variant === 'minimal') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${className}`}
            >
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{verdict.emoji || '👋'}</span>
                    <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${styles.text.replace('text-', 'from-').replace('-400', '-400')
                        } to-white`}>
                        {verdict.verdict_text}
                    </h1>
                </div>
                {verdict.verdict_subtext && (
                    <p className="text-zinc-400 max-w-2xl text-lg">
                        {verdict.verdict_subtext}
                    </p>
                )}
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`relative rounded-2xl border ${styles.border} ${styles.bg} p-6 overflow-hidden group ${className}`}
        >
            {/* Glow effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl ${styles.glow}`} />

            {/* Header */}
            <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{verdict.emoji || '📊'}</span>
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                        Daily Verdict
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refreshVerdict}
                        disabled={isRefreshing}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                        title="Refresh verdict"
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={onShare}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                        title="Share"
                    >
                        <Share2 size={14} />
                    </button>
                </div>
            </div>

            {/* Main Verdict */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={verdict.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <h2 className={`text-xl md:text-2xl font-bold ${styles.text} mb-2 leading-tight`}>
                        {verdict.verdict_text}
                    </h2>
                    {verdict.verdict_subtext && (
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            {verdict.verdict_subtext}
                        </p>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Score indicator */}
            {verdict.dev_flow_score !== null && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 font-mono">Score</span>
                        <span className="text-lg font-bold text-white font-mono">
                            {verdict.dev_flow_score}
                        </span>
                        {verdict.score_change !== null && verdict.score_change !== 0 && (
                            <span className={`text-xs font-mono ${verdict.score_change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {verdict.score_change > 0 ? '+' : ''}{verdict.score_change}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono">
                        {new Date(verdict.computed_at).toLocaleDateString()}
                    </span>
                </div>
            )}
        </motion.div>
    )
}
