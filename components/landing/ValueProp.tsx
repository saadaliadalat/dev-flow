'use client'

import { motion } from 'framer-motion'
import { BarChart3, Trophy, Brain, Share2 } from 'lucide-react'

const values = [
    {
        icon: <BarChart3 className="w-6 h-6" />,
        title: "Year-in-Review",
        description: "Like Spotify Wrapped, but for your code. Beautiful cards you'll actually want to share.",
        emoji: "📊"
    },
    {
        icon: <Trophy className="w-6 h-6" />,
        title: "Achievements",
        description: "Unlock badges for coding milestones. 100-day streak? First midnight commit? Flex it.",
        emoji: "🏆"
    },
    {
        icon: <Brain className="w-6 h-6" />,
        title: "Burnout Shield",
        description: "AI detects overwork patterns before burnout hits. Know when to step back.",
        emoji: "🧠"
    },
    {
        icon: <Share2 className="w-6 h-6" />,
        title: "Share Everywhere",
        description: "One-click sharing to Twitter, LinkedIn, or wherever devs flex. Built for virality.",
        emoji: "📸"
    }
]

export function ValueProp() {
    return (
        <section className="py-20 bg-black relative overflow-hidden">
            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        What You Actually Get
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        No vague promises. Here's exactly what DevFlow does for you.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-900/80"
                        >
                            <div className="text-3xl mb-4">{value.emoji}</div>
                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                                {value.title}
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
