'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingDown, Calendar, CheckCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

interface BurnoutAlertProps {
    className?: string
}

export function BurnoutAlert({ className = '' }: BurnoutAlertProps) {
    const [burnoutData, setBurnoutData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchBurnout() {
            try {
                // In a real app, this would be an API call
                // Simulating data for now based on previous implementation or API
                const res = await fetch('/api/analytics/burnout')
                const data = await res.json()

                if (res.ok) {
                    setBurnoutData(data)
                }
            } catch (error) {
                console.error('Error fetching burnout data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBurnout()
    }, [])

    // Don't show if loading or no data
    if (isLoading || !burnoutData) return null

    // Helper for Gauge Color
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return '#ef4444' // red-500
            case 'high': return '#f97316' // orange-500
            case 'medium': return '#eab308' // yellow-500
            default: return '#22c55e' // green-500
        }
    }

    const riskColor = getRiskColor(burnoutData.risk_level)
    const score = Math.round(burnoutData.burnout_risk_score * 100)

    // Gauge Animation Metrics
    const radius = 35
    const circumference = Math.PI * radius
    // Semi-circle: max offset is circumference. To show percentage P:
    // We want the dash to cover P% of the arch (which is itself half a circle?)
    // Actually, simpler to just use a standard gauge library concept with SVG paths.
    // Arc length = PI * R.
    // Full dasharray = PI * R.
    // Offset = PI * R * (1 - score/100).

    return (
        <GlassCard className={`p-6 border-l-4 ${className}`} style={{ borderLeftColor: riskColor }}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                        Burnout Risk
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-[180px]">
                        AI-analyzed risk based on commit frequency and coding patterns.
                    </p>
                </div>

                {/* Gauge Chart */}
                <div className="relative w-24 h-16 flex items-end justify-center">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60">
                        {/* Background Arc */}
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="#333"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />
                        {/* Progress Arc */}
                        <motion.path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke={riskColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: score / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute bottom-0 text-center">
                        <span className="text-2xl font-bold text-white relative bottom-1">{score}%</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 bg-white/5 p-2 rounded-lg">
                <span className="text-sm font-medium text-white capitalize">
                    Level: <span style={{ color: riskColor }}>{burnoutData.risk_level}</span>
                </span>
            </div>

            {burnoutData.recommendations && burnoutData.recommendations.length > 0 && (
                <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                    {burnoutData.recommendations.slice(0, 2).map((rec: any, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="flex items-start gap-3 text-xs"
                        >
                            <div className="min-w-[4px] h-[4px] rounded-full bg-zinc-500 mt-1.5" />
                            <div>
                                <p className="text-zinc-300 font-medium leading-relaxed">
                                    {rec.action}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </GlassCard>
    )
}
