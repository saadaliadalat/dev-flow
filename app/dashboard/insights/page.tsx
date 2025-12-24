'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, AlertCircle, CheckCircle, Info, RefreshCw, Loader2, Brain } from 'lucide-react'
import { useToastActions } from '@/components/ui/Toast'

// Types
interface Insight {
    id: string
    title: string
    message: string
    severity: 'info' | 'warning' | 'alert' | 'success'
    created_at: string
    action_items?: string[]
    is_actionable: boolean
}

export default function InsightsPage() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const { success, error } = useToastActions()

    useEffect(() => {
        fetchInsights()
    }, [])

    async function fetchInsights() {
        try {
            const res = await fetch('/api/insights?limit=50')
            const data = await res.json()
            if (res.ok && data.insights) {
                setInsights(data.insights)
            }
        } catch (err) {
            console.error('Failed to fetch insights', err)
        } finally {
            setIsLoading(false)
        }
    }

    async function regenerateInsights() {
        setIsGenerating(true)
        try {
            // Get user ID
            const userRes = await fetch('/api/user/me')
            const userData = await userRes.json()

            if (!userRes.ok || !userData.user?.id) {
                error('Error', 'Could not identify user')
                return
            }

            const res = await fetch('/api/insights/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.user.id })
            })

            if (res.ok) {
                success('Success', 'New insights generated!')
                await fetchInsights()
            } else {
                const data = await res.json()
                error('Generation Failed', data.error || 'Something went wrong')
            }
        } catch (err) {
            console.error('Error generating insights:', err)
            error('Network Error', 'Failed to connect to AI engine')
        } finally {
            setIsGenerating(false)
        }
    }

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'success': return { icon: CheckCircle, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' }
            case 'warning': return { icon: AlertCircle, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' }
            case 'alert': return { icon: AlertCircle, color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' }
            default: return { icon: Info, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' }
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-3">
                        <Brain size={12} />
                        <span>AI Powered</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Neural Insights</h1>
                    <p className="text-[var(--text-tertiary)]">AI-generated optimization patterns and productivity analysis.</p>
                </div>
                <button
                    onClick={regenerateInsights}
                    disabled={isGenerating}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <RefreshCw size={16} />
                            Regenerate
                        </>
                    )}
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <div className="premium-card p-4 text-center">
                    <div className="text-2xl font-bold text-white">{insights.length}</div>
                    <div className="text-xs text-zinc-500">Total Insights</div>
                </div>
                <div className="premium-card p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                        {insights.filter(i => i.severity === 'success').length}
                    </div>
                    <div className="text-xs text-zinc-500">Positive</div>
                </div>
                <div className="premium-card p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">
                        {insights.filter(i => i.is_actionable).length}
                    </div>
                    <div className="text-xs text-zinc-500">Actionable</div>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative border-l border-zinc-800 ml-3 md:ml-6 space-y-6 pb-12">
                {isLoading ? (
                    // Skeletons
                    [1, 2, 3].map(i => (
                        <div key={i} className="pl-8 relative">
                            <div className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full bg-zinc-800 ring-4 ring-[var(--bg-deep)]" />
                            <div className="h-32 w-full rounded-xl bg-zinc-900/50 animate-pulse" />
                        </div>
                    ))
                ) : insights.length === 0 ? (
                    <div className="pl-8 py-12 text-center">
                        <Sparkles size={48} className="mx-auto text-zinc-700 mb-4" />
                        <p className="text-zinc-500 mb-4">No insights yet. Click "Regenerate" to analyze your coding patterns.</p>
                        <button onClick={regenerateInsights} className="btn-primary">
                            Generate First Insights
                        </button>
                    </div>
                ) : (
                    insights.map((insight, i) => {
                        const styles = getSeverityStyles(insight.severity)
                        const Icon = styles.icon

                        return (
                            <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="pl-6 md:pl-10 relative group"
                            >
                                {/* Timeline Node */}
                                <div className={`absolute -left-[5px] top-5 w-2.5 h-2.5 rounded-full ${styles.bg.replace('/5', '')} ring-4 ring-[var(--bg-deep)] group-hover:scale-125 transition-transform`} />

                                {/* Card */}
                                <div className={`premium-card p-5 ${styles.border} hover:border-purple-500/30 transition-colors`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Icon size={16} className={styles.color} />
                                        <span className="text-xs font-mono text-zinc-500">
                                            {new Date(insight.created_at).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{insight.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed mb-4">{insight.message}</p>

                                    {/* Action Items */}
                                    {insight.action_items && insight.action_items.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-zinc-800">
                                            <p className="text-xs font-medium text-zinc-500 mb-2">Recommended Actions:</p>
                                            <ul className="space-y-1">
                                                {insight.action_items.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                                                        <span className="text-purple-400 mt-0.5">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
