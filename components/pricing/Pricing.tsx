'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Check, X, Zap, Brain, Palette, Users, Shield,
    Infinity, Crown, ChevronRight, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingTier {
    id: 'free' | 'pro' | 'team'
    name: string
    price: string
    period: string
    description: string
    highlight?: boolean
    cta: string
    features: { name: string; included: boolean; limit?: string }[]
}

const tiers: PricingTier[] = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for side projects and learning',
        cta: 'Get Started',
        features: [
            { name: 'GitHub sync & tracking', included: true },
            { name: 'Streak tracking', included: true },
            { name: 'Basic leaderboard', included: true },
            { name: 'XP & Level system', included: true },
            { name: 'AI Coach queries', included: true, limit: '5/day' },
            { name: 'Proof Cards', included: true, limit: '3/month' },
            { name: 'Challenge friends', included: false },
            { name: 'Season rewards', included: false },
            { name: 'Advanced analytics', included: false },
            { name: 'Priority support', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$9',
        period: '/month',
        description: 'For serious developers building their career',
        highlight: true,
        cta: 'Upgrade to Pro',
        features: [
            { name: 'Everything in Free', included: true },
            { name: 'Unlimited AI Coach', included: true },
            { name: 'Unlimited Proof Cards', included: true },
            { name: '1v1 Challenges', included: true },
            { name: 'Season rewards eligible', included: true },
            { name: 'Advanced analytics', included: true },
            { name: 'Custom profile URL', included: true },
            { name: 'Priority support', included: true },
            { name: 'Early access features', included: true },
            { name: 'Team features', included: false },
        ],
    },
    {
        id: 'team',
        name: 'Team',
        price: '$29',
        period: '/month per seat',
        description: 'For teams that ship together',
        cta: 'Contact Sales',
        features: [
            { name: 'Everything in Pro', included: true },
            { name: 'Team leaderboards', included: true },
            { name: 'Team challenges', included: true },
            { name: 'Manager dashboard', included: true },
            { name: 'Sprint insights', included: true },
            { name: 'Custom integrations', included: true },
            { name: 'SSO & SAML', included: true },
            { name: 'Dedicated support', included: true },
            { name: 'Custom branding', included: true },
            { name: 'API access', included: true },
        ],
    },
]

interface PricingProps {
    currentTier?: 'free' | 'pro' | 'team'
    onUpgrade?: (tier: 'pro' | 'team') => void
    className?: string
}

