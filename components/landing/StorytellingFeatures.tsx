'use client'

import { motion, useMotionValue, useTransform, useSpring, useAnimationFrame } from 'framer-motion'
import { Brain, Flame, Trophy, Activity, Layers, Globe, Zap, BarChart2, GitCommit, Network, Clock, Cpu, Signal, Lock } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ScrollTiltWrapper } from '../visuals/ScrollTilt'
import { TiltCard } from '../motion/TiltCard'

// --- Physics Config ---
const SPRING_SMOOTH = { type: "spring", stiffness: 120, damping: 20, mass: 0.8 }
const SPRING_BOUNCY = { type: "spring", stiffness: 400, damping: 25, mass: 0.5 }

// --- Stagger Config ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
}

const bentoVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 100, damping: 20, mass: 1 }
    }
}

// --- 1. LIVE ANALYTICS (Premium Sine Wave + Scanner) ---
const AnalyticsStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Scanned Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee08_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee08_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]" />

            {/* Floating Data Points */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
                    style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + Math.sin(i) * 20}%`,
                        boxShadow: '0 0 8px 2px rgba(34, 211, 238, 0.6)'
                    }}
                    animate={{
                        y: [0, -10, 0],
                        opacity: [0.5, 1, 0.5],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
            ))}

            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34, 211, 238, 0.25)" />
                        <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Wave Path */}
                <motion.path
                    fill="url(#waveGradient)"
                    stroke="rgba(34, 211, 238, 0.9)"
                    strokeWidth="2"
                    filter="url(#glow)"
                    initial={{ d: "M0,100 C100,100 200,100 400,100 L400,200 L0,200 Z" }}
                    animate={{
                        d: [
                            "M0,85 C80,55 160,115 240,75 C320,35 400,95 400,85 L400,200 L0,200 Z",
                            "M0,95 C80,125 160,55 240,95 C320,135 400,65 400,95 L400,200 L0,200 Z",
                            "M0,85 C80,55 160,115 240,75 C320,35 400,95 400,85 L400,200 L0,200 Z"
                        ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* Scanning Laser */}
            <motion.div
                className="absolute top-0 bottom-0 w-[2px] z-10"
                style={{
                    background: 'linear-gradient(to bottom, transparent, rgba(34, 211, 238, 1), transparent)',
                    boxShadow: '0 0 20px 4px rgba(34, 211, 238, 0.6)'
                }}
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
        </div>
    )
}

// --- 2. NEURAL ENGINE (Premium Synaptic Core) ---
const NeuralStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Orbital Rings with Glowing Nodes */}
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-purple-500/30"
                    style={{ width: `${i * 28 + 35}%`, height: `${i * 28 + 35}%` }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 20 + i * 8, repeat: Infinity, ease: "linear" }}
                >
                    {/* Orbiting Node */}
                    <motion.div
                        className="absolute w-2 h-2 bg-purple-400 rounded-full"
                        style={{
                            top: '50%',
                            left: 0,
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 0 12px 3px rgba(168, 85, 247, 0.8)'
                        }}
                    />
                </motion.div>
            ))}

            {/* Central Core with Dramatic Pulse */}
            <div className="relative z-10">
                <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-full bg-purple-500/40 blur-[40px] absolute -inset-4"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Brain className="w-14 h-14 text-purple-200 stroke-[1.2] relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
                </motion.div>
            </div>

            {/* Synapse Particles with Trails */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400 rounded-full"
                    style={{ boxShadow: '0 0 6px 2px rgba(168, 85, 247, 0.6)' }}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{
                        x: [0, (Math.random() - 0.5) * 150],
                        y: [0, (Math.random() - 0.5) * 150],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
                />
            ))}
        </div>
    )
}

// --- 3. VITALITY (Animated HUD) ---
const VitalityStory = () => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (count < 98) setCount(prev => Math.min(prev + 2, 98))
        }, 30)
        return () => clearTimeout(timer)
    }, [count])

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-28 h-28">
                {/* Outer Static Ring with Ticks */}
                <svg className="w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="52" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                    {[...Array(36)].map((_, i) => (
                        <line
                            key={i}
                            x1="56"
                            y1="6"
                            x2="56"
                            y2={i % 3 === 0 ? 10 : 8}
                            stroke={i < 32 ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.1)"}
                            strokeWidth="1"
                            transform={`rotate(${i * 10} 56 56)`}
                        />
                    ))}
                </svg>

                {/* Inner Progress Arc */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <defs>
                        <linearGradient id="vitalityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#fb923c" />
                        </linearGradient>
                    </defs>
                    <motion.circle
                        cx="56" cy="56" r="44"
                        stroke="url(#vitalityGrad)" strokeWidth="3" fill="none"
                        strokeDasharray="276"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 276 }}
                        whileInView={{ strokeDashoffset: 28 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                        style={{ filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.5))' }}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white tracking-tighter font-mono tabular-nums">{count}</span>
                    <span className="text-[9px] text-orange-400/80 font-mono tracking-[0.15em] uppercase mt-0.5">Vitality</span>
                </div>
            </div>
        </div>
    )
}

// --- 4. GLOBAL NETWORK (Interactive Constellation) ---
const ConstellationStory = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        const particles: { x: number; y: number; dx: number; dy: number; size: number; isHot?: boolean }[] = []
        const PARTICLE_COUNT = 60
        const CONNECTION_DISTANCE = 70

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
                dx: (Math.random() - 0.5) * 0.4,
                dy: (Math.random() - 0.5) * 0.4,
                size: Math.random() < 0.15 ? 2.5 : 1,
                isHot: Math.random() < 0.1
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update & Draw Particles
            particles.forEach(p => {
                // Mouse attraction
                const mdx = mouseRef.current.x - p.x
                const mdy = mouseRef.current.y - p.y
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
                if (mDist < 100 && mDist > 0) {
                    p.dx += (mdx / mDist) * 0.02
                    p.dy += (mdy / mDist) * 0.02
                }

                p.x += p.dx
                p.y += p.dy

                // Damping
                p.dx *= 0.99
                p.dy *= 0.99

                if (p.x < 0 || p.x > canvas.width) p.dx *= -1
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1

                // Draw glow for hot nodes
                if (p.isHot) {
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8)
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)')
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')
                    ctx.fillStyle = gradient
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
                    ctx.fill()
                }

                ctx.fillStyle = p.isHot ? '#818cf8' : 'rgba(99, 102, 241, 0.6)'
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()
            })

            // Draw Connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = 1 - (dist / CONNECTION_DISTANCE)
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.2})`
                        ctx.lineWidth = 1
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

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            mouseRef.current.x = e.clientX - rect.left
            mouseRef.current.y = e.clientY - rect.top
        }
        canvas.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('resize', resize)
            canvas.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <div className="absolute inset-0 bg-[#080812]">
            <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />
            {/* World Map Overlay Hint */}
            <div className="absolute inset-0 bg-[url('/world-map-dots.svg')] bg-center bg-no-repeat bg-contain opacity-[0.03] pointer-events-none" />
        </div>
    )
}

