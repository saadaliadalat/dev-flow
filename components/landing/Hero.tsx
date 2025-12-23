'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Terminal, Activity, GitBranch, Zap, ChevronRight, Github } from 'lucide-react'
import { GlassButton } from '@/components/ui/GlassButton'
import { DashboardPreview } from './DashboardPreview'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

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
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden items-center justify-center flex flex-col">

            {/* Content Container */}
            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-200 mb-8 backdrop-blur-sm"
                >
                    <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
                    V2.0 PUBLIC BETA
                </motion.div>

                {/* Main Headline - Staggered Reveal */}
                <motion.h1
                    className="max-w-4xl text-5xl md:text-7xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 mb-8"
                    variants={textContainer}
                    initial="hidden"
                    animate="show"
                >
                    {/* Split text by words for staggered effect */}
                    {"Engineering Intelligence for High-Velocity Teams.".split(" ").map((word, i) => (
                        <motion.span key={i} variants={textItem} className="inline-block mr-[0.2em] last:mr-0 text-white">
                            {word}
                        </motion.span>
                    ))}
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="max-w-2xl text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-10"
                >
                    Debug your development cycle. Visualize velocity, prevent burnout, and ship faster—without leaving your CLI.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center gap-4 mb-20"
                >
                    {/* Primary CTA - Glass Object */}
                    {session ? (
                        <Link href="/dashboard">
                            <button
                                className="group relative px-8 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 hover:bg-white/10 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 flex items-center justify-center min-w-[200px]"
                            >
                                <span className="text-white font-medium text-lg tracking-wide relative z-10 flex items-center gap-2">
                                    Go to Dashboard <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </Link>
                    ) : (
                        <button
                            onClick={handleGithubLogin}
                            className="group relative px-8 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 hover:bg-white/10 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 flex items-center justify-center min-w-[200px]"
                        >
                            <span className="text-white font-medium text-lg tracking-wide relative z-10 flex items-center gap-2">
                                Continue with GitHub <Github className="w-4 h-4 opacity-50 group-hover:rotate-12 transition-transform" />
                            </span>
                        </button>
                    )}

                    {/* Secondary CTA */}
                    <button className="group px-8 py-4 rounded-xl bg-transparent border border-white/5 text-zinc-400 font-light hover:text-white hover:border-white/10 transition-all duration-300 min-w-[200px] flex items-center justify-center gap-2">
                        <Terminal className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                        <span className="font-mono text-sm">npx dev-flow init</span>
                    </button>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, rotateX: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ delay: 1.0, duration: 1, type: "spring" }}
                    className="relative w-full max-w-5xl perspective-1000"
                >
                    <DashboardPreview />
                </motion.div>

            </div>
        </section>
    )
}
