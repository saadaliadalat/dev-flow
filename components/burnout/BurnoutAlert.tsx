'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AlertTriangle, HeartPulse, X, Coffee, Moon,
    TrendingDown, Sparkles, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BurnoutIndicators {
    longHours: boolean
    noBreaks: boolean
    weekendOverwork: boolean
    decliningOutput: boolean
    lateNightCoding: boolean
}

interface BurnoutAlertProps {
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    indicators: BurnoutIndicators
    weeklyCommits: number
    avgDailyHours: number
    onDismiss?: () => void
    className?: string
}

export function BurnoutAlert({
    riskLevel,
    indicators,
    weeklyCommits,
    avgDailyHours,
    onDismiss,
    className
}: BurnoutAlertProps) {
    const [showRecovery, setShowRecovery] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    if (dismissed || riskLevel === 'low') return null

    const getAlertStyles = () => {
        switch (riskLevel) {
            case 'critical':
                return 'bg-red-500/10 border-red-500/30 text-red-400'
            case 'high':
                return 'bg-orange-500/10 border-orange-500/30 text-orange-400'
            case 'medium':
                return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            default:
                return 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
        }
    }

    const getRecoveryTips = (): { icon: React.ReactNode; tip: string }[] => {
        const tips = []

        if (indicators.lateNightCoding) {
            tips.push({
                icon: <Moon size={16} className="text-purple-400" />,
                tip: 'Set a coding cutoff time - stop by 10 PM'
            })
        }
        if (indicators.weekendOverwork) {
            tips.push({
                icon: <Coffee size={16} className="text-amber-400" />,
                tip: 'Take at least one full day off this weekend'
            })
        }
        if (indicators.noBreaks) {
            tips.push({
                icon: <HeartPulse size={16} className="text-rose-400" />,
                tip: 'Use the Pomodoro technique: 25 min work, 5 min break'
            })
        }
        if (indicators.decliningOutput) {
            tips.push({
                icon: <TrendingDown size={16} className="text-blue-400" />,
                tip: 'Quality over quantity - focus on one important task'
            })
        }

        // Always add these
        tips.push({
            icon: <Sparkles size={16} className="text-emerald-400" />,
            tip: 'Sleep 7-8 hours - it\'s a competitive advantage'
        })

        return tips.slice(0, 4)
    }

    const handleDismiss = () => {
        setDismissed(true)
        onDismiss?.()
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={cn("rounded-2xl border overflow-hidden", getAlertStyles(), className)}
            >
                {/* Main Alert */}
                <div className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "p-2 rounded-xl",
                                riskLevel === 'critical' ? 'bg-red-500/20' :
                                    riskLevel === 'high' ? 'bg-orange-500/20' : 'bg-amber-500/20'
                            )}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">
                                    {riskLevel === 'critical' ? '⚠️ Burnout Risk Critical' :
                                        riskLevel === 'high' ? '⚠️ High Burnout Risk' :
                                            '⚡ Elevated Activity Detected'}
                                </h3>
                                <p className="text-sm opacity-80">
                                    {weeklyCommits} commits this week • {avgDailyHours.toFixed(1)}h avg/day
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={16} className="text-zinc-500" />
                        </button>
                    </div>

                    {/* Indicators */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {indicators.longHours && (
                            <span className="px-2 py-1 rounded-full bg-white/10 text-xs">Long hours</span>
                        )}
                        {indicators.lateNightCoding && (
                            <span className="px-2 py-1 rounded-full bg-white/10 text-xs">Late nights</span>
                        )}
                        {indicators.weekendOverwork && (
                            <span className="px-2 py-1 rounded-full bg-white/10 text-xs">Weekend work</span>
                        )}
                        {indicators.noBreaks && (
                            <span className="px-2 py-1 rounded-full bg-white/10 text-xs">No breaks</span>
                        )}
                    </div>

                    {/* Toggle Recovery Tips */}
                    <button
                        onClick={() => setShowRecovery(!showRecovery)}
                        className="mt-3 flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
                    >
                        Recovery tips
                        <ChevronRight size={14} className={cn("transition-transform", showRecovery && "rotate-90")} />
                    </button>
                </div>

                {/* Recovery Tips */}
                <AnimatePresence>
                    {showRecovery && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10"
                        >
                            <div className="p-4 space-y-3">
                                {getRecoveryTips().map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {item.icon}
                                        <span className="text-sm text-zinc-300">{item.tip}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    )
}

// Auto-detecting burnout alert that fetches its own data
export function AutoBurnoutAlert({ className }: { className?: string }) {
    const [data, setData] = useState<{
        riskLevel: 'low' | 'medium' | 'high' | 'critical'
        indicators: BurnoutIndicators
        weeklyCommits: number
        avgDailyHours: number
    } | null>(null)

    useEffect(() => {
        fetchBurnoutStatus()
    }, [])

    const fetchBurnoutStatus = async () => {
        try {
            const res = await fetch('/api/user/burnout-check')
            if (res.ok) {
                const burnoutData = await res.json()
                if (burnoutData.burnoutRisk) {
                    setData({
                        riskLevel: burnoutData.riskLevel || 'medium',
                        indicators: burnoutData.indicators || {},
                        weeklyCommits: burnoutData.weeklyCommits || 0,
                        avgDailyHours: burnoutData.avgDailyHours || 0,
                    })
                }
            }
        } catch (error) {
            console.error('Failed to check burnout status:', error)
        }
    }

    if (!data) return null

    return (
        <BurnoutAlert
            riskLevel={data.riskLevel}
            indicators={data.indicators}
            weeklyCommits={data.weeklyCommits}
            avgDailyHours={data.avgDailyHours}
            className={className}
        />
    )
}
