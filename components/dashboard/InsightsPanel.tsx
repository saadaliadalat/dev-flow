'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, Info, Lightbulb } from 'lucide-react'

interface Insight {
    id: string
    insight_type: string
    title: string
    message: string
    severity: 'info' | 'warning' | 'alert' | 'success'
    action_items: string[]
    is_actionable: boolean
    created_at: string
}

interface InsightsPanelProps {
    className?: string
}

export function InsightsPanel({ className = '' }: InsightsPanelProps) {
    const [insights, setInsights] = useState<Insight[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        fetchInsights()
    }, [])

    async function fetchInsights() {
        try {
            const res = await fetch('/api/insights?limit=3')
            const data = await res.json()

            if (res.ok) {
                setInsights(data.insights || [])

                // Auto-generate if no insights exist
                if (data.insights.length === 0) {
                    await generateInsights()
                }
            }
        } catch (error) {
            console.error('Error fetching insights:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function generateInsights() {
        setIsGenerating(true)
        try {
            // First get user ID
            const userRes = await fetch('/api/user/me')
            const userData = await userRes.json()

            if (!userRes.ok || !userData.user?.id) {
                console.error('Failed to get user ID for insights')
                return
            }

            const res = await fetch('/api/insights/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.user.id })
            })
            const data = await res.json()

            if (res.ok) {
                await fetchInsights()
            } else {
                console.error('Insights generation failed:', data.error)
            }
        } catch (error) {
            console.error('Error generating insights:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    async function dismissInsight(insightId: string) {
        try {
            await fetch('/api/insights', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ insightId, action: 'dismiss' })
            })

            setInsights(insights.filter(i => i.id !== insightId))
        } catch (error) {
            console.error('Error dismissing insight:', error)
        }
    }

    async function markHelpful(insightId: string, helpful: boolean) {
        try {
            await fetch('/api/insights', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    insightId,
                    action: helpful ? 'helpful' : 'not_helpful'
                })
            })
        } catch (error) {
            console.error('Error marking insight:', error)
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />
            case 'warning': return <AlertCircle size={16} className="text-yellow-500" />
            case 'alert': return <AlertCircle size={16} className="text-red-500" />
            default: return <Info size={16} className="text-cyan-primary" />
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'success': return 'border-green-500/30 bg-green-500/5'
            case 'warning': return 'border-yellow-500/30 bg-yellow-500/5'
            case 'alert': return 'border-red-500/30 bg-red-500/5'
            default: return 'border-cyan-primary/30 bg-cyan-primary/5'
        }
    }

    if (isLoading) {
        return (
            <div className={`p-6 ${className}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-purple-primary animate-pulse" />
                    <h3 className="text-sm font-bold font-mono text-silver-dim uppercase tracking-wider">
                        AI Insights
                    </h3>
                </div>
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={`p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-primary" />
                    <h3 className="text-sm font-bold font-mono text-silver-dim uppercase tracking-wider">
                        AI Insights
                    </h3>
                </div>
                {insights.length === 0 && !isGenerating && (
                    <button
                        onClick={generateInsights}
                        className="text-xs text-purple-primary hover:text-purple-light transition-colors font-medium"
                    >
                        Generate
                    </button>
                )}
            </div>

            {isGenerating && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                    <Lightbulb className="animate-pulse mx-auto mb-2" size={24} />
                    Analyzing your coding patterns...
                </div>
            )}

            <AnimatePresence mode="popLayout">
                {insights.length === 0 && !isGenerating ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8 text-zinc-500 text-sm"
                    >
                        <Lightbulb className="mx-auto mb-2 opacity-50" size={24} />
                        No insights yet. Generate some!
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {insights.map((insight, index) => (
                            <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-xl border ${getSeverityColor(insight.severity)} relative group`}
                            >
                                <button
                                    onClick={() => dismissInsight(insight.id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} className="text-zinc-600 hover:text-zinc-400" />
                                </button>

                                <div className="flex items-start gap-3">
                                    {getSeverityIcon(insight.severity)}
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white mb-1">
                                            {insight.title}
                                        </h4>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            {insight.message}
                                        </p>

                                        {insight.action_items && insight.action_items.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {insight.action_items.map((action, i) => (
                                                    <li key={i} className="text-xs text-zinc-500 flex items-start gap-1.5">
                                                        <span className="text-purple-primary mt-0.5">→</span>
                                                        <span>{action}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="flex items-center gap-3 mt-3">
                                            <button
                                                onClick={() => markHelpful(insight.id, true)}
                                                className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-green-500 transition-colors"
                                            >
                                                <ThumbsUp size={12} />
                                                Helpful
                                            </button>
                                            <button
                                                onClick={() => markHelpful(insight.id, false)}
                                                className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-red-500 transition-colors"
                                            >
                                                <ThumbsDown size={12} />
                                                Not helpful
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
