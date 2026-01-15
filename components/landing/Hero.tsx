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
                    PROOF-OF-WORK ENGINE
                </motion.div>

                {/* Main Headline - Staggered Reveal */}
                <motion.h1
                    className="max-w-4xl text-5xl md:text-7xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 mb-6"
                    variants={textContainer}
                    initial="hidden"
                    animate="show"
                >
                    {/* Split text by words for staggered effect */}
                    {"Your code tells a story.".split(" ").map((word, i) => (
                        <motion.span key={i} variants={textItem} className="inline-block mr-[0.2em] last:mr-0 text-white">
                            {word}
                        </motion.span>
                    ))}
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">
                        {"DevFlow makes it unforgettable.".split(" ").map((word, i) => (
                            <motion.span key={`sub-${i}`} variants={textItem} className="inline-block mr-[0.2em] last:mr-0">
                                {word}
                            </motion.span>
                        ))}
                    </span>
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-sm font-mono text-purple-300/80 tracking-widest uppercase mb-6"
                >
                    Ship daily · Build proof · Level up
                </motion.p>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="max-w-2xl text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-10"
                >
                    Every commit. Every streak. Every shipped week.
                    <br className="hidden sm:block" />
                    Transformed into proof that opens doors.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center gap-4 mb-6"
                >
                    {/* Primary CTA - Glass Object */}
                    {session ? (
                        <Link href="/dashboard">
                            <button
                                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-violet-600/20 backdrop-blur-md border border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 hover:from-purple-600/30 hover:to-violet-600/30 hover:shadow-purple-500/60 hover:scale-105 active:scale-95 flex items-center justify-center min-w-[240px]"
                            >
                                <span className="text-white font-semibold text-lg tracking-wide relative z-10 flex items-center gap-2">
                                    Go to Dashboard <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </Link>
                    ) : (
                        <button
                            onClick={handleGithubLogin}
                            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-violet-600/20 backdrop-blur-md border border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 hover:from-purple-600/30 hover:to-violet-600/30 hover:shadow-purple-500/60 hover:scale-105 active:scale-95 flex items-center justify-center min-w-[240px]"
                        >
                            <span className="text-white font-semibold text-lg tracking-wide relative z-10 flex items-center gap-2">
                                Start Building Proof <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    )}

                    {/* Secondary CTA */}
                    <button className="group px-8 py-4 rounded-xl bg-transparent border border-white/10 text-zinc-400 font-medium hover:text-white hover:border-white/20 transition-all duration-300 min-w-[200px] flex items-center justify-center gap-2">
                        <Github className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                        <span className="text-sm">Connect GitHub</span>
                    </button>
                </motion.div>

                {/* Social Proof Line */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="text-xs text-zinc-500 mb-16"
                >
                    Free forever for side projects · No credit card required
                </motion.p>

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
