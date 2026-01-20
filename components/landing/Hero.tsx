'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { ArrowRight, Terminal, Activity, GitBranch, Zap, ChevronRight, Github } from 'lucide-react'
import { GlassButton } from '@/components/ui/GlassButton'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

// Dynamic import - DashboardPreview is below the fold
const DashboardPreview = dynamic(
    () => import('./DashboardPreview').then(m => m.DashboardPreview),
    { loading: () => <div className="w-full h-[400px] bg-zinc-900/50 rounded-xl animate-pulse" /> }
)

// --- Text Reveal Animation ---
const textContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
}

const textItem = {
    hidden: { y: 20, opacity: 0, filter: 'blur(10px)' },
    show: {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }
}

export const Hero = () => {
    const { data: session } = useSession()

    const handleGithubLogin = () => {
        signIn('github', { callbackUrl: '/dashboard' })
    }

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-visible items-center justify-center flex flex-col">

            {/* Content Container */}
            <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                {/* LEFT COLUMN: Typography & Actions */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">

                    {/* Kicker */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="text-xs font-mono text-purple-400 tracking-widest uppercase mb-6"
                    >
                        SHIP DAILY · BUILD PROOF · LEVEL UP
                    </motion.p>

                    {/* Main Headline */}
                    <motion.h1
                        className="max-w-4xl text-5xl md:text-7xl font-medium tracking-tight text-white mb-6 leading-[1.1]"
                        variants={textContainer}
                        initial="hidden"
                        animate="show"
                    >
                        {"Your code tells a story.".split(" ").map((word, i) => (
                            <motion.span key={i} variants={textItem} className="inline-block mr-[0.2em] last:mr-0">
                                {word}
                            </motion.span>
                        ))}
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="max-w-xl text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-8"
                    >
                        Every commit. Every streak. Every shipped week.
                        <br className="hidden lg:block" />
                        Transformed into proof that opens doors.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                    >
                        {/* Primary CTA */}
                        {session ? (
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <button className="group w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                    <span>Go to Dashboard</span>
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </Link>
                        ) : (
                            <button
                                onClick={handleGithubLogin}
                                className="group w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                <span>Start Building</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        )}

                        {/* Secondary CTA */}
                        <Link href="https://github.com/saadaliadalat/dev-flow" target="_blank" className="w-full sm:w-auto">
                            <button className="group w-full sm:w-auto px-8 py-3.5 rounded-lg bg-transparent border border-white/20 text-white font-medium hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                                <Github className="w-4 h-4" />
                                <span className="text-sm">View on GitHub</span>
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Bento Image Composition */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 1, type: "spring" }}
                    className="relative order-1 lg:order-2 w-full max-w-[600px] lg:max-w-none mx-auto h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center"
                >
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-purple-600/20 blur-[120px] rounded-full z-[-1]" />

                    {/* Base Layer: Deep Analytics */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[85%] z-10">
                        <img
                            src="/image_ae24c0.png"
                            alt="Deep Analytics"
                            className="w-full h-auto rounded-xl border border-white/10 shadow-2xl"
                        />
                    </div>

                    {/* Floating Card 1: Soul Velocity (Bottom-Left) */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="absolute bottom-[5%] -left-[5%] md:bottom-[10%] md:-left-[10%] w-[45%] md:w-[40%] z-20"
                    >
                        <div className="rounded-xl border border-zinc-700/50 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden p-1">
                            <div className="relative w-full aspect-square md:aspect-auto">
                                <img
                                    src="/image_ae251c.png"
                                    alt="Soul Velocity"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Floating Card 2: Rank/Arena (Top-Right) */}
                    <motion.div
                        initial={{ y: -40, opacity: 0, rotate: 0 }}
                        animate={{ y: 0, opacity: 1, rotate: 2 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="absolute top-[10%] -right-[5%] md:-right-[10%] w-[50%] md:w-[45%] z-30"
                    >
                        <div className="rounded-xl border border-zinc-700/50 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden p-1">
                            <img
                                src="/image_ae24fc.png"
                                alt="DevFlow Arena"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </motion.div>

                    {/* Floating Badge (Top-Left) */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                        className="absolute -top-[5%] left-[5%] md:left-0 z-40 w-[35%] md:w-[30%]"
                    >
                        <div className="rounded-full shadow-2xl">
                            <img
                                src="/image_ae249f.png"
                                alt="Streak Badge"
                                className="w-full h-auto object-contain drop-shadow-2xl"
                            />
                        </div>
                    </motion.div>

                </motion.div>

            </div>
        </section>
    )
}
