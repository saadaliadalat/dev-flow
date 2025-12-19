'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingDown, Calendar } from 'lucide-react'
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

    // Only show if risk is medium or higher
    if (burnoutData.risk_level === 'low') return null

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'text-red-500 border-red-500/30 bg-red-500/5'
            case 'high': return 'text-orange-500 border-orange-500/30 bg-orange-500/5'
            case 'medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5'
            default: return 'text-zinc-500 border-zinc-500/30 bg-zinc-500/5'
        }
    }

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'critical':
            case 'high':
                return <AlertTriangle className="text-red-500" size={20} />
            case 'medium':
                return <TrendingDown className="text-yellow-500" size={20} />
            default:
                return <Calendar className="text-zinc-500" size={20} />
        }
    }

    return (
        <GlassCard className={`p-6 ${getRiskColor(burnoutData.risk_level)} border ${className}`}>
            <div className="flex items-start gap-3 mb-4">
                {getRiskIcon(burnoutData.risk_level)}
                <div>
                    <h3 className="font-bold text-white mb-1">
                        Burnout Risk: {burnoutData.risk_level.charAt(0).toUpperCase() + burnoutData.risk_level.slice(1)}
                    </h3>
                    <p className="text-xs text-zinc-400">
                        Score: {Math.round(burnoutData.burnout_risk_score * 100)}%
                    </p>
                </div>
            </div>

            {burnoutData.recommendations && burnoutData.recommendations.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                        Recommendations
                    </p>
                    {burnoutData.recommendations.slice(0, 2).map((rec: any, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2 text-xs"
                        >
                            <span className="text-purple-primary mt-0.5">•</span>
                            <div>
                                <p className="text-white font-medium">{rec.action}</p>
                                <p className="text-zinc-500 text-[11px]">{rec.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {burnoutData.recommendations && burnoutData.recommendations.length > 2 && (
                <button className="mt-4 text-xs text-purple-primary hover:text-purple-light transition-colors font-medium">
                    View all {burnoutData.recommendations.length} recommendations →
                </button>
            )}
        </GlassCard>
    )
}