// --- 5. MASTERY (Floating Trophy with Particles) ---
const MasteryStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
            {/* Glow */}
            <motion.div
                className="absolute -inset-6 bg-yellow-400/15 blur-[50px] rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Achievement Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    style={{
                        left: '50%',
                        top: '50%',
                        boxShadow: '0 0 4px 1px rgba(253, 224, 71, 0.6)'
                    }}
                    animate={{
                        x: [0, Math.cos(i * 60 * Math.PI / 180) * 50],
                        y: [0, Math.sin(i * 60 * Math.PI / 180) * 50],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
                />
            ))}

            <motion.div
                animate={{ y: [-3, 3, -3], rotateZ: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.1, rotateZ: 5 }}
                className="relative z-10 cursor-pointer"
            >
                <Trophy className="w-16 h-16 text-yellow-300 stroke-[1.2] drop-shadow-[0_0_25px_rgba(253,224,71,0.5)]" />
                <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)' }}
                />
            </motion.div>
        </div>
    </div>
)

// --- 6. TIME TRAVEL (Premium Commit History) ---
const CommitHistoryStory = () => {
    const commits = [
        { message: 'feat: add dark mode support', time: '2m' },
        { message: 'fix: resolve auth timeout', time: '5m' },
        { message: 'refactor: optimize queries', time: '12m' },
        { message: 'docs: update README', time: '1h' },
        { message: 'style: improve spacing', time: '3h' },
    ]

    return (
        <div className="absolute inset-0 p-5 flex flex-col justify-center overflow-hidden">
            {/* Connection Line */}
            <div className="absolute left-[22px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-emerald-500/60 via-emerald-500/30 to-transparent" />

            {commits.map((commit, i) => (
                <motion.div
                    key={i}
                    className="flex items-center gap-3 py-1.5 relative"
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1 - i * 0.12, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                >
                    {/* Node */}
                    <motion.div
                        className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative z-10 flex-shrink-0"
                        style={{ boxShadow: '0 0 10px 2px rgba(16, 185, 129, 0.6)' }}
                        animate={i === 0 ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono text-emerald-200/90 truncate">{commit.message}</p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[9px] font-mono text-emerald-500/50 flex-shrink-0">{commit.time}</span>
                </motion.div>
            ))}
        </div>
    )
}


// --- HELPER: Icon Container with Hover Effect ---
const IconContainer = ({ color, children }: { color: string, children: React.ReactNode }) => (
    <motion.div
        className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 relative overflow-hidden"
        style={{
            backgroundColor: `${color}0a`,
            borderColor: `${color}20`,
            boxShadow: `0 0 20px -5px ${color}30`
        }}
        whileHover={{ scale: 1.1, boxShadow: `0 0 25px 0px ${color}50` }}
        transition={SPRING_BOUNCY}
    >
        <div className="relative z-10 text-white drop-shadow-sm">
            {children}
        </div>
    </motion.div>
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
            className={cn(`rounded-3xl bg-white/[0.02] backdrop-blur-md border border-white/[0.06] group cursor-pointer ${colSpan} ${className}`)}
            glareColor={accentColor}
            style={{
                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 20px 50px -20px rgba(0,0,0,0.5)'
            }}
        >
            {/* Hover Glow Effect */}
            <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accentColor}08, transparent 40%)`
                }}
            />

            {/* Inner Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none rounded-3xl" />

            <div className="relative h-full flex flex-col p-6 z-10">
                {/* Header */}
                <div className="flex flex-col items-start gap-4 mb-4">
                    <IconContainer color={accentColor!}>
                        {icon}
                    </IconContainer>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1 tracking-tight group-hover:text-white/90 transition-colors">{title}</h3>
                        <p className="text-sm text-zinc-500 font-light leading-relaxed">{description}</p>
                    </div>
                </div>

                {/* Visual */}
                <div className="relative mt-auto flex-1 h-[160px] w-full rounded-2xl border border-white/[0.04] overflow-hidden bg-black/30 group-hover:border-white/[0.08] transition-all duration-300">
                    {children}
                </div>
            </div>
        </TiltCard>
    )
}


// --- EXPORT ---
export function StorytellingFeatures() {
    return (
        <section id="features" className="py-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-black to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-16 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="h-px w-8 bg-gradient-to-r from-indigo-500/80 to-transparent" />
                        <span className="text-indigo-400/80 text-xs font-mono tracking-[0.2em] uppercase">
                            System Capabilities
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-display leading-[1.1] tracking-tight"
                    >
                        Engineering Intelligence <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Reimagined.</span>
                    </motion.h2>
                </div>

                <ScrollTiltWrapper>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-4 gap-5 auto-rows-[380px]"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                    >
                        {/* LIVE ANALYTICS - Double Width */}
                        <PremiumBentoCard
                            title="Live Analytics"
                            description="Real-time velocity and performance tracking."
                            icon={<BarChart2 size={18} strokeWidth={1.5} />}
                            accentColor="#22d3ee"
                            colSpan="md:col-span-2"
                        >
                            <AnalyticsStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Neural Engine"
                            description="AI-powered pattern recognition."
                            icon={<Brain size={18} strokeWidth={1.5} />}
                            accentColor="#a855f7"
                        >
                            <NeuralStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Vitality Score"
                            description="Predictive burnout prevention."
                            icon={<Activity size={18} strokeWidth={1.5} />}
                            accentColor="#f97316"
                        >
                            <VitalityStory />
                        </PremiumBentoCard>

                        {/* GLOBAL MESH - Double Width */}
                        <PremiumBentoCard
                            title="Global Mesh"
                            description="Elite distributed network connectivity."
                            icon={<Network size={18} strokeWidth={1.5} />}
                            accentColor="#6366f1"
                            colSpan="md:col-span-2"
                        >
                            <ConstellationStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Mastery"
                            description="Gamified skill progression."
                            icon={<Trophy size={18} strokeWidth={1.5} />}
                            accentColor="#eab308"
                        >
                            <MasteryStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Time Travel"
                            description="Complete evolution history."
                            icon={<Clock size={18} strokeWidth={1.5} />}
                            accentColor="#10b981"
                        >
                            <CommitHistoryStory />
                        </PremiumBentoCard>
                    </motion.div>
                </ScrollTiltWrapper>
            </div>
        </section>
    )
}
