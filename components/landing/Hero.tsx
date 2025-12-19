'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { Github, Play, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import Image from 'next/image'

// Particle Field Component
const ParticleField = () => {
    // Generate static positions for particles to avoid hydration mismatch
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        top: `${(i * 3.3 * 7) % 100}%`,
        left: `${(i * 7.1 * 3) % 100}%`,
        size: (i % 3) + 1,
        duration: (i % 5) + 10,
        delay: -(i % 10)
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-purple-400/30"
                    style={{
                        left: particle.left,
                        top: particle.top,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

// Floating 3D Object Component
const FloatingObject = ({ delay = 0, className, style }: { delay?: number, className?: string, style?: React.CSSProperties }) => (
    <motion.div
        className={`absolute hidden md:block z-0 pointer-events-none ${className}`}
        style={style}
        animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
        }}
        transition={{
            duration: 6,
            repeat: Infinity,
            delay,
            ease: "easeInOut"
        }}
    >
        <div className="relative w-24 h-24 md:w-32 md:h-32 opacity-60 mix-blend-screen">
            <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full" />
            {/* Simple Geometric Shape Representation since we don't have the crystal png */}
            <div className="w-full h-full border border-purple-500/30 bg-purple-500/5 backdrop-blur-sm transform rotate-45 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.4)]" />
        </div>
    </motion.div>
)

export function Hero() {
    const router = useRouter()
    const { scrollY } = useScroll()
    const opacity = useTransform(scrollY, [0, 300], [1, 0])
    const y = useTransform(scrollY, [0, 300], [0, 50])

    return (
        <section className="relative min-h-[140vh] flex flex-col items-center pt-32 overflow-hidden bg-bg-deepest">

            {/* Background Layers */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Purple Planet / Sphere */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] opacity-60 blur-sm pointer-events-none z-0">
                    <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.8)_0%,rgba(124,58,237,0.6)_30%,rgba(107,33,168,0.4)_60%,rgba(88,28,135,0.2)_100%)] animate-pulse-slow shadow-[0_0_100px_rgba(168,85,247,0.5),inset_0_0_100px_rgba(168,85,247,0.3)]" />
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400/20 shadow-[0_0_50px_rgba(168,85,247,0.4)]" />
                </div>

                {/* Secondary Gradients */}
                <div className="absolute bottom-0 inset-x-0 h-[400px] bg-gradient-to-t from-bg-deepest to-transparent z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15)_0%,transparent_50%)]" />

                {/* Particle Field */}
                <ParticleField />

                {/* Floating Objects */}
                <FloatingObject delay={0} style={{ top: '15%', left: '10%' }} />
                <FloatingObject delay={2} style={{ top: '55%', right: '15%' }} />
                <FloatingObject delay={4} style={{ bottom: '25%', left: '20%' }} />
            </div>

            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm tracking-wide font-medium text-silver backdrop-blur-md hover:border-purple-500/50 transition-colors cursor-pointer group shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-silver to-white font-display">
                            Precision. Speed. Intelligence.
                        </span>
                    </span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-7xl md:text-9xl font-display font-black tracking-[0.1em] mb-6 text-white uppercase drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]"
                >
                    DEVFLOW
                </motion.h1>

                {/* Tagline */}
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-2xl md:text-4xl font-light tracking-[0.15em] text-silver-light uppercase opacity-90 mb-8"
                >
                    Stop Guessing. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200">Start Scaling.</span>
                </motion.h2>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-lg md:text-xl text-zinc max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Transform your GitHub activity into actionable insights, achievements, and stunning year-in-review cards. The developer productivity platform built for the future.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto mb-20"
                >
                    <GradientButton
                        size="lg"
                        icon={<Github className="w-5 h-5" />}
                        onClick={() => router.push('/login')}
                        className="min-w-[220px] shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                    >
                        Build My Analytics
                    </GradientButton>
                    <GradientButton
                        variant="secondary"
                        size="lg"
                        icon={<Play className="w-5 h-5 fill-current" />}
                        onClick={() => router.push('/#demo')}
                        className="min-w-[200px]"
                    >
                        Watch Demo
                    </GradientButton>
                </motion.div>

                {/* 3D Dashboard Preview */}
                <motion.div
                    style={{ opacity, y, scale: 0.95 }}
                    className="w-full relative z-20 max-w-6xl"
                >
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl -z-10 rounded-full opacity-50" />
                    <DashboardPreview />
                </motion.div>
            </div>
        </section>
    )
}
