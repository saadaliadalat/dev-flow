'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle2, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react'

type InsightType = 'success' | 'warning' | 'tip'

interface InsightCardProps {
    type: InsightType
    title: string
    description: string
    details?: string[]
    actionLabel?: string
    onAction?: () => void
}

const typeConfig = {
    success: {
        icon: CheckCircle2,
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        iconColor: '#FFFFFF', // White
        badgeBg: 'rgba(255, 255, 255, 0.1)',
        badgeText: '#FFFFFF',
        badge: 'Completed',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        iconColor: '#a1a1aa', // Silver
        badgeBg: 'rgba(255, 255, 255, 0.1)',
        badgeText: '#a1a1aa', // Silver
        badge: 'Action Required',
    },
    tip: {
        icon: Lightbulb,
        bg: 'rgba(139, 92, 246, 0.1)', // Purple Tint
        border: 'rgba(139, 92, 246, 0.2)',
        iconColor: '#a78bfa', // Purple Light
        badgeBg: 'rgba(139, 92, 246, 0.15)',
        badgeText: '#a78bfa',
        badge: 'Suggestion',
    },
}

export function InsightCard({
    type,
    title,
    description,
    details,
    actionLabel,
    onAction,
}: InsightCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const config = typeConfig[type]
    const Icon = config.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card overflow-hidden"
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            backgroundColor: config.bg,
                            border: `1px solid ${config.border}`,
                        }}
                    >
                        <Icon size={18} style={{ color: config.iconColor }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="text-sm font-semibold text-white">{title}</h4>
                            <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                                style={{
                                    backgroundColor: config.badgeBg,
                                    color: config.badgeText,
                                }}
                            >
                                {config.badge}
                            </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
                    </div>
                </div>

                {/* Expandable Details */}
                {details && details.length > 0 && (
                    <>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors focus-ring rounded"
                            aria-expanded={isExpanded}
                        >
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={14} />
                            </motion.div>
                            {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <ul className="mt-3 space-y-2 pl-14">
                                        {details.map((detail, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                                    style={{ backgroundColor: config.iconColor }}
                                                />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Action Button */}
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="mt-4 ml-14 inline-flex items-center gap-2 text-sm font-medium transition-all hover:gap-3 focus-ring rounded"
                        style={{ color: config.iconColor }}
                    >
                        {actionLabel}
                        <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </motion.div>
    )
}

// Skeleton for loading
export function InsightCardSkeleton() {
    return (
        <div className="premium-card p-5 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)]" />
                <div className="flex-1">
                    <div className="w-32 h-4 rounded bg-[var(--bg-elevated)] mb-2" />
                    <div className="w-full h-3 rounded bg-[var(--bg-elevated)]" />
                    <div className="w-2/3 h-3 rounded bg-[var(--bg-elevated)] mt-1" />
                </div>
            </div>
        </div>
    )
}
