'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function ChangelogPage() {
    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.h1 variants={itemVariants} className="text-4xl font-display font-bold mb-8">Changelog</motion.h1>
                <motion.div variants={itemVariants} className="space-y-8">
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold text-sm">v1.0.0</span>
                            <span className="text-text-tertiary text-sm">December 18, 2024</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Initial Release</h2>
                        <ul className="list-disc list-inside text-text-secondary space-y-2">
                            <li>Launched DevFlow publicly.</li>
                            <li>Added GitHub integration for commit tracking.</li>
                            <li>Implemented Productivity Score algorithm.</li>
                            <li>Released Dark Mode UI system.</li>
                        </ul>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </div>
    )
}
