'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { containerVariants, itemVariants } from '@/lib/animations'
import { Users, Code2, Globe } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="container mx-auto px-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto"
            >
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
                        We Are <span className="text-gradient">DevFlow</span>
                    </h1>
                    <p className="text-xl text-text-tertiary">
                        Empowering developers to track, improve, and showcase their journey.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <GlassCard className="text-center p-6" glow="cyan">
                        <div className="mx-auto w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-4">
                            <Users size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Community First</h3>
                        <p className="text-sm text-text-tertiary">Built by developers, for developers. We understand the grind.</p>
                    </GlassCard>

                    <GlassCard className="text-center p-6" glow="purple">
                        <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4">
                            <Code2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Open Source</h3>
                        <p className="text-sm text-text-tertiary">We believe in transparency and contributing back to the ecosystem.</p>
                    </GlassCard>

                    <GlassCard className="text-center p-6" glow="none">
                        <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-4">
                            <Globe size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Global Impact</h3>
                        <p className="text-sm text-text-tertiary">Helping thousands of developers worldwide prevent burnout.</p>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard className="p-8 md:p-12">
                        <h2 className="text-3xl font-bold font-display mb-6">Our Mission</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                In 2024, developer burnout reached an all-time high. The pressure to ship code, learn new frameworks, and maintain a green contribution graph is immense.
                            </p>
                            <p>
                                We built DevFlow to change the narrative. Instead of just counting commits, we measure impact. Instead of encouraging overwork, we detect burnout before it happens.
                            </p>
                            <p>
                                Our goal is to give every developer a "Spotify Wrapped" style experience for their daily work—turning raw data into a story of growth, achievements, and healthy productivity.
                            </p>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </div>
    )
}
