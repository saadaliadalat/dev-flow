'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Github } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function FinalCTA() {
    const router = useRouter()

    return (
        <section className="relative py-32 overflow-hidden flex items-center justify-center bg-black">
            {/* Background Matrix/Grid effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container relative z-10 px-6 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight"
                >
                    Ready to enter <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Flow State?</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                    className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto"
                >
                    Join 10,000+ developers tracking their velocity and building faster with DevFlow.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => router.push('/signup')}
                        className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <Github className="w-5 h-5" />
                        Start with GitHub
                    </button>
                    <button
                        onClick={() => router.push('/contact')}
                        className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-colors"
                    >
                        Talk to Sales
                    </button>
                </motion.div>
            </div>
        </section>
    )
}