export function Pricing({ currentTier = 'free', onUpgrade, className }: PricingProps) {
    const [annual, setAnnual] = useState(true)

    const getPrice = (tier: PricingTier) => {
        if (tier.id === 'free') return '$0'
        const monthly = parseInt(tier.price.replace('$', ''))
        if (annual) {
            return `$${Math.floor(monthly * 0.8)}`
        }
        return tier.price
    }

    return (
        <div className={cn("py-12", className)}>
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-3">
                    Level Up Your Development
                </h2>
                <p className="text-zinc-400 max-w-lg mx-auto">
                    Choose the plan that matches your ambition. Upgrade anytime.
                </p>

                {/* Annual Toggle */}
                <div className="flex items-center justify-center gap-3 mt-6">
                    <span className={cn("text-sm", !annual ? "text-white" : "text-zinc-500")}>Monthly</span>
                    <button
                        onClick={() => setAnnual(!annual)}
                        className={cn(
                            "relative w-12 h-6 rounded-full transition-colors",
                            annual ? "bg-purple-500" : "bg-zinc-700"
                        )}
                    >
                        <motion.div
                            className="absolute top-1 w-4 h-4 bg-white rounded-full"
                            animate={{ left: annual ? '28px' : '4px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    </button>
                    <span className={cn("text-sm", annual ? "text-white" : "text-zinc-500")}>
                        Annual <span className="text-emerald-400 text-xs">-20%</span>
                    </span>
                </div>
            </div>

            {/* Tiers */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {tiers.map((tier) => (
                    <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "relative rounded-2xl p-6 border",
                            tier.highlight
                                ? "bg-gradient-to-b from-purple-500/10 to-transparent border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.1)]"
                                : "bg-zinc-900/50 border-white/10"
                        )}
                    >
                        {/* Popular Badge */}
                        {tier.highlight && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-medium">
                                    Most Popular
                                </span>
                            </div>
                        )}

                        {/* Current Badge */}
                        {currentTier === tier.id && (
                            <div className="absolute top-4 right-4">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase tracking-wider">
                                    Current
                                </span>
                            </div>
                        )}

                        {/* Header */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                            <p className="text-sm text-zinc-500">{tier.description}</p>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">{getPrice(tier)}</span>
                            <span className="text-zinc-500 text-sm">{tier.id === 'free' ? '' : (annual ? '/year' : tier.period)}</span>
                        </div>

                        {/* CTA */}
                        <motion.button
                            onClick={() => tier.id !== 'free' && onUpgrade?.(tier.id as 'pro' | 'team')}
                            disabled={currentTier === tier.id}
                            className={cn(
                                "w-full py-3 rounded-xl font-medium transition-all mb-6",
                                tier.highlight
                                    ? "bg-purple-500 text-white hover:bg-purple-600"
                                    : tier.id === 'team'
                                        ? "bg-white/10 text-white hover:bg-white/20"
                                        : "bg-white/5 text-zinc-300 hover:bg-white/10",
                                currentTier === tier.id && "opacity-50 cursor-not-allowed"
                            )}
                            whileHover={{ scale: currentTier !== tier.id ? 1.02 : 1 }}
                            whileTap={{ scale: currentTier !== tier.id ? 0.98 : 1 }}
                        >
                            {currentTier === tier.id ? 'Current Plan' : tier.cta}
                        </motion.button>

                        {/* Features */}
                        <ul className="space-y-3">
                            {tier.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    {feature.included ? (
                                        <Check size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <X size={16} className="text-zinc-600 mt-0.5 flex-shrink-0" />
                                    )}
                                    <span className={cn(
                                        "text-sm",
                                        feature.included ? "text-zinc-300" : "text-zinc-600"
                                    )}>
                                        {feature.name}
                                        {feature.limit && (
                                            <span className="text-zinc-500 ml-1">({feature.limit})</span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// Feature Gate Component - Wraps features that require Pro
interface FeatureGateProps {
    feature: string
    currentTier: 'free' | 'pro' | 'team'
    requiredTier: 'pro' | 'team'
    children: React.ReactNode
    onUpgrade?: () => void
}

export function FeatureGate({
    feature,
    currentTier,
    requiredTier,
    children,
    onUpgrade
}: FeatureGateProps) {
    const tierHierarchy = { free: 0, pro: 1, team: 2 }
    const hasAccess = tierHierarchy[currentTier] >= tierHierarchy[requiredTier]

    if (hasAccess) {
        return <>{children}</>
    }

    return (
        <div className="relative">
            {/* Blurred content */}
            <div className="filter blur-sm pointer-events-none opacity-50">
                {children}
            </div>

            {/* Upgrade overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm rounded-2xl">
                <div className="text-center p-6">
                    <Crown size={32} className="text-amber-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">{feature}</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                        Upgrade to {requiredTier === 'pro' ? 'Pro' : 'Team'} to unlock
                    </p>
                    <motion.button
                        onClick={onUpgrade}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/30 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Sparkles size={16} />
                        Upgrade Now
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

// Upgrade Prompt Banner
export function UpgradeBanner({
    feature,
    onUpgrade,
    className
}: {
    feature: string
    onUpgrade?: () => void
    className?: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-xl p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                        <Crown size={18} className="text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{feature}</p>
                        <p className="text-xs text-zinc-500">Available with Pro</p>
                    </div>
                </div>
                <motion.button
                    onClick={onUpgrade}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Upgrade
                    <ChevronRight size={14} />
                </motion.button>
            </div>
        </motion.div>
    )
}
