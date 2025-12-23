'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Calendar, ArrowRight, Brain, AlertCircle, CheckCircle, Info, Filter } from 'lucide-react'

// Types
interface Insight {
    id: string
    title: string
    message: string
    severity: 'info' | 'warning' | 'alert' | 'success'
    created_at: string
    is_actionable: boolean
}

export default function InsightsPage() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Fetch insights (Mocking API call for now if auth fails, but trying real API)
        async function fetchInsights() {
            try {
                const res = await fetch('/api/insights?limit=50')
                const data = await res.json()
                if (res.ok && data.insights) {
                    setInsights(data.insights)
                }
            } catch (error) {
                console.error('Failed to fetch insights', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchInsights()
    }, [])

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
                    <h1 className="text-2xl font-bold text-white mb-2">Neural Insights Log</h1>
                    <p className="text-[var(--text-tertiary)]">Historical timeline of AI-generated optimization patterns.</p>
                </div>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <Filter size={20} />
                </button>
            </div>

            {/* Timeline */}
            <div className="relative border-l border-zinc-800 ml-3 md:ml-6 space-y-8 pb-12">
                {isLoading ? (
                    // Skeletons
                    [1, 2, 3].map(i => (
                        <div key={i} className="pl-8 relative">
                            <div className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full bg-zinc-800 ring-4 ring-[var(--bg-deep)]" />
                            <div className="h-32 w-full rounded-xl bg-zinc-900/50 animate-pulse" />
                        </div>
                    ))
                ) : insights.length === 0 ? (
                    <div className="pl-8 py-12">
                        <p className="text-zinc-500">No insights recorded yet. Trigger an analysis on the dashboard.</p>
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
                                transition={{ delay: i * 0.05 }}
                                className="pl-6 md:pl-10 relative group"
                            >
                                {/* Timeline Node */}
                                <div className={`absolute -left-[5px] top-5 w-2.5 h-2.5 rounded-full ${styles.bg.replace('/5', '')} ring-4 ring-[var(--bg-deep)] group-hover:scale-125 transition-transform`} />

                                {/* Card */}
                                <div className={`premium-card p-5 ${styles.border} group-hover:border-opacity-50 transition-colors`}>
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Icon size={16} className={styles.color} />
                                                <span className="text-xs font-mono text-zinc-500">
                                                    {new Date(insight.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-white mb-2">{insight.title}</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{insight.message}</p>
                                        </div>

                                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-white hover:bg-zinc-800 transition-colors shrink-0 group/btn">
                                            View Report
                                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
