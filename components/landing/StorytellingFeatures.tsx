'use client'

import { motion } from 'framer-motion'
import { Brain, Trophy, Activity, Network, Clock, BarChart2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ScrollTiltWrapper } from '../visuals/ScrollTilt'
import { TiltCard } from '../motion/TiltCard'

// --- Physics Config ---
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

// --- 1. LIVE ANALYTICS (Purple Sine Wave + Scanner) ---
const AnalyticsStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Scanned Grid Background - Pure Zinc */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-20" />

            {/* Floating Data Points - Purple */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-purple-500"
                    style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + Math.sin(i) * 20}%`,
                        boxShadow: '0 0 8px 2px rgba(139, 92, 246, 0.6)'
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
                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.25)" />
                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="shadow-line" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(139, 92, 246, 0.4)" />
                    </filter>
                </defs>
                <motion.path
                    fill="url(#waveGradient)"
                    stroke="rgba(139, 92, 246, 0.9)"
                    strokeWidth="2"
                    filter="url(#glow) url(#shadow-line)"
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

            {/* Scanning Laser - Purple */}
            <motion.div
                className="absolute top-0 bottom-0 w-[2px] z-10"
                style={{
                    background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 1), transparent)',
                    boxShadow: '0 0 20px 4px rgba(139, 92, 246, 0.6)'
                }}
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
        </div>
    )
}

// --- 2. NEURAL ENGINE (Purple Synaptic Core) ---
const NeuralStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Orbital Rings - Silver/Purple */}
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-purple-500/20"
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
                            boxShadow: '0 0 12px 3px rgba(168, 85, 247, 0.6)'
                        }}
                    />
                </motion.div>
            ))}

            {/* Central Core */}
            <div className="relative z-10">
                <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-full bg-purple-500/30 blur-[40px] absolute -inset-4"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Brain className="w-14 h-14 text-white stroke-[1.2] relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
                </motion.div>
            </div>

            {/* Synapse Particles */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-300 rounded-full"
                    style={{ boxShadow: '0 0 6px 2px rgba(168, 85, 247, 0.4)' }}
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

// --- 3. VITALITY (Silver to White Gradient Ring) ---
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
                {/* Outer Static Ring */}
                <svg className="w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="52" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                    {[...Array(36)].map((_, i) => (
                        <line
                            key={i}
                            x1="56"
                            y1="6"
                            x2="56"
                            y2={i % 3 === 0 ? 10 : 8}
                            stroke={i < 32 ? "rgba(255, 255, 255, 0.2)" : "rgba(255,255,255,0.05)"}
                            strokeWidth="1"
                            transform={`rotate(${i * 10} 56 56)`}
                        />
                    ))}
                </svg>

                {/* Inner Progress Arc - Silver to White */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <defs>
                        <linearGradient id="vitalityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#71717a" />
                            <stop offset="100%" stopColor="#ffffff" />
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
                        style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))' }}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white tracking-tighter font-mono tabular-nums">{count}</span>
                    <span className="text-[9px] text-zinc-500 font-mono tracking-[0.15em] uppercase mt-0.5">Vitality</span>
                </div>
            </div>
        </div>
    )
}

// --- 4. GLOBAL NETWORK (White Nodes + Zinc Lines) ---
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
                size: Math.random() < 0.15 ? 2.5 : 1.5,
                isHot: Math.random() < 0.1 // Some active nodes
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

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
                p.dx *= 0.99
                p.dy *= 0.99

                if (p.x < 0 || p.x > canvas.width) p.dx *= -1
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1

                // Draw Nodes - White
                ctx.fillStyle = p.isHot ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()

                // Hot nodes glow
                if (p.isHot) {
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8)
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
                    ctx.fillStyle = gradient
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
                    ctx.fill()
                }
            })

            // Draw Connections - Zinc-800
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = 1 - (dist / CONNECTION_DISTANCE)
                        ctx.strokeStyle = `rgba(113, 113, 122, ${opacity * 0.3})` // Zinc-500ish at low opacity
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
        </div>
    )
}

// --- 5. MASTERY (Floating Trophy) ---
const MasteryStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
            {/* Glow */}
            <motion.div
                className="absolute -inset-6 bg-purple-500/10 blur-[50px] rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Achievement Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-zinc-300 rounded-full"
                    style={{
                        left: '50%',
                        top: '50%',
                        boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.4)'
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
                <Trophy className="w-16 h-16 text-white stroke-[1.2] drop-shadow-[0_0_25px_rgba(139,92,246,0.3)]" />
                <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ boxShadow: '0 0 8px 2px rgba(139, 92, 246, 0.8)' }}
                />
            </motion.div>
        </div>
    </div>
)

// --- 6. TIME TRAVEL (Silver/White/Purple Syntax) ---
const CommitHistoryStory = () => {
    const commits = [
        { message: 'feat: add dark mode', time: '2m', color: 'text-purple-300' },
        { message: 'fix: auth timeout', time: '5m', color: 'text-zinc-300' },
        { message: 'refactor: queries', time: '12m', color: 'text-purple-200' },
        { message: 'docs: update README', time: '1h', color: 'text-zinc-400' },
        { message: 'style: spacing', time: '3h', color: 'text-zinc-300' },
    ]

    return (
        <div className="absolute inset-0 p-5 flex flex-col justify-center overflow-hidden">
            {/* Connection Line */}
            <div className="absolute left-[22px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-purple-500/60 via-purple-500/30 to-transparent" />

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
                        className="w-2.5 h-2.5 rounded-full bg-white relative z-10 flex-shrink-0"
                        style={{ boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.4)' }}
                        animate={i === 0 ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                        <p className={cn("text-[11px] font-mono truncate", commit.color)}>{commit.message}</p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[9px] font-mono text-zinc-600 flex-shrink-0">{commit.time}</span>
                </motion.div>
            ))}
        </div>
    )
}

// --- HELPER: Icon Container ---
const IconContainer = ({ color, children }: { color: string, children: React.ReactNode }) => (
    <motion.div
        className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 relative overflow-hidden"
        style={{
            backgroundColor: `${color}0a`,
            borderColor: `${color}20`,
            boxShadow: `0 0 20px -5px ${color}10` // Subtle shadow
        }}
        whileHover={{ scale: 1.1, boxShadow: `0 0 25px 0px ${color}30` }}
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
    accentColor?: string // Defaults to purple
    colSpan?: string
}

const PremiumBentoCard = ({ title, description, icon, children, className = '', accentColor = '#8b5cf6', colSpan = '' }: BentoCardProps) => {
    return (
        <TiltCard
            variants={bentoVariants}
            className={cn(`rounded-3xl bg-[#09090b] border border-zinc-800 group cursor-pointer ${colSpan} ${className}`)}
            glareColor={accentColor}
            style={{
                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.02), 0 10px 30px -10px rgba(0,0,0,0.5)'
            }}
        >
            {/* Hover Glow Effect - Purple/White */}
            <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    border: '1px solid rgba(139, 92, 246, 0.3)', // Purple border on hover
                    boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.1)'
                }}
            />

            {/* Inner Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none rounded-3xl" />

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
                <div className="relative mt-auto flex-1 h-[160px] w-full rounded-2xl border border-white/[0.04] overflow-hidden bg-black/40 group-hover:border-white/[0.08] transition-all duration-300">
                    {children}
                </div>
            </div>
        </TiltCard>
    )
}

// --- EXPORT ---
export function StorytellingFeatures() {
    return (
        <section id="features" className="py-32 relative overflow-hidden bg-black">
            {/* Gradient fade at top */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent to-black pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-16 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="h-px w-8 bg-gradient-to-r from-purple-500/80 to-transparent" />
                        <span className="text-zinc-500 text-xs font-mono tracking-[0.2em] uppercase">
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
                        Everything to Flex Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-purple-300 to-white">Code Journey</span>
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
                            description="See commits, streaks, and productivity visualized beautifully."
                            icon={<BarChart2 size={18} strokeWidth={1.5} />}
                            accentColor="#8b5cf6"
                            colSpan="md:col-span-2"
                        >
                            <AnalyticsStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="AI Insights"
                            description="Personalized tips to code smarter, not harder."
                            icon={<Brain size={18} strokeWidth={1.5} />}
                            accentColor="#8b5cf6"
                        >
                            <NeuralStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Burnout Shield"
                            description="Know when to take a break before burnout hits."
                            icon={<Activity size={18} strokeWidth={1.5} />}
                            accentColor="#ffffff" // Silver/White for Vitality
                        >
                            <VitalityStory />
                        </PremiumBentoCard>

                        {/* GLOBAL MESH - Double Width */}
                        <PremiumBentoCard
                            title="Leaderboards"
                            description="Compare your stats with developers worldwide."
                            icon={<Network size={18} strokeWidth={1.5} />}
                            accentColor="#8b5cf6"
                            colSpan="md:col-span-2"
                        >
                            <ConstellationStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Achievements"
                            description="Unlock badges. Celebrate milestones. Share everywhere."
                            icon={<Trophy size={18} strokeWidth={1.5} />}
                            accentColor="#8b5cf6"
                        >
                            <MasteryStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Commit History"
                            description="Your complete coding timeline at a glance."
                            icon={<Clock size={18} strokeWidth={1.5} />}
                            accentColor="#8b5cf6"
                        >
                            <CommitHistoryStory />
                        </PremiumBentoCard>
                    </motion.div>
                </ScrollTiltWrapper>
            </div>
        </section>
    )
}
