'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Play, ArrowRight, Sparkles } from 'lucide-react'
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

    // Smooth spring physics for parallax
    const smoothY = useSpring(useTransform(scrollY, [0, 800], [0, 180]), { stiffness: 50, damping: 18 })
    const smoothRotateX = useSpring(useTransform(scrollY, [0, 600], [14, 0]), { stiffness: 45, damping: 18 })
    const smoothScale = useSpring(useTransform(scrollY, [0, 600], [0.92, 1.01]), { stiffness: 45, damping: 18 })
    const bgY = useSpring(useTransform(scrollY, [0, 800], [0, 100]), { stiffness: 35, damping: 18 })
    const contentOpacity = useTransform(scrollY, [0, 400], [1, 0.3])

    // Generate static lines
    const lines = Array.from({ length: 56 }).map((_, i) => ({
        angle: (i * 360) / 56,
    }))

    // Generate particles
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        delay: i * 0.3,
        size: 2 + (i % 3),
        left: `${(i * 5.1) % 100}%`,
        top: `${(i * 4.7) % 100}%`,
    }))

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex flex-col items-center pt-28 md:pt-36 lg:pt-40 overflow-hidden bg-[#08061A]"
        >
            {/* Background Layers */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Primary Glow */}
                <motion.div
                    style={{ y: bgY }}
                    className="absolute top-[-25%] left-[5%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-white/5 blur-[180px] rounded-full"
                />
                {/* Secondary Glow */}
                <motion.div
                    style={{ y: bgY }}
                    className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-fuchsia-500/15 blur-[150px] rounded-full"
                />
                {/* Accent Glow */}
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full" />

                {/* Radiating Lines */}
                <div className="absolute inset-0 opacity-15 md:opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                        <defs>
                            <radialGradient id="linesFade" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="35%" stopColor="transparent" />
                                <stop offset="100%" stopColor="white" />
                            </radialGradient>
                        </defs>
                        {lines.map((line, i) => (
                            <line
                                key={i}
                                x1="50"
                                y1="50"
                                x2={50 + 85 * Math.cos((line.angle * Math.PI) / 180)}
                                y2={50 + 85 * Math.sin((line.angle * Math.PI) / 180)}
                                stroke="rgba(168, 85, 247, 0.35)"
                                strokeWidth="0.025"
                            />
                        ))}
                    </svg>
                </div>

                {/* Floating Particles */}
                {particles.map((p, i) => (
                    <FloatingParticle key={i} {...p} />
                ))}

                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
            </div>

            {/* Content */}
            <motion.div
                style={{ opacity: contentOpacity }}
                className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="mb-6 md:mb-8"
                >
                    <span className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-[11px] md:text-xs font-semibold tracking-widest text-zinc-300 uppercase backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:border-white/30 transition-all duration-300 cursor-default">
                        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                        Developer Analytics Platform
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-display font-bold tracking-[-0.02em] text-white leading-[1.08] mb-5 md:mb-7"
                >
                    Build Faster With
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-white bg-[length:200%_auto] animate-text-shimmer">
                        DevFlow Insights
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
                    className="text-[15px] sm:text-lg md:text-xl text-zinc-400 max-w-lg md:max-w-2xl mx-auto mb-9 md:mb-12 leading-relaxed tracking-[-0.01em]"
                >
                    Transform your GitHub activity into actionable insights. Track velocity, prevent burnout, and celebrate achievements — making every commit count.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16 md:mb-24 w-full sm:w-auto"
                >
                    <button
                        onClick={() => router.push('/login')}
                        className="group w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-white text-[#08061A] font-semibold text-sm sm:text-[15px] hover:bg-zinc-50 active:scale-[0.97] transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.2),0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2.5"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <button
                        onClick={() => router.push('/#demo')}
                        className="group w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-white/[0.03] text-white font-medium text-sm sm:text-[15px] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2.5 backdrop-blur-sm"
                    >
                        <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                        Watch Demo
                    </button>
                </motion.div>

                {/* 3D Dashboard Preview */}
                <motion.div
                    style={{
                        y: smoothY,
                        rotateX: smoothRotateX,
                        scale: smoothScale,
                        transformPerspective: 1400,
                    }}
                    className="w-full relative z-20 max-w-5xl xl:max-w-6xl origin-top"
                >
                    {/* Multi-layer glow */}
                    <div className="absolute -inset-10 md:-inset-16 bg-gradient-to-t from-zinc-900/50 via-zinc-800/10 to-transparent blur-[60px] -z-10 rounded-[3rem] opacity-80" />
                    <div className="absolute -inset-6 md:-inset-10 bg-gradient-to-b from-cyan-500/10 to-transparent blur-[40px] -z-10 rounded-[2rem] opacity-50" />

                    {/* Dashboard Container */}
                    <div className="relative rounded-2xl md:rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0D0A1C]/95 to-[#0A0818]/95 backdrop-blur-2xl shadow-[0_8px_60px_-15px_rgba(168,85,247,0.3),0_0_0_1px_rgba(255,255,255,0.05)] p-1.5 sm:p-2 md:p-3 transform-gpu overflow-hidden">
                        {/* Shimmer border effect */}
                        <div className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                        </div>

                        {/* Browser Header */}
                        <div className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3.5 border-b border-white/[0.04]">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/40 shadow-[0_0_6px_rgba(239,68,68,0.3)]" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/40 shadow-[0_0_6px_rgba(234,179,8,0.3)]" />
                                <div className="w-3 h-3 rounded-full bg-green-500/40 shadow-[0_0_6px_rgba(34,197,94,0.3)]" />
                            </div>
                            <div className="ml-4 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[10px] md:text-[11px] text-zinc-500 font-mono tracking-wide">
                                devflow.app
                            </div>
                        </div>

                        <DashboardPreview />

                        {/* Bottom Fade */}
                        <div className="absolute bottom-0 inset-x-0 h-24 md:h-40 bg-gradient-to-t from-[#08061A] via-[#08061A]/80 to-transparent pointer-events-none rounded-b-2xl md:rounded-b-3xl" />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}


