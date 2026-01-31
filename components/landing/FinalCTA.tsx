'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Github, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function FinalCTA() {
    const router = useRouter()

    return (
        <section className="relative py-32 overflow-hidden flex items-center justify-center bg-black">
            <div className="container relative z-10 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8"
                >
                    <Sparkles size={16} />
                    Forever Free — No Catch
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight"
                >
                    Your year in code <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-white">awaits.</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                    className="text-xl text-zinc-400 mb-12 max-w-xl mx-auto"
                >
                    Join 2,500+ developers who've already uncovered their coding story. Takes 30 seconds.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-4"
                >
                    <button
                        onClick={() => router.push('/signup')}
                        className="group px-10 py-5 rounded-full bg-white text-black font-bold text-lg transition-all duration-300 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 flex items-center gap-3"
                    >
                        <Github className="w-5 h-5" />
                        Get Started — It's Free
                    </button>
                    <p className="text-zinc-500 text-sm">
                        Takes less than 30 seconds to set up
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

