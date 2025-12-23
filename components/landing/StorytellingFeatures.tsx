'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Brain, Flame, Trophy, Activity, Layers, Globe, Zap, BarChart2, GitCommit, Network, Clock, Cpu, Signal, Lock } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ScrollTiltWrapper } from '../visuals/ScrollTilt'
import { TiltCard } from '../motion/TiltCard'

// --- Physics Config ---
const SPRING_SOFT = { type: "spring", stiffness: 100, damping: 20, mass: 1 }
const SPRING_ELASTIC = { type: "spring", stiffness: 300, damping: 20, mass: 1 }

// --- Stagger Config ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const bentoVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 150, damping: 25 }
    }
}

// --- 1. LIVE ANALYTICS (Sine Wave + Scanner) ---
const AnalyticsStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Scanned Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee10_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee10_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34, 211, 238, 0.2)" />
                        <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                    </linearGradient>
                </defs>
                {/* Wave Path */}
                <motion.path
                    fill="url(#waveGradient)"
                    stroke="rgba(34, 211, 238, 1)"
                    strokeWidth="2"
                    initial={{ d: "M0,100 C100,100 200,100 400,100 L400,200 L0,200 Z" }}
                    animate={{
                        d: [
                            "M0,80 C100,60 200,120 400,80 L400,200 L0,200 Z",
                            "M0,100 C150,140 250,50 400,100 L400,200 L0,200 Z",
                            "M0,80 C100,60 200,120 400,80 L400,200 L0,200 Z"
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* Scanning Laser */}
            <motion.div
                className="absolute top-0 bottom-0 w-[1px] bg-cyan-400 z-10"
                style={{ boxShadow: '0 0 10px 1px rgba(34, 211, 238, 0.8)' }}
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
        </div>
    )
}

// --- 2. NEURAL ENGINE (Synaptic Core) ---
const NeuralStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Orbital Rings - Thinner & More Precise */}
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-purple-500/20"
                    style={{ width: `${i * 30 + 40}%`, height: `${i * 30 + 40}%` }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 25 + i * 5, repeat: Infinity, ease: "linear" }}
                />
            ))}

            {/* Central Core */}
            <div className="relative z-10">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-full bg-purple-500/30 blur-[30px] absolute inset-0 -translate-x-2 -translate-y-2"
                />
                <Brain className="w-16 h-16 text-purple-200 stroke-1 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            </div>

            {/* Particle Dust */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400 rounded-full"
                    animate={{
                        x: [0, Math.random() * 100 - 50],
                        y: [0, Math.random() * 100 - 50],
                        opacity: [1, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
            ))}
        </div>
    )
}

// --- 3. VITALITY (Cyber HUD) ---
const VitalityStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-32 h-32">
            {/* Outer Static Ring */}
            <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                <circle cx="64" cy="64" r="58" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" strokeDasharray="2 4" />
            </svg>

            {/* Inner Progress */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 scale-90">
                <motion.circle
                    cx="64" cy="64" r="58"
                    stroke="#f97316" strokeWidth="2" fill="none"
                    strokeDasharray="364"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 364 }}
                    whileInView={{ strokeDashoffset: 36 }} // 90%
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white tracking-tighter font-mono">98</span>
                <span className="text-[10px] text-orange-400 font-mono tracking-widest uppercase mt-1">Vitality</span>
            </div>
        </div>
    </div>
)

// --- 4. GLOBAL NETWORK (Constellation Canvas) ---
const ConstellationStory = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        const particles: { x: number; y: number; dx: number; dy: number; size: number }[] = []
        const PARTICLE_COUNT = 55
        const CONNECTION_DISTANCE = 80

        const resize = () => {
            canvas.width = canvas.parentElement?.clientWidth || 300
            canvas.height = canvas.parentElement?.clientHeight || 200
        }
        resize()
        window.addEventListener('resize', resize)

        // Init Particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
                size: Math.random() < 0.2 ? 2 : 1 // Some larger nodes
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update & Draw Particles
            particles.forEach(p => {
                p.x += p.dx
                p.y += p.dy

                if (p.x < 0 || p.x > canvas.width) p.dx *= -1
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1

                ctx.fillStyle = p.size > 1.5 ? '#6366f1' : 'rgba(99, 102, 241, 0.5)'
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()
            })

            // Draw Connections
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)'
            ctx.lineWidth = 1

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < CONNECTION_DISTANCE) {
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate)
        }
        animate()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <div className="absolute inset-0 bg-[#0c0c16]"> {/* Darker bg for contrast */}
            <canvas ref={canvasRef} className="block w-full h-full" />

            {/* World Map Overlay Hint */}
            <div className="absolute inset-0 bg-[url('/world-map-dots.svg')] bg-center bg-no-repeat bg-contain opacity-[0.05] pointer-events-none" />
        </div>
    )
}

