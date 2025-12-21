'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AdaptiveBackground } from '@/components/three/AdaptiveBackground'
import {
    springs,
    slideUpVariants,
    staggerContainerVariants,
    hoverLiftVariants,
} from '@/components/providers/MotionProvider'

// === MAGNETIC BUTTON ===

interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary'
}

function MagneticButton({ children, className = '', onClick, variant = 'primary' }: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springX = useSpring(x, { stiffness: 300, damping: 20 })
    const springY = useSpring(y, { stiffness: 300, damping: 20 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        x.set((e.clientX - centerX) * 0.3)
        y.set((e.clientY - centerY) * 0.3)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    const baseStyles = variant === 'primary'
        ? 'bg-white text-black hover:shadow-glow'
        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springs.snappy}
            className={`
                relative px-8 py-4 rounded-full font-semibold text-base
                transition-all duration-300 ease-out-expo
                flex items-center gap-2 group
                ${baseStyles}
                ${className}
            `}
        >
            {children}
        </motion.button>
    )
}

// === ANIMATED TEXT ===

interface AnimatedTextProps {
    text: string
    className?: string
    delay?: number
}

function AnimatedText({ text, className = '', delay = 0 }: AnimatedTextProps) {
    const words = text.split(' ')

    return (
        <motion.span className={className}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                        duration: 0.6,
                        delay: delay + i * 0.08,
                        ease: [0.25, 1, 0.5, 1],
                    }}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </motion.span>
            ))}
        </motion.span>
    )
}

// === ANIMATED GRADIENT TEXT ===

function GradientText({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`text-gradient-purple animate-gradient-shift bg-[length:200%_auto] ${className}`}>
            {children}
        </span>
    )
}

// === SCROLL INDICATOR ===

function ScrollIndicator() {
    const { scrollY } = useScroll()
    const opacity = useTransform(scrollY, [0, 100], [1, 0])

    return (
        <motion.div
            style={{ opacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-9 rounded-full border border-zinc-700 p-1.5">
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="w-full h-2 rounded-full bg-gradient-to-b from-purple-500 to-purple-600"
                />
            </div>
        </motion.div>
    )
}

// === FLOATING BADGE ===

function FloatingBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="mb-8"
        >
            <motion.div
                whileHover={{ scale: 1.05 }}
                transition={springs.snappy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm"
            >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">
                    Powered by AI Analytics
                </span>
            </motion.div>
        </motion.div>
    )
}

// === STATS ROW ===

function StatsRow() {
    const stats = [
        { value: '10K+', label: 'Developers' },
        { value: '2M+', label: 'Commits Tracked' },
        { value: '99.9%', label: 'Uptime' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center justify-center gap-8 md:gap-12 mt-16 pt-8 border-t border-white/5"
        >
            {stats.map((stat, i) => (
                <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-zinc-500">{stat.label}</div>
                </div>
            ))}
        </motion.div>
    )
}

// === MAIN HERO ===

export function Hero() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg-deepest"
        >
            {/* 3D Background */}
            <AdaptiveBackground className="absolute inset-0 z-0" />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-deepest/50 to-bg-deepest z-[1]" />
            <div className="absolute inset-0 bg-gradient-radial-purple opacity-40 z-[1]" />

            {/* Content */}
            <div className="container relative z-10 px-6 pt-32 pb-20">
                <motion.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center max-w-5xl mx-auto"
                >
                    {/* Badge */}
                    <FloatingBadge />

                    {/* Main Headline */}
                    <motion.h1
                        className="mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1 }}
                    >
                        <AnimatedText
                            text="Code at the"
                            className="block text-[clamp(2.5rem,7vw,5rem)] font-bold tracking-[-0.02em] text-white leading-[1.1]"
                            delay={0.3}
                        />
                        <motion.span
                            initial={{ opacity: 0, y: 30, filter: 'blur(20px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
                            className="block text-[clamp(2.5rem,7vw,5rem)] font-bold tracking-[-0.02em] leading-[1.1]"
                        >
                            <GradientText>Speed of Thought</GradientText>
                        </motion.span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="max-w-2xl text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed"
                    >
                        The developer analytics platform that understands your flow.
                        Track velocity, prevent burnout, and unlock achievements with
                        <span className="text-purple-400"> AI-powered insights</span>.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="flex flex-col sm:flex-row items-center gap-4"
                    >
                        <MagneticButton
                            variant="primary"
                            onClick={() => router.push('/signup')}
                        >
                            Get Started Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </MagneticButton>

                        <MagneticButton
                            variant="secondary"
                            onClick={() => {
                                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
                            }}
                        >
                            <Play size={16} className="fill-current" />
                            Watch Demo
                        </MagneticButton>
                    </motion.div>

                    {/* Stats */}
                    <StatsRow />
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <ScrollIndicator />
        </section>
    )
}
