'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

interface ComingSoonProps {
    featureName: string
    description?: string
}

export function ComingSoon({ featureName, description }: ComingSoonProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <GlassCard className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]" border="zinc">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/5">
                    <Lock className="text-zinc-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold font-display text-white mb-3">
                    {featureName} is Locked
                </h2>
                <p className="text-text-secondary max-w-md mb-8 leading-relaxed">
                    {description || "This premium feature is currently in development and will be available to all pro members in the upcoming release."}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono tracking-widest uppercase">
                    Unlocking Q1 2026
                </div>
            </GlassCard>
        </motion.div>
    )
}
