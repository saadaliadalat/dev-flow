'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Github, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Pricing() {
    const router = useRouter()

    return (
        <section id="pricing" className="py-32 relative bg-black overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                        Professional Tools. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Zero Cost.</span>
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        We believe advanced analytics should be accessible to every developer.
                        <br /> No credit card required. Open source forever.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-white/5"
                    >
                        <div className="bg-[#0c0c0c] rounded-[20px] p-8 md:p-12 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold uppercase tracking-wider">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Free Forever
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-4">Complete Access</h3>
                                    <div className="text-5xl font-bold text-white mb-6">$0<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                                    <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                                        Get unrestricted access to our entire suite of velocity tracking, AI insights, and team collaboration tools.
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => router.push('/signup')}
                                            className="w-full py-4 rounded-xl bg-white text-black font-bold text-base hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                        >
                                            <Github className="w-5 h-5" />
                                            Start with GitHub
                                        </button>
                                        <p className="text-center text-xs text-zinc-500 mt-2">
                                            No credit card required.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-400" fill="currentColor" />
                                        Everything included:
                                    </p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            "Unlimited Repositories",
                                            "Unlimited History",
                                            "AI Code Analysis (GPT-4)",
                                            "Team Velocity Dashboard",
                                            "Burnout Protection",
                                            "Year in Review Export",
                                            "Private Leaderboards",
                                            "API Access"
                                        ].map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 text-zinc-300">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="text-center mt-12">
                        <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
                            Want to support the project?
                            <a href="#" className="text-zinc-300 hover:text-white underline decoration-zinc-700 underline-offset-4 flex items-center gap-1">
                                <Heart size={14} className="text-red-500 fill-red-500/20" /> Sponsor on GitHub
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
