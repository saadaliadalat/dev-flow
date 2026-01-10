'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flower2, X } from 'lucide-react'
import { SPRINGS } from '@/lib/motion'

interface BurnoutOracleProps {
    className?: string
}

export function BurnoutOracle({ className }: BurnoutOracleProps) {
    const [haiku, setHaiku] = useState<string | null>(null)
    const [severity, setSeverity] = useState<'none' | 'mild' | 'warning' | 'critical'>('none')
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        async function checkBurnout() {
            try {
                const res = await fetch('/api/user/burnout-check')
                if (!res.ok) return

                const data = await res.json()
                if (data.primary && data.primary.severity !== 'none') {
                    setHaiku(data.primary.haiku)
                    setSeverity(data.primary.severity)
                    // Delay showing for dramatic effect
                    setTimeout(() => setIsVisible(true), 2000)
                }
            } catch (err) {
                console.error('Burnout check failed:', err)
            }
        }

        checkBurnout()
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        setTimeout(() => setIsDismissed(true), 500)
    }

    if (isDismissed || !haiku) return null

    const severityColors = {
        none: 'border-zinc-700',
        mild: 'border-blue-500/30',
        warning: 'border-amber-500/30',
        critical: 'border-red-500/30',
    }

    const severityGlows = {
        none: '',
        mild: 'shadow-[0_0_30px_rgba(59,130,246,0.1)]',
        warning: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
        critical: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]',
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={SPRINGS.fluid}
                    className={`fixed bottom-8 right-8 z-50 max-w-sm ${className}`}
                >
                    <div className={`
                        relative bg-zinc-950/95 backdrop-blur-2xl border rounded-2xl p-6
                        ${severityColors[severity]} ${severityGlows[severity]}
                    `}>
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-400 transition-colors"
                        >
                            <X size={16} />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <Flower2 className="text-pink-400" size={18} />
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                                Burnout Oracle
                            </span>
                        </div>

                        {/* Haiku */}
                        <div className="space-y-1">
                            {haiku.split('\n').map((line, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.15 }}
                                    className="text-sm text-zinc-300 font-light italic"
                                >
                                    {line}
                                </motion.p>
                            ))}
                        </div>

                        {/* Subtle wisdom */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-[10px] text-zinc-600 mt-4"
                        >
                            A gentle reminder from the patterns in your code.
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
