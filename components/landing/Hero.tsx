'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from 'framer-motion'
import { ArrowRight, Play, ChevronRight } from 'lucide-react'
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

const StarField = () => {
    const stars = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2
    }))

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute bg-white rounded-full opacity-20"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut"
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
            className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-transparent selection:bg-zinc-500/30"
        >
            {/* Subtle mouse-following glow - kept minimal */}
            <motion.div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            800px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.03),
                            transparent 60%
                        )
                    `
                }}
            />

            <div className="container relative z-10 px-4 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    onClick={() => router.push('/release-notes')}
                    className="cursor-pointer group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 mb-8 backdrop-blur-md"
                >
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">FREE</span>
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">100% free forever — no credit card needed</span>
                    <ChevronRight size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-5xl mx-auto text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[0.9]"
                >
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 pb-2">
                        Your code.
                    </span>
                    <span className="relative inline-block">
                        <span className="absolute -inset-2 bg-white/10 blur-2xl opacity-50" />
                        <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-300">
                            Your story.
                        </span>
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed"
                >
                    See your year in code. Track your velocity, celebrate milestones,
                    and get AI-powered insights — like Spotify Wrapped, but for developers.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <MagneticButton
                        onClick={() => router.push('/signup')}
                        className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Start Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </MagneticButton>

                    <MagneticButton
                        onClick={() => {
                            const featuresSection = document.getElementById('features')
                            featuresSection?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-300 flex items-center gap-2"
                    >
                        See Features
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
