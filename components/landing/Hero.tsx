'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion'
import { ArrowRight, Play, Sparkles, Zap, Command, GitCommit, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
    // Generate random stars for background depth
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

const CodeSnippetCard = ({ code, language, delay, x, y, rotate }: { code: string, language: string, delay: number, x: string, y: string, rotate: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.8 }}
            className="absolute hidden xl:block p-4 rounded-2xl bg-[#09090b]/90 border border-white/10 backdrop-blur-xl shadow-2xl font-mono text-xs"
            style={{ left: x, top: y, rotate }}
        >
            <div className="flex items-center gap-2 mb-3 opacity-50">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[10px]">{language}</span>
            </div>
            <pre className="text-zinc-300">
                <code>
                    {code.split('\n').map((line, i) => (
                        <div key={i} className="flex">
                            <span className="w-6 inline-block text-zinc-600 select-none">{i + 1}</span>
                            <span dangerouslySetInnerHTML={{ __html: line }} />
                        </div>
                    ))}
                </code>
            </pre>
        </motion.div>
    )
}

// --- MAIN HERO COMPONENT ---

export function Hero() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()

    // Parallax & Transform hooks
    const y1 = useTransform(scrollY, [0, 500], [0, 200])
    const y2 = useTransform(scrollY, [0, 500], [0, -150])
    const opacity = useTransform(scrollY, [0, 500], [1, 0])
    const rotateX = useTransform(scrollY, [0, 600], [20, 45])
    const scale = useTransform(scrollY, [0, 600], [1, 0.9])

    // Mouse Spotlight Effect
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
            className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden bg-black selection:bg-purple-500/30"
        >
            {/* 1. LAYERED AMBIENT BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Background Matrix/Grid effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                {/* Aurora Gradients */}
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />

                <StarField />

                {/* Mouse Follower Spotlight */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-xl opacity-0 hover:opacity-100 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                650px circle at ${mouseX}px ${mouseY}px,
                                rgba(124, 58, 237, 0.1),
                                transparent 80%
                            )
                        `
                    }}
                />
            </div>

            {/* 2. FLOATING CODE ELEMENTS (Atmosphere) */}
            <CodeSnippetCard
                x="5%"
                y="20%"
                rotate={-6}
                delay={0.5}
                language="stats.ts"
                code={`interface Stats {<br/>  commits: number;<br/>  <span class="text-purple-400">velocity</span>: number;<br/>  burnout: boolean;<br/>}`}
            />
            <CodeSnippetCard
                x="80%"
                y="15%"
                rotate={6}
                delay={0.7}
                language="ai-insight.tsx"
                code={`<span class="text-blue-400">const</span> insight = <br/>  await <span class="text-yellow-400">ai</span>.analyze({<br/>    pattern: 'burnout'<br/>  });`}
            />

            {/* 3. MAIN CONTENT */}
            <div className="container relative z-10 px-4 flex flex-col items-center text-center">

                {/* Announcement Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    onClick={() => router.push('/release-notes')}
                    className="cursor-pointer group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 mb-8 backdrop-blur-md"
                >
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500 text-white shadow-lg shadow-purple-500/20">NEW</span>
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">DevFlow 2.0 is live</span>
                    <ChevronRight size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                </motion.div>

                {/* Hero Typography */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-5xl mx-auto text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[0.9]"
                >
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 pb-2">
                        Code at the
                    </span>
                    <span className="relative inline-block">
                        <span className="absolute -inset-2 bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-purple-500/40 blur-2xl opacity-50" />
                        <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x">
                            Speed of Thought
                        </span>
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed"
                >
                    The developer analytics platform that understands your flow.
                    Visualize your velocity, prevent burnout, and unlock achievements
                    without leaving your CLI.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4"
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

            {/* 4. HERO VISUAL (3D Dashboard) */}
            <motion.div
                style={{ opacity, y: y1, scale, rotateX: useTransform(scrollY, [0, 400], [15, 25]) }}
                className="relative w-full max-w-[1400px] px-4 -mt-12 perspective-2000"
            >
                {/* Glow behind dashboard */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] bg-purple-500/15 blur-[100px] rounded-full z-0" />

                <div className="relative z-10 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
                    {/* Fake Browser Toolbar */}
                    <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/5">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 text-[11px] font-mono text-zinc-500">
                            <Command size={10} />
                            devflow.app/dashboard
                        </div>
                        <div className="w-10" />
                    </div>

                    {/* Screenshot Container */}
                    <div className="relative aspect-[16/9] bg-zinc-900 group cursor-default">
                        <Image
                            src="/dashboard-preview.png"
                            alt="DevFlow Dashboard"
                            fill
                            className="object-cover object-top"
                            priority
                            sizes="100vw"
                        />

                        {/* Interactive Overlay Points (Fake UI interaction) */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1, type: 'spring' }}
                            className="absolute top-[20%] left-[15%] w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center animate-pulse"
                        >
                            <div className="w-3 h-3 bg-purple-400 rounded-full" />
                        </motion.div>
                    </div>
                </div>

                {/* Reflection/Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none rounded-xl z-20" />
            </motion.div>

            {/* Scroll Indicator */}
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
