'use client'

import { motion, useInView, useMotionValue, useTransform, useSpring, useScroll, AnimatePresence } from 'framer-motion'
import { BarChart3, Brain, Flame, Trophy, Share2, Users, Command, Star, Activity, Layers, Globe, Sparkles } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ScrollTiltWrapper } from '../visuals/ScrollTilt'

// --- Cinematic Animation Config ---
const SPRING_PHYSICS = { type: "spring", stiffness: 150, damping: 15 }

// --- Stagger Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}



// --- Premium Bento Card Component ---
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
    const cardRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        // Normalized coordinates -0.5 to 0.5 for tilt
        const xNorm = (e.clientX - rect.left) / rect.width - 0.5
        const yNorm = (e.clientY - rect.top) / rect.height - 0.5

        // Pixel coordinates for spotlight
        cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
        cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)

        // Tilt
        mouseX.set(xNorm)
        mouseY.set(yNorm)
    }

    // Smooth reset on mouse leave
    const handleMouseLeave = () => {
        mouseX.set(0)
        mouseY.set(0)
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5])
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5])

    return (
        <motion.div
            ref={cardRef}
            className={cn(`relative overflow-hidden rounded-xl bg-[#09090b] border border-white/5 group ${colSpan} ${className}`, 'dev-flow-card')}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000
            }}
            whileHover={{ scale: 1.02 }}
            transition={SPRING_PHYSICS}
        >
            {/* Spotlight Gradient */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%)`
                }}
            />
            {/* Masked Border */}
            <div className="absolute inset-[1px] rounded-[23px] bg-black/95 z-20" />

            {/* Content Container */}
            <div className="relative h-full w-full rounded-3xl border border-white/[0.08] bg-black/60 backdrop-blur-sm overflow-hidden z-30 flex flex-col p-6">

                {/* Header */}
                <div className="relative z-20 flex items-center gap-4 mb-6">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]" style={{ color: accentColor }}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                        <p className="text-sm text-zinc-500">{description}</p>
                    </div>
                </div>

                {/* Visual Area */}
                <div className="relative flex-1 min-h-[180px] w-full">
                    {children}
                </div>
            </div>
        </motion.div>
    )
}

// --- 1. LIVE ANALYTICS (Random Bars) ---
const AnalyticsStory = () => {
    return (
        <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pb-2">
            {[...Array(7)].map((_, i) => (
                <LiveBar key={i} index={i} />
            ))}
        </div>
    )
}

const LiveBar = ({ index }: { index: number }) => {
    const [height, setHeight] = useState(20)

    useEffect(() => {
        const interval = setInterval(() => {
            setHeight(Math.floor(Math.random() * 80) + 20)
        }, 600 + index * 100) // Stagger updates
        return () => clearInterval(interval)
    }, [index])

    return (
        <div className="relative w-full h-full flex items-end bg-slate-800/30 rounded-t-sm overflow-hidden group">
            <motion.div
                className="w-full bg-cyan-500 relative"
                animate={{ height: `${height}%` }}
                transition={SPRING_PHYSICS}
            >
                <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white/30 to-transparent" />
            </motion.div>
            <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
        </div>
    )
}

// --- 2. NEURAL ENGINE (Pulse & Ring) ---
const NeuralStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Spinning Ring */}
            <motion.div
                className="absolute w-32 h-32 rounded-full border border-purple-500/20 border-t-purple-500/80"
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
            />
            {/* Pulsing Core */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <Brain className="w-16 h-16 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
            </motion.div>
        </div>
    )
}

// --- 3. CONSTELLATION (Packets) ---
const ConstellationStory = () => {
    const nodes = [
        { x: 50, y: 50 }, // Center
        { x: 20, y: 20 },
        { x: 80, y: 20 },
        { x: 20, y: 80 },
        { x: 80, y: 80 },
    ]

    return (
        <div className="absolute inset-0">
            <svg className="w-full h-full">
                {/* Lines */}
                {nodes.slice(1).map((node, i) => (
                    <line
                        key={i}
                        x1={`${nodes[0].x}%`} y1={`${nodes[0].y}%`}
                        x2={`${node.x}%`} y2={`${node.y}%`}
                        stroke="rgba(99,102,241,0.2)"
                        strokeWidth="1"
                    />
                ))}
            </svg>

            {/* Traveling Packet (Moved outside SVG to avoid div in g error) */}
            {nodes.slice(1).map((node, i) => (
                <motion.div
                    key={`packet-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(129,140,248,1)]"
                    animate={{
                        left: [`${nodes[0].x}%`, `${node.x}%`],
                        top: [`${nodes[0].y}%`, `${node.y}%`],
                        opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                    style={{ transform: 'translate(-50%, -50%)' }}
                />
            ))}

            {/* Nodes */}
            {nodes.map((node, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                />
            ))}
        </div>
    )
}

// --- 4. VITALITY (Recycled) ---
const VitalityStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                <motion.circle
                    cx="56" cy="56" r="48"
                    stroke="#f97316" strokeWidth="8" fill="none" strokeDasharray="301" initial={{ strokeDashoffset: 301 }}
                    animate={{ strokeDashoffset: 50 }} transition={{ duration: 1.5 }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-white">88%</div>
        </div>
    </div>
)

// --- 5. MASTERY (Recycled) ---
const MasteryStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <Trophy className="w-16 h-16 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
    </div>
)

// --- 6. RECAP (Recycled) ---
const RecapStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="px-6 py-4 bg-emerald-900/40 rounded-xl border border-emerald-500/30 text-emerald-400 font-bold text-2xl rotate-[-5deg]">
            2024
        </div>
    </div>
)


// --- MAIN EXPORT ---
export function StorytellingFeatures() {
    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <ScrollTiltWrapper>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[320px]"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {/* Analytics: 2x2 */}
                        <PremiumBentoCard
                            title="Live Analytics"
                            description="Real-time system metrics."
                            icon={<Activity />}
                            accentColor="#06b6d4"
                            colSpan="md:col-span-2 md:row-span-1"
                        >
                            <AnalyticsStory />
                        </PremiumBentoCard>

                        {/* Neural */}
                        <PremiumBentoCard
                            title="Neural Engine"
                            description="AI Optimization."
                            icon={<Brain />}
                            accentColor="#a855f7"
                        >
                            <NeuralStory />
                        </PremiumBentoCard>

                        {/* Vitality */}
                        <PremiumBentoCard
                            title="Vitality"
                            description="Health tracking."
                            icon={<Flame />}
                            accentColor="#f97316"
                        >
                            <VitalityStory />
                        </PremiumBentoCard>

                        {/* Constellation */}
                        <PremiumBentoCard
                            title="Global Network"
                            description="Connected nodes."
                            icon={<Globe />}
                            accentColor="#6366f1"
                            colSpan="md:col-span-2"
                        >
                            <ConstellationStory />
                        </PremiumBentoCard>

                        {/* Mastery */}
                        <PremiumBentoCard
                            title="Mastery"
                            description="Achievements."
                            icon={<Trophy />}
                            accentColor="#eab308"
                        >
                            <MasteryStory />
                        </PremiumBentoCard>

                        {/* Recap */}
                        <PremiumBentoCard
                            title="Recap"
                            description="Yearly summary."
                            icon={<Layers />}
                            accentColor="#10b981"
                        >
                            <RecapStory />
                        </PremiumBentoCard>

                    </motion.div>
                </ScrollTiltWrapper>
            </div>
        </section>
    )
}
