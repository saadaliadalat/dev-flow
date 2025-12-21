'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
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

// --- MAIN HERO COMPONENT ---

export function Hero() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-bg-deepest selection:bg-white/20"
        >
            <div className="container relative z-10 px-4 flex flex-col items-center text-center">
                {/* DevFlow Brand Presentation */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-3">
                        {/* Logo mark */}
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black">
                                <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" fill="currentColor" />
                            </svg>
                        </div>
                        {/* Wordmark */}
                        <span className="text-2xl font-semibold tracking-tight text-white">
                            DevFlow
                        </span>
                    </div>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-4xl mx-auto mb-6"
                >
                    <span className="block text-[clamp(2.5rem,8vw,6rem)] font-extrabold tracking-[-0.03em] text-white leading-[1.05]">
                        Code at the
                    </span>
                    <span className="block text-[clamp(2.5rem,8vw,6rem)] font-extrabold tracking-[-0.03em] leading-[1.05]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">
                            Speed of Thought
                        </span>
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-lg mx-auto text-lg md:text-xl text-zinc-500 mb-10 leading-relaxed tracking-[-0.01em]"
                >
                    Developer analytics that understand your flow. Visualize velocity, prevent burnout, unlock achievements.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <MagneticButton
                        onClick={() => router.push('/signup')}
                        className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-base hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-300"
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
                        className="px-8 py-4 rounded-full bg-zinc-900 border border-zinc-800 text-white font-medium text-base hover:bg-zinc-800 transition-all duration-300 flex items-center gap-2"
                    >
                        <Play size={16} fill="currentColor" />
                        Watch Demo
                    </MagneticButton>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                style={{ opacity: useTransform(scrollY, [0, 100], [1, 0]) }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-5 h-9 rounded-full border border-zinc-800 p-1">
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-full h-2 rounded-full bg-zinc-700"
                    />
                </div>
            </motion.div>
        </section>
    )
}
