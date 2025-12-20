'use client'

import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Play, ArrowRight, Sparkles, Zap, GitCommit, Flame, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

// Floating orb component with mouse tracking
const FloatingOrb = ({
    size,
    color,
    initialX,
    initialY,
    delay,
    mouseX,
    mouseY
}: {
    size: number
    color: string
    initialX: string
    initialY: string
    delay: number
    mouseX: any
    mouseY: any
}) => {
    const orbX = useTransform(mouseX, [0, 1], [-20, 20])
    const orbY = useTransform(mouseY, [0, 1], [-20, 20])

    return (
        <motion.div
            className="absolute rounded-full blur-3xl pointer-events-none"
            style={{
                width: size,
                height: size,
                left: initialX,
                top: initialY,
                background: color,
                x: orbX,
                y: orbY
            }}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                delay,
                ease: 'easeInOut',
            }}
        />
    )
}

// Floating stat card for parallax effect
const FloatingStatCard = ({
    icon: Icon,
    label,
    value,
    color,
    delay,
    scrollProgress,
    direction
}: {
    icon: any
    label: string
    value: string
    color: string
    delay: number
    scrollProgress: any
    direction: 'left' | 'right'
}) => {
    const x = useTransform(
        scrollProgress,
        [0, 1],
        direction === 'left' ? [0, -100] : [0, 100]
    )
    const y = useTransform(scrollProgress, [0, 1], [0, 150])
    const opacity = useTransform(scrollProgress, [0, 0.5], [1, 0])
    const rotate = useTransform(
        scrollProgress,
        [0, 1],
        direction === 'left' ? [0, -15] : [0, 15]
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ x, y, opacity, rotate }}
            className="absolute hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-2xl"
        >
            <div className={`p-2 rounded-xl ${color}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-zinc-400">{label}</p>
            </div>
        </motion.div>
    )
}

export function Hero() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    })

    // Mouse tracking for orb movement
    const mouseX = useMotionValue(0.5)
    const mouseY = useMotionValue(0.5)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX / window.innerWidth)
            mouseY.set(e.clientY / window.innerHeight)
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    // Smooth spring animations for parallax
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 30 })

    // Dashboard image transforms
    const dashboardY = useTransform(smoothProgress, [0, 1], [0, 200])
    const dashboardScale = useTransform(smoothProgress, [0, 0.5], [1, 0.9])
    const dashboardRotateX = useTransform(smoothProgress, [0, 1], [8, 25])
    const dashboardOpacity = useTransform(smoothProgress, [0, 0.8], [1, 0.3])

    // Text parallax - moves slower than scroll
    const headlineY = useTransform(smoothProgress, [0, 1], [0, 100])
    const headlineOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0])

    // Badge counter animation
    const badgeScale = useTransform(smoothProgress, [0, 0.3], [1, 0.8])

    return (
        <section
            ref={containerRef}
            className="relative min-h-[130vh] flex flex-col items-center pt-32 md:pt-40 overflow-hidden bg-black"
        >
            {/* === AMBIENT BACKGROUND === */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Gradient mesh background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1)_0%,transparent_50%)]" />

                {/* Floating orbs that follow mouse */}
                <FloatingOrb size={600} color="rgba(124,58,237,0.15)" initialX="10%" initialY="20%" delay={0} mouseX={mouseX} mouseY={mouseY} />
                <FloatingOrb size={400} color="rgba(6,182,212,0.1)" initialX="70%" initialY="60%" delay={2} mouseX={mouseX} mouseY={mouseY} />
                <FloatingOrb size={300} color="rgba(168,85,247,0.1)" initialX="50%" initialY="10%" delay={4} mouseX={mouseX} mouseY={mouseY} />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Noise texture */}
                <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
            </div>

            {/* === FLOATING STAT CARDS (Parallax) === */}
            <FloatingStatCard
                icon={GitCommit}
                label="Commits Today"
                value="24"
                color="bg-purple-500/20 text-purple-400"
                delay={0.8}
                scrollProgress={smoothProgress}
                direction="left"
            />
            <div className="absolute left-[8%] top-[35%]">
                <FloatingStatCard
                    icon={GitCommit}
                    label="Commits Today"
                    value="24"
                    color="bg-purple-500/20 text-purple-400"
                    delay={0.8}
                    scrollProgress={smoothProgress}
                    direction="left"
                />
            </div>
            <div className="absolute right-[8%] top-[40%]">
                <FloatingStatCard
                    icon={Flame}
                    label="Day Streak"
                    value="15🔥"
                    color="bg-orange-500/20 text-orange-400"
                    delay={1}
                    scrollProgress={smoothProgress}
                    direction="right"
                />
            </div>
            <div className="absolute left-[12%] top-[55%]">
                <FloatingStatCard
                    icon={Trophy}
                    label="Achievements"
                    value="12"
                    color="bg-yellow-500/20 text-yellow-400"
                    delay={1.2}
                    scrollProgress={smoothProgress}
                    direction="left"
                />
            </div>
            <div className="absolute right-[10%] top-[60%]">
                <FloatingStatCard
                    icon={Zap}
                    label="Productivity"
                    value="92"
                    color="bg-cyan-500/20 text-cyan-400"
                    delay={1.4}
                    scrollProgress={smoothProgress}
                    direction="right"
                />
            </div>

            {/* === MAIN CONTENT === */}
            <motion.div
                style={{ y: headlineY, opacity: headlineOpacity }}
                className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ scale: badgeScale }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 text-[11px] font-mono tracking-widest text-zinc-300 uppercase backdrop-blur-md shadow-2xl hover:border-white/20 transition-colors cursor-default">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Developer Analytics Platform
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-white leading-[1.05] mb-6"
                >
                    Your GitHub,
                    <br />
                    <span className="relative">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                            Visualized.
                        </span>
                        {/* Animated underline */}
                        <motion.span
                            className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
                        />
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Track your coding velocity, prevent burnout with AI insights, and celebrate
                    your achievements. The ultimate analytics platform for developers.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <motion.button
                        onClick={() => router.push('/login')}
                        whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        className="group w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 transition-all duration-300"
                    >
                        Get Started Free
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <motion.button
                        onClick={() => router.push('/#demo')}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        className="group w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-white font-medium text-sm border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                        <Play className="w-4 h-4 group-hover:scale-110 transition-transform fill-white" />
                        Watch Demo
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* === DASHBOARD IMAGE (3D Parallax) === */}
            <motion.div
                style={{
                    y: dashboardY,
                    scale: dashboardScale,
                    rotateX: dashboardRotateX,
                    opacity: dashboardOpacity,
                    transformPerspective: 1200,
                }}
                className="relative z-20 w-full max-w-6xl mx-auto px-4"
            >
                {/* Multiple glow layers */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-transparent to-cyan-500/20 blur-[80px] opacity-60 rounded-[50px] -z-10" />
                <div className="absolute -inset-8 bg-purple-500/10 blur-[120px] opacity-40 rounded-full -z-20" />

                {/* Browser frame */}
                <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 shadow-[0_0_100px_-20px_rgba(124,58,237,0.3)] overflow-hidden backdrop-blur-xl">

                    {/* Reflection overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.02] pointer-events-none z-50" />

                    {/* Browser header */}
                    <div className="h-12 bg-zinc-900/90 border-b border-white/5 flex items-center justify-between px-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60 hover:bg-yellow-500 transition-colors" />
                            <div className="w-3 h-3 rounded-full bg-green-500/60 hover:bg-green-500 transition-colors" />
                        </div>
                        <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-zinc-500 font-mono">
                            devflow.app/dashboard
                        </div>
                        <div className="w-16" />
                    </div>

                    {/* Dashboard image */}
                    <div className="relative aspect-[16/9] bg-black">
                        <Image
                            src="/dashboard-preview.png"
                            alt="DevFlow Dashboard Preview"
                            fill
                            className="object-cover object-top"
                            priority
                            quality={95}
                        />
                        {/* Bottom fade */}
                        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                    </div>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
                >
                    <motion.div
                        className="w-1 h-2 bg-white/60 rounded-full"
                        animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </motion.div>
            </motion.div>
        </section>
    )
}