// --- 5. MASTERY (Floating Trophy) ---
const MasteryStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
            <motion.div
                className="absolute inset-0 bg-yellow-400/10 blur-[40px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            <motion.div
                whileHover={{ rotateZ: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative z-10"
            >
                <Trophy className="w-20 h-20 text-yellow-300 stroke-[1.5px] drop-shadow-[0_0_20px_rgba(253,224,71,0.3)]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
            </motion.div>
        </div>
    </div>
)

// --- 6. TIME TRAVEL (Commit History) ---
const CommitHistoryStory = () => {
    return (
        <div className="absolute inset-0 p-6 flex flex-col justify-center space-y-3 opacity-80 mask-image-linear-to-b">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1 - i * 0.15, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <div className="h-2 rounded-full bg-emerald-500/20" style={{ width: `${Math.random() * 40 + 40}%` }} />
                    <div className="ml-auto text-[10px] font-mono text-emerald-500/50">{Math.floor(Math.random() * 10)}m ago</div>
                </motion.div>
            ))}

            {/* Abstract Connection Line */}
            <div className="absolute left-[31px] top-6 bottom-6 w-[1px] bg-gradient-to-b from-emerald-500/50 to-transparent -z-10" />
        </div>
    )
}


// --- HELPER: Icon Container ---
const IconContainer = ({ color, children }: { color: string, children: React.ReactNode }) => (
    <div
        className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 relative overflow-hidden group-hover:scale-105"
        style={{
            backgroundColor: `${color}08`,
            borderColor: `${color}15`,
            boxShadow: `0 0 20px -5px ${color}20` // Subtle colored shadow
        }}
    >
        <div className="relative z-10 text-white drop-shadow-md">
            {children}
        </div>
    </div>
)

// --- MAIN GRID ITEM ---
interface BentoCardProps {
    title: string
    description: string
    icon: React.ReactNode
    children: React.ReactNode
    className?: string
    accentColor?: string
    colSpan?: string
}

const PremiumBentoCard = ({ title, description, icon, children, className = '', accentColor = '#a855f7', colSpan = '' }: BentoCardProps) => {
    return (
        <TiltCard
            variants={bentoVariants}
            className={cn(`rounded-3xl bg-white/[0.02] backdrop-blur-md border border-white/[0.05] group ${colSpan} ${className}`)}
            glareColor={accentColor}
            style={{
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px -20px rgba(0,0,0,0.5)' // Physical "Cut Glass" look
            }}
        >
            {/* Inner Darkening for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />

            <div className="relative h-full flex flex-col p-6 z-10">
                {/* Header */}
                <div className="flex flex-col items-start gap-4 mb-4">
                    <IconContainer color={accentColor!}>
                        {icon}
                    </IconContainer>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-1 tracking-tight">{title}</h3>
                        <p className="text-sm text-zinc-400 font-light leading-relaxed">{description}</p>
                    </div>
                </div>

                {/* Visual */}
                <div className="relative mt-auto flex-1 h-[180px] w-full rounded-xl border border-white/[0.05] overflow-hidden bg-black/20 group-hover:border-white/10 transition-colors">
                    {children}
                </div>
            </div>
        </TiltCard>
    )
}


// --- EXPORT ---
export function StorytellingFeatures() {
    return (
        <section id="features" className="py-32 relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-20 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="h-px w-8 bg-indigo-500/50" />
                        <span className="text-indigo-400 text-xs font-mono tracking-[0.2em] uppercase">
                            System Capabilities
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-bold text-white mb-6 font-display leading-[1.1] tracking-tight"
                    >
                        Engineering Intelligence <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Reimagined.</span>
                    </motion.h2>
                </div>

                <ScrollTiltWrapper>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[400px]" // Reduced gap & height adjustment
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {/* LIVE ANALYTICS - Double Width */}
                        <PremiumBentoCard
                            title="Live Analytics"
                            description="Real-time velocity tracking."
                            icon={<BarChart2 size={20} strokeWidth={1.5} />}
                            accentColor="#22d3ee" // Cyan
                            colSpan="md:col-span-2"
                        >
                            <AnalyticsStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Neural Engine"
                            description="Pattern recognition AI."
                            icon={<Brain size={20} strokeWidth={1.5} />}
                            accentColor="#a855f7" // Purple
                        >
                            <NeuralStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Vitality Score"
                            description="Burnout prevention."
                            icon={<Activity size={20} strokeWidth={1.5} />}
                            accentColor="#f97316" // Orange
                        >
                            <VitalityStory />
                        </PremiumBentoCard>

                        {/* GLOBAL MESH - Double Width */}
                        <PremiumBentoCard
                            title="Global Mesh"
                            description="Elite network connectivity."
                            icon={<Network size={20} strokeWidth={1.5} />}
                            accentColor="#6366f1" // Indigo
                            colSpan="md:col-span-2"
                        >
                            <ConstellationStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Mastery"
                            description="Gamified progression."
                            icon={<Trophy size={20} strokeWidth={1.5} />}
                            accentColor="#eab308" // Yellow
                        >
                            <MasteryStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Time Travel"
                            description="Evolution history."
                            icon={<Clock size={20} strokeWidth={1.5} />}
                            accentColor="#10b981" // Emerald
                        >
                            <CommitHistoryStory />
                        </PremiumBentoCard>
                    </motion.div>
                </ScrollTiltWrapper>
            </div>
        </section>
    )
}
