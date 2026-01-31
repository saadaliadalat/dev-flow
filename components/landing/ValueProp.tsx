'use client'

import { motion } from 'framer-motion'
import { BarChart3, Trophy, Brain, Share2, Sparkles } from 'lucide-react'

const values = [
    {
        icon: <BarChart3 className="w-5 h-5" />,
        title: "Year-in-Review",
        description: "Like Spotify Wrapped, but for your code. Beautiful cards you'll actually want to share."
    },
    {
        icon: <Trophy className="w-5 h-5" />,
        title: "Achievements",
        description: "Unlock badges for coding milestones. 100-day streak? First midnight commit? Flex it."
    },
    {
        icon: <Brain className="w-5 h-5" />,
        title: "Burnout Shield",
        description: "AI detects overwork patterns before burnout hits. Know when to step back."
    },
    {
        icon: <Share2 className="w-5 h-5" />,
        title: "Share Everywhere",
        description: "One-click sharing to Twitter, LinkedIn, or wherever devs flex. Built for virality."
    }
]

export function ValueProp() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.12),transparent)]" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Core Features</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        What You Actually Get
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        No vague promises. Here's exactly what DevFlow delivers.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="group relative"
                        >
                            {/* Card */}
                            <div className="relative h-full p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent overflow-hidden transition-all duration-300 group-hover:from-purple-500/30 group-hover:to-purple-500/5">
                                <div className="relative h-full rounded-[15px] bg-zinc-900/95 backdrop-blur-sm p-6">

                                    {/* Icon Container - Purple theme */}
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-all duration-300">
                                        <span className="text-purple-400 group-hover:text-purple-300 transition-colors">{value.icon}</span>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">
                                        {value.title}
                                    </h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
