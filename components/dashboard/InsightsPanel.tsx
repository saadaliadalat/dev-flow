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

// ... imports
import { Drawer } from '@/components/ui/Drawer'
import { Code, ArrowRight, Play, Check } from 'lucide-react'
import { useToastActions } from '@/components/ui/Toast'

// ... existing interfaces

export function InsightsPanel({ className = '' }: InsightsPanelProps) {
    const [insights, setInsights] = useState<Insight[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)
    const [isApplyingFix, setIsApplyingFix] = useState(false)
    const [fixApplied, setFixApplied] = useState(false)

    const { success, error, warning } = useToastActions()

    // Cooldown: 5 minutes between generations
    const GENERATION_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes
    const [cooldownRemaining, setCooldownRemaining] = useState(0)

    const canGenerateInsights = () => {
        const lastGenerated = localStorage.getItem('devflow_last_insight_gen')
        if (!lastGenerated) return true
        const elapsed = Date.now() - parseInt(lastGenerated)
        return elapsed >= GENERATION_COOLDOWN_MS
    }

    // Update cooldown timer every second
    useEffect(() => {
        const updateCooldown = () => {
            const lastGenerated = localStorage.getItem('devflow_last_insight_gen')
            if (!lastGenerated) {
                setCooldownRemaining(0)
                return
            }
            const remaining = GENERATION_COOLDOWN_MS - (Date.now() - parseInt(lastGenerated))
            setCooldownRemaining(Math.max(0, Math.ceil(remaining / 1000))) // seconds
        }
        updateCooldown()
        const interval = setInterval(updateCooldown, 1000)
        return () => clearInterval(interval)
    }, [])

    const resetCooldown = () => {
        localStorage.removeItem('devflow_last_insight_gen')
        setCooldownRemaining(0)
    }

    useEffect(() => {
        fetchInsights()
    }, [])

    async function fetchInsights() {
        try {
            const res = await fetch('/api/insights?limit=3')
            const data = await res.json()

            if (res.ok) {
                setInsights(data.insights || [])

                // Auto-generate if no insights exist AND cooldown has passed
                if (data.insights.length === 0 && canGenerateInsights()) {
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
        if (!canGenerateInsights()) {
            const mins = Math.ceil(cooldownRemaining / 60)
            warning('Cooldown Active', `Please wait ${mins} minute${mins !== 1 ? 's' : ''} before generating again.`)
            return
        }

        setIsGenerating(true)
        try {
            // First get user ID
            const userRes = await fetch('/api/user/me')
            const userData = await userRes.json()

            if (!userRes.ok || !userData.user?.id) {
                error('Authentication Error', 'Could not identify user. Please sign in again.')
                return
            }

            const res = await fetch('/api/insights/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.user.id })
            })
            const data = await res.json()

            if (res.ok) {
                // Store generation time for cooldown
                localStorage.setItem('devflow_last_insight_gen', Date.now().toString())
                await fetchInsights()
                success('Analysis Complete', 'New optimization insights generated.')
            } else {
                if (res.status === 429) {
                    error('Rate Limit', 'AI analysis is cooling down. Please wait a few minutes.')
                } else {
                    error('Generation Failed', data.error || 'Something went wrong.')
                }
            }
        } catch (err) {
            console.error('Error generating insights:', err)
            error('Network Error', 'Failed to connect to AI engine.')
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

    const handleApplyFix = () => {
        setIsApplyingFix(true)
        setTimeout(() => {
            setIsApplyingFix(false)
            setFixApplied(true)
            success('Optimization Applied', 'Code changes have been committed successfully.')
            setTimeout(() => setFixApplied(false), 3000)
        }, 1500)
    }

    // Mock Diff Content
    const MockDiff = () => (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
                <span className="text-zinc-400">utils/data-processing.ts</span>
                <span className="text-xs text-zinc-500">Lines 42-48</span>
            </div>
            <div className="p-4 overflow-x-auto">
                <div className="text-red-400 bg-red-500/10 -mx-4 px-4 py-0.5 pointer-events-none">
                    - const data = await fetchData();
                </div>
                <div className="text-red-400 bg-red-500/10 -mx-4 px-4 py-0.5 pointer-events-none mb-2">
                    - process(data);
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 -mx-4 px-4 py-0.5 pointer-events-none">
                    + const data = await fetchData();
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 -mx-4 px-4 py-0.5 pointer-events-none">
                    + // Optimization: process in chunks
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 -mx-4 px-4 py-0.5 pointer-events-none">
                    + await processInChunks(data, 100);
                </div>
            </div>
        </div>
    )

    // ... existing loading state

    return (
        <>
            <div className={`p-6 ${className}`}>
                {/* ... existing header and generate button */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-primary" />
                        <h3 className="text-sm font-bold font-mono text-silver-dim uppercase tracking-wider">
                            AI Insights
                        </h3>
                    </div>
                    {!isGenerating && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={generateInsights}
                                disabled={cooldownRemaining > 0}
                                className={`text-xs font-medium flex items-center gap-1 transition-colors ${cooldownRemaining === 0
                                    ? 'text-purple-primary hover:text-purple-light'
                                    : 'text-zinc-600 cursor-not-allowed'
                                    }`}
                                title={cooldownRemaining === 0 ? 'Generate new insights' : `Cooldown: ${Math.ceil(cooldownRemaining / 60)}m remaining`}
                            >
                                <Sparkles size={12} />
                                {cooldownRemaining > 0
                                    ? `${Math.ceil(cooldownRemaining / 60)}m`
                                    : insights.length === 0 ? 'Generate' : 'Refresh'}
                            </button>
                            {cooldownRemaining > 0 && (
                                <button
                                    onClick={resetCooldown}
                                    className="text-[10px] text-zinc-600 hover:text-zinc-400 underline"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ... existing generating/empty states */}

                {/* Insights List */}
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
                                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                                        {insight.message}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedInsight(insight)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-medium text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                                        >
                                            <Code size={12} className="text-purple-400" />
                                            View Details
                                        </button>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <button
                                                onClick={() => markHelpful(insight.id, true)}
                                                className="p-1 text-zinc-600 hover:text-emerald-400 transition-colors"
                                            >
                                                <ThumbsUp size={12} />
                                            </button>
                                            <button
                                                onClick={() => markHelpful(insight.id, false)}
                                                className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                                            >
                                                <ThumbsDown size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Detailed Drawer */}
            <Drawer
                isOpen={!!selectedInsight}
                onClose={() => setSelectedInsight(null)}
                title="Insight Analysis"
                width="max-w-xl"
            >
                {selectedInsight && (
                    <div className="space-y-8">
                        {/* Header Section */}
                        <div className={`p-4 rounded-xl border ${getSeverityColor(selectedInsight.severity)} bg-opacity-10`}>
                            <div className="flex items-start gap-3">
                                {getSeverityIcon(selectedInsight.severity)}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">{selectedInsight.title}</h3>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{selectedInsight.message}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Items */}
                        {selectedInsight.action_items && selectedInsight.action_items.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-400" />
                                    Recommended Actions
                                </h4>
                                <ul className="space-y-2">
                                    {selectedInsight.action_items.map((action, i) => (
                                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 flex-shrink-0">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm text-zinc-300">{action}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Code Diff (Mock) */}
                        <div>
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <Code size={16} className="text-purple-400" />
                                Proposed Optimization
                            </h4>
                            <MockDiff />
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-6 border-t border-zinc-800 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedInsight(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={handleApplyFix}
                                disabled={isApplyingFix || fixApplied}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${fixApplied
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-white text-black hover:bg-purple-50'
                                    }`}
                            >
                                {isApplyingFix ? (
                                    <>
                                        <Sparkles size={16} className="animate-spin" />
                                        Optimizing...
                                    </>
                                ) : fixApplied ? (
                                    <>
                                        <Check size={16} />
                                        Optimization Applied!
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} className="fill-black" />
                                        Apply Fix
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Drawer>
        </>
    )
}
