'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GitCommit, Zap, BarChart3 } from 'lucide-react'

const features = [
    {
        title: "Connect & Sync",
        description: "Link your GitHub in seconds. We automatically backfill your history and start tracking velocity.",
        icon: <GitCommit className="w-6 h-6 text-purple-400" />,
        code: "git commit -m 'feat: next-level shit'",
        color: "from-purple-500/20 to-zinc-500/20",
        delay: 0
    },
    {
        title: "AI Analysis",
        description: "Our neural engine scans your patterns to identify peak flow hours and potential burnout risks.",
        icon: <Zap className="w-6 h-6 text-purple-300" />,
        code: "Analyzing... Flow State: 98%",
        color: "from-purple-500/20 to-zinc-500/20",
        delay: 0.2
    },
    {
        title: "Level Up",
        description: "Unlock achievements, visualize your growth, and flex your Year in Review.",
        icon: <BarChart3 className="w-6 h-6 text-white" />,
        code: "Achievement Unlocked: 10x Dev",
        color: "from-zinc-500/20 to-purple-500/20",
        delay: 0.4
    }
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 relative overflow-hidden bg-black">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-6"
                    >
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        Workflow
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
                    >
                        From Commit to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">Insight</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-zinc-400 text-lg"
                    >
                        Automated, invisible, and designed for flow. No manual entry required.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div className="hidden md:block absolute top-[20%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    {features.map((feature, i) => (
                        <FeatureCard key={i} {...feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function FeatureCard({ title, description, icon, code, color, delay, index }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay }}
            viewport={{ once: true }}
            className="relative h-full"
        >
            <div className="group relative z-10 h-full p-1 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="bg-[#0c0c0c] rounded-[22px] h-full p-8 flex flex-col items-center text-center overflow-hidden relative">
                    <div className="absolute top-4 right-6 text-[80px] font-bold text-white/5 font-display select-none">
                        0{index + 1}
                    </div>
                    <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                        {icon}
                        <div className={`absolute inset-0 bg-gradient-to-br ${color} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-8">{description}</p>
                    <div className="mt-auto w-full p-3 rounded-lg bg-[#050505] border border-white/5 font-mono text-xs text-zinc-500 overflow-hidden text-left relative group-hover:border-white/10 transition-colors">
                        <div className="flex gap-1.5 mb-2 opacity-50">
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        </div>
                        <span className="text-purple-400">$</span> {code}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
