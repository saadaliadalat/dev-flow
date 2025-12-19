'use client'

import { motion } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { Github, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { containerVariants, itemVariants } from '@/lib/animations'

export function Hero() {
    const router = useRouter()
    return (
        <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pt-20">

            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-glow" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-glow delay-1000" />

                {/* Grid Mesh */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    {/* Badge */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-300">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            v1.0 is now live
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-display font-black tracking-tight mb-8 leading-tight"
                    >
                        Your Coding Journey, <br />
                        <span className="text-gradient">Beautifully Visualized.</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-text-tertiary max-w-2xl mb-10 leading-relaxed"
                    >
                        Transform your GitHub activity into actionable insights, achievements, and stunning year-in-review cards that developers love to share.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <GradientButton size="lg" icon={<Github className="w-5 h-5" />} onClick={() => router.push('/login')}>
                            Sign Up with GitHub
                        </GradientButton>
                        <GradientButton variant="ghost" size="lg" icon={<Play className="w-5 h-5" />} onClick={() => router.push('/#how-it-works')}>
                            Watch Demo
                        </GradientButton>
                    </motion.div>

                    {/* Visual Element / Dashboard Preview */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-20 relative w-full max-w-5xl mx-auto"
                    >
                        <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-2 shadow-2xl overflow-hidden ring-1 ring-white/10 hover:ring-cyan-500/50 transition-all duration-500">
                            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Fake UI */}
                            <div className="aspect-[16/9] w-full bg-bg-deep rounded-xl overflow-hidden relative">
                                {/* Navbar Mockup */}
                                <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                    </div>
                                </div>

                                {/* Grid Content */}
                                <div className="p-6 grid grid-cols-3 gap-6">
                                    <div className="col-span-2 h-40 bg-white/5 rounded-lg animate-pulse" />
                                    <div className="col-span-1 h-40 bg-white/5 rounded-lg animate-pulse delay-100" />
                                    <div className="col-span-1 h-40 bg-white/5 rounded-lg animate-pulse delay-200" />
                                    <div className="col-span-2 h-40 bg-white/5 rounded-lg animate-pulse delay-300" />
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-12 -top-12 z-20 hidden lg:block"
                        >
                            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
                                <div className="text-3xl">🏆</div>
                                <div>
                                    <div className="text-xs text-text-tertiary">Current Streak</div>
                                    <div className="text-lg font-bold text-white">42 Days</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -left-12 bottom-12 z-20 hidden lg:block"
                        >
                            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
                                <div className="text-3xl">🚀</div>
                                <div>
                                    <div className="text-xs text-text-tertiary">Productivity</div>
                                    <div className="text-lg font-bold text-green-400">+128%</div>
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
