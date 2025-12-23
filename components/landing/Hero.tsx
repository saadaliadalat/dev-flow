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
                    className="max-w-4xl text-5xl md:text-7xl font-semibold tracking-tight text-white mb-8"
                    variants={textContainer}
                    initial="hidden"
                    animate="show"
                >
                    {/* Split text by words for staggered effect */}
                    {"Engineering Intelligence for High-Velocity Teams.".split(" ").map((word, i) => (
                        <motion.span key={i} variants={textItem} className="inline-block mr-[0.2em] last:mr-0">
                            {word}
                        </motion.span>
                    ))}
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed mb-10"
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
                    {/* Primary CTA */}
                    {session ? (
                        <Link href="/dashboard">
                            <GlassButton className="bg-white/10 border-white/20 text-lg px-8 py-4 h-auto min-w-[200px]">
                                Go to Dashboard <ChevronRight className="w-4 h-4 ml-2 opacity-50" />
                            </GlassButton>
                        </Link>
                    ) : (
                        <GlassButton
                            onClick={handleGithubLogin}
                            className="bg-white/10 border-white/20 text-lg px-8 py-4 h-auto min-w-[200px]"
                        >
                            Continue with GitHub <Github className="w-4 h-4 ml-2 opacity-50" />
                        </GlassButton>
                    )}

                    {/* Secondary CTA */}
                    <GlassButton variant="secondary" className="text-lg px-8 py-4 h-auto min-w-[200px] text-slate-400 border-white/5 bg-transparent hover:bg-white/5">
                        <Terminal className="w-5 h-5 mr-2 text-slate-500" />
                        npx dev-flow init
                    </GlassButton>
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
