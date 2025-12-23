'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function RoadmapPage() {
    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.h1 variants={itemVariants} className="text-4xl font-display font-bold mb-8">Product Roadmap</motion.h1>
                <motion.div variants={itemVariants} className="space-y-6">
                    <GlassCard className="p-6 border-l-4 border-l-white/20">
                        <h3 className="text-xl font-bold mb-2">Q1 2025: Team Analytics</h3>
                        <p className="text-text-secondary">Group statistics, leaderboards for organizations, and manager insights.</p>
                    </GlassCard>
                    <GlassCard className="p-6 border-l-4 border-l-purple-500">
                        <h3 className="text-xl font-bold mb-2">Q2 2025: IDE Extensions</h3>
                        <p className="text-text-secondary">VS Code and JetBrains plugins for real-time flow state tracking.</p>
                    </GlassCard>
                    <GlassCard className="p-6 border-l-4 border-l-zinc-600">
                        <h3 className="text-xl font-bold mb-2">Q3 2025: AI Pair Programmer</h3>
                        <p className="text-text-secondary">Personalized coding advice based on your historical patterns.</p>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </div>
    )
}
