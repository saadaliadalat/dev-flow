'use client'

import { motion, useScroll, useTransform, useSpring, useVelocity } from 'framer-motion'
import { Play, ArrowRight, Sparkles } from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'
import { useRouter } from 'next/navigation'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { useRef } from 'react'

// Floating particle component
const FloatingParticle = ({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) => (
    <motion.div
        className="absolute rounded-full bg-white/20"
        style={{ width: size, height: size, left, top }}
        animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
        }}
        transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay,
            ease: 'easeInOut',
        }}
    />
)

export function Hero() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()

    // Smooth spring physics for enhanced parallax
    const smoothY = useSpring(useTransform(scrollY, [0, 800], [0, 250]), { stiffness: 40, damping: 20 })
    const smoothRotateX = useSpring(useTransform(scrollY, [0, 800], [15, 40]), { stiffness: 40, damping: 20 })
    const smoothScale = useSpring(useTransform(scrollY, [0, 800], [0.95, 0.85]), { stiffness: 40, damping: 20 })
    const smoothOpacity = useSpring(useTransform(scrollY, [0, 400], [1, 0.5]), { stiffness: 40, damping: 20 })

    // Background parallax
    const bgY = useSpring(useTransform(scrollY, [0, 800], [0, 150]), { stiffness: 30, damping: 30 })

    // Generate static lines (Refined for "Event Horizon")
    const lines = Array.from({ length: 64 }).map((_, i) => ({
        angle: (i * 360) / 64,
    }))

    // Generate "Ash" particles
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        delay: i * 0.2,
        size: 1 + Math.random() * 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 5 + Math.random() * 5
    }))

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex flex-col items-center pt-32 md:pt-40 lg:pt-48 overflow-hidden bg-black perspective-[2000px]"
        >
            {/* --- BACKGROUND LAYERS --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* 1. The Event Horizon (Spotlight) */}
                <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] blur-[80px]" />

                {/* 2. Secondary Ambient Glow */}
                <motion.div
                    style={{ y: bgY }}
                    className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.02] blur-[120px] rounded-full"
                />

                {/* 3. Radiating Lines (The Grid) */}
                <div className="absolute inset-0 opacity-[0.15]">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                        <defs>
                            <radialGradient id="linesFade" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="white" stopOpacity="1" />
                                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                            </radialGradient>
                            <mask id="fadeMask">
                                <circle cx="50" cy="50" r="50" fill="url(#linesFade)" />
                            </mask>
                        </defs>
                        <g mask="url(#fadeMask)">
                            {lines.map((line, i) => (
                                <line
                                    key={i}
                                    x1="50"
                                    y1="50"
                                    x2={50 + 100 * Math.cos((line.angle * Math.PI) / 180)}
                                    y2={50 + 100 * Math.sin((line.angle * Math.PI) / 180)}
                                    stroke="white"
                                    strokeWidth="0.02" // Ultra thin
                                />
                            ))}
                        </g>
                    </svg>
                </div>

                {/* 4. Ash Particles */}
                {particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white/30"
                        style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                            ease: "easeInOut"
                        }}
                    />
                ))}

                {/* 5. Noise Overlay (Grain) */}
                <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* --- CONTENT --- */}
            <motion.div
                style={{ opacity: smoothOpacity }}
                className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono tracking-widest text-zinc-400 uppercase backdrop-blur-md shadow-2xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        v2.0 Obsidian
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tight text-white leading-[1.05] mb-6 drop-shadow-2xl"
                >
                    Build Faster With
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500">
                        DevFlow Insights.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Transform your GitHub activity into actionable insights. Track velocity, prevent burnout, and celebrate achievements in style.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full sm:w-auto"
                >
                    <button
                        onClick={() => router.push('/login')}
                        className="group w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => router.push('/#demo')}
                        className="group w-full sm:w-auto px-8 py-4 rounded-full bg-transparent text-white font-medium text-sm border border-white/10 hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4 group-hover:scale-110 transition-transform fill-white" />
                        Watch Demo
                    </button>
                </motion.div>

                {/* --- 3D BOARD --- */}
                <motion.div
                    style={{
                        y: smoothY,
                        rotateX: smoothRotateX,
                        scale: smoothScale,
                        rotateY: 0,
                        transformPerspective: 1200, // Deeper perspective
                    }}
                    className="w-full relative z-20 max-w-6xl"
                >
                    {/* Glow Underneath */}
                    <div className="absolute -inset-4 bg-white/20 blur-[60px] opacity-20 rounded-[50px] -z-10" />

                    {/* Window Frame */}
                    <div className="relative rounded-3xl border border-white/[0.1] bg-[#09090b] shadow-2xl overflow-hidden">

                        {/* Glass Reflection Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-transparent to-transparent pointer-events-none z-50" />

                        {/* Browser Header (Stealth Mode) */}
                        <div className="h-10 bg-black/50 border-b border-white/[0.05] flex items-center justify-between px-4">
                            {/* Stealth Traffic Lights */}
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
                            </div>
                            {/* URL Bar */}
                            <div className="px-3 py-1 rounded-md bg-white/[0.02] border border-white/[0.04] text-[10px] text-zinc-600 font-mono">
                                devflow.app/dashboard
                            </div>
                            <div className="w-10" /> {/* Spacer */}
                        </div>

                        {/* Content Area */}
                        <div className="relative bg-[#000000]">
                            <DashboardPreview />
                            {/* Bottom Fade for Scroll Illusion */}
                            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20" />
                        </div>
                    </div>
                </motion.div>

            </motion.div>
        </section>
    )
}


