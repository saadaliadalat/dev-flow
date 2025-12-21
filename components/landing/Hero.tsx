'use client'

import React, { useRef, useMemo } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from 'framer-motion'
import { ArrowRight, Play, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

// --- UTILITY COMPONENTS ---

const MagneticButton = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
    const ref = useRef<HTMLButtonElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 }
        const center = { x: left + width / 2, y: top + height / 2 }
        x.set((clientX - center.x) * 0.35)
        y.set((clientY - center.y) * 0.35)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.button>
    )
}

// --- GALAXY STAR FIELD ---

const GalaxyField = () => {
    // Generate stable star data with useMemo
    const { distantStars, mediumStars, brightStars, shootingStars } = useMemo(() => {
        // Distant dim stars (most numerous, smallest)
        const distant = Array.from({ length: 120 }).map((_, i) => ({
            id: `distant-${i}`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 1 + 0.5,
            opacity: Math.random() * 0.3 + 0.1,
        }))

        // Medium stars with subtle pulse
        const medium = Array.from({ length: 40 }).map((_, i) => ({
            id: `medium-${i}`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 1.5 + 1,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 3,
        }))

        // Bright accent stars (few, prominent)
        const bright = Array.from({ length: 15 }).map((_, i) => ({
            id: `bright-${i}`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 2,
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 2,
        }))

        // Shooting stars (commits flying through)
        const shooting = Array.from({ length: 4 }).map((_, i) => ({
            id: `shooting-${i}`,
            startTop: Math.random() * 50,
            startLeft: Math.random() * 30 + 60,
            duration: Math.random() * 2 + 3,
            delay: Math.random() * 8 + i * 4,
            length: Math.random() * 80 + 60,
        }))

        return {
            distantStars: distant,
            mediumStars: medium,
            brightStars: bright,
            shootingStars: shooting,
        }
    }, [])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Deep space gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.8)_100%)]" />

            {/* Subtle nebula glow effect */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-zinc-800/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-zinc-700/5 rounded-full blur-[100px]" />

            {/* Grid lines - productivity matrix feel */}
            <div className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, white 1px, transparent 1px),
                        linear-gradient(to bottom, white 1px, transparent 1px)
                    `,
                    backgroundSize: '80px 80px',
                }}
            />

            {/* Distant stars layer */}
            {distantStars.map((star) => (
                <div
                    key={star.id}
                    className="absolute bg-white rounded-full"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        opacity: star.opacity,
                    }}
                />
            ))}

            {/* Medium pulsing stars */}
            {mediumStars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute bg-white rounded-full"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Bright accent stars with glow */}
            {brightStars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute"
                    style={{
                        top: star.top,
                        left: star.left,
                    }}
                    animate={{
                        opacity: [0.4, 1, 0.4],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut"
                    }}
                >
                    <div
                        className="bg-white rounded-full"
                        style={{
                            width: star.size,
                            height: star.size,
                            boxShadow: `0 0 ${star.size * 3}px ${star.size}px rgba(255,255,255,0.3)`,
                        }}
                    />
                </motion.div>
            ))}

            {/* Shooting stars - like commits being pushed */}
            {shootingStars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute h-[1px] origin-left"
                    style={{
                        top: `${star.startTop}%`,
                        left: `${star.startLeft}%`,
                        width: star.length,
                        background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.8), transparent)',
                        rotate: 35,
                    }}
                    initial={{ opacity: 0, x: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        x: [0, -200],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeOut",
                        times: [0, 0.1, 0.8, 1],
                    }}
                />
            ))}
        </div>
    )
}

// --- MAIN HERO COMPONENT ---

export function Hero() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-bg-deepest selection:bg-white/20"
        >
            {/* Background layers */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-0" />
                <GalaxyField />
                <motion.div
                    className="pointer-events-none absolute -inset-px opacity-0 hover:opacity-100 transition duration-300"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                650px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.03),
                                transparent 80%
                            )
                        `
                    }}
                />
            </div>

            <div className="container relative z-10 px-4 flex flex-col items-center text-center">
                {/* Redesigned Badge - Terminal style */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    onClick={() => router.push('/release-notes')}
                    className="cursor-pointer group mb-10"
                >
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 backdrop-blur-xl">
                        {/* Pulsing status indicator */}
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        {/* Version tag */}
                        <span className="font-mono text-xs text-zinc-500">v2.0</span>
                        <span className="w-px h-4 bg-zinc-800"></span>
                        {/* Main text */}
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors tracking-tight">
                            Now shipping with Flow Analytics
                        </span>
                        <Zap size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </div>
                </motion.div>

                {/* Improved Typography - Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-5xl mx-auto mb-8"
                >
                    <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.04em] text-white/90 leading-[1.1] mb-2">
                        Code at the
                    </span>
                    <span className="relative inline-block">
                        <span className="absolute -inset-4 bg-gradient-to-r from-white/10 via-zinc-500/10 to-white/10 blur-3xl opacity-50" />
                        <span className="relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
                            Speed of Thought
                        </span>
                    </span>
                </motion.h1>

                {/* Improved Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-xl mx-auto text-base sm:text-lg md:text-xl text-zinc-500 mb-12 leading-relaxed tracking-tight font-light"
                >
                    Developer analytics that understand your flow.{' '}
                    <span className="text-zinc-400">Visualize velocity, prevent burnout, and unlock achievements—all from your CLI.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <MagneticButton
                        onClick={() => router.push('/signup')}
                        className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Get Started
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </MagneticButton>

                    <MagneticButton
                        onClick={() => {
                            const demoSection = document.getElementById('demo')
                            demoSection?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 backdrop-blur-md transition-all duration-300 flex items-center gap-2"
                    >
                        <Play size={18} fill="currentColor" />
                        Watch Demo
                    </MagneticButton>
                </motion.div>
            </div>

            <motion.div
                style={{ opacity: useTransform(scrollY, [0, 100], [1, 0]) }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-5 h-9 rounded-full border border-white/20 p-1">
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-full h-2 rounded-full bg-white/50"
                    />
                </div>
            </motion.div>
        </section>
    )
}
