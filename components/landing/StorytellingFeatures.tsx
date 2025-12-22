'use client'

import { motion, useInView, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { BarChart3, Brain, Flame, Trophy, Share2, Users, Command, Star, Activity, Layers, Globe, Sparkles } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

// --- Premium Animation Config ---
const springConfig = { stiffness: 400, damping: 30, mass: 0.8 }
const smoothSpring = { stiffness: 100, damping: 20, mass: 1 }

// --- Stagger Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
}

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 40,
        scale: 0.96,
        rotateX: 8
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: "spring",
            ...smoothSpring,
            opacity: { duration: 0.5, ease: "easeOut" }
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
}

const PremiumBentoCard = ({ title, description, icon, children, className = '', accentColor = '#a855f7' }: BentoCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]), springConfig)
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2, 2]), springConfig)
    const scale = useSpring(1, springConfig)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        mouseX.set(x)
        mouseY.set(y)
    }

    const handleMouseEnter = () => {
        setIsHovered(true)
        scale.set(1.015)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        mouseX.set(0)
        mouseY.set(0)
        scale.set(1)
    }

    return (
        <motion.div
            ref={cardRef}
            variants={cardVariants}
            className={`group relative h-full ${className}`}
            style={{
                rotateX,
                rotateY,
                scale,
                transformStyle: "preserve-3d",
                perspective: 1000
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Subtle Glow Effect */}
            <motion.div
                className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accentColor}15, transparent 40%)`,
                    opacity: isHovered ? 1 : 0
                }}
            />

            {/* Main Card */}
            <div className="relative h-full rounded-2xl border border-white/[0.06] bg-[#08060d]/90 backdrop-blur-xl overflow-hidden transition-all duration-500 group-hover:border-white/[0.12]">

                {/* Top Edge Shine */}
                <motion.div
                    className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
                        opacity: isHovered ? 1 : 0.3
                    }}
                    animate={{ opacity: isHovered ? 1 : 0.3 }}
                    transition={{ duration: 0.3 }}
                />

                {/* Content Layer */}
                <div className="relative z-10 p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                        <motion.div
                            className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/70 transition-all duration-300"
                            animate={{
                                borderColor: isHovered ? `${accentColor}40` : 'rgba(255,255,255,0.08)',
                                boxShadow: isHovered ? `0 0 20px ${accentColor}20` : '0 0 0px transparent'
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {icon}
                        </motion.div>
                        <div className="flex-1">
                            <h3 className="font-display font-semibold text-white text-lg tracking-tight">{title}</h3>
                            <p className="text-white/35 text-sm mt-0.5 leading-relaxed">{description}</p>
                        </div>
                    </div>

                    {/* Visual Area */}
                    <div className="relative flex-1 min-h-0">
                        {children}
                    </div>
                </div>

                {/* Hover Gradient Overlay */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}05 0%, transparent 50%, ${accentColor}03 100%)`
                    }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </motion.div>
    )
}

// --- 1. LIVE ANALYTICS (Premium Velocity Chart) ---
const AnalyticsStory = () => {
    const barHeights = [35, 55, 42, 78, 52, 88, 65, 72, 48, 92, 58, 75]

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-end p-4 pb-0">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute left-0 right-0 border-t border-cyan-500/10" style={{ top: `${i * 20}%` }} />
                ))}
            </div>

            {/* Bars */}
            <div className="w-full h-full flex items-end justify-between gap-[3px] relative z-10">
                {barHeights.map((height, i) => (
                    <motion.div
                        key={i}
                        className="relative flex-1 rounded-t-sm overflow-hidden"
                        style={{ background: 'linear-gradient(to top, rgba(34,211,238,0.6), rgba(34,211,238,0.1))' }}
                        initial={{ height: "0%" }}
                        animate={{
                            height: [`${height}%`, `${height + 15}%`, `${height - 10}%`, `${height}%`]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15,
                            times: [0, 0.33, 0.66, 1]
                        }}
                    >
                        {/* Top glow cap */}
                        <motion.div
                            className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-cyan-400 to-transparent"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Smooth Scanning Beam */}
            <motion.div
                className="absolute top-0 bottom-0 w-[1px] z-20 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, transparent 10%, rgba(34,211,238,0.8) 50%, transparent 90%)',
                    boxShadow: '0 0 20px rgba(34,211,238,0.6), 0 0 40px rgba(34,211,238,0.3)'
                }}
                animate={{ left: ['0%', '100%', '100%', '0%'] }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.45, 0.55, 1]
                }}
            >
                {/* Beam glow */}
                <div className="absolute -left-4 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
            </motion.div>

            {/* Data Points */}
            {[0, 2, 5, 8, 11].map((barIndex, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-cyan-400 z-30"
                    style={{
                        left: `${(barIndex / 12) * 100 + 4}%`,
                        boxShadow: '0 0 10px rgba(34,211,238,0.8)'
                    }}
                    animate={{
                        bottom: [`${barHeights[barIndex]}%`, `${barHeights[barIndex] + 15}%`, `${barHeights[barIndex]}%`],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

// --- 2. NEURAL ENGINE (Flowing AI Visualization) ---
const AIStory = () => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
            {/* Flowing Code Lines */}
            {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                    key={i}
                    className="absolute left-0 right-0 flex items-center gap-1 opacity-30"
                    style={{ top: `${15 + i * 18}%` }}
                    initial={{ x: 0 }}
                    animate={{ x: [0, -60, 0] }}
                    transition={{
                        duration: 8 + i * 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {[...Array(8)].map((_, j) => (
                        <motion.div
                            key={j}
                            className="h-[2px] rounded-full"
                            style={{
                                width: `${20 + Math.random() * 40}px`,
                                background: `linear-gradient(90deg, transparent, rgba(168,85,247,${0.3 + Math.random() * 0.4}), transparent)`
                            }}
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: j * 0.2 }}
                        />
                    ))}
                </motion.div>
            ))}

            {/* Central Brain Hub */}
            <div className="relative flex items-center justify-center z-10">
                {/* Pulsing Rings */}
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border border-purple-500/30"
                        style={{ width: 60 + i * 30, height: 60 + i * 30 }}
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeInOut"
                        }}
                    />
                ))}

                {/* Core */}
                <motion.div
                    className="w-14 h-14 bg-[#0a0612] border border-purple-500/50 rounded-xl flex items-center justify-center relative z-10"
                    animate={{
                        boxShadow: [
                            "0 0 20px rgba(168,85,247,0.3)",
                            "0 0 40px rgba(168,85,247,0.5)",
                            "0 0 20px rgba(168,85,247,0.3)"
                        ]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Brain className="w-7 h-7 text-purple-400" />
                </motion.div>

                {/* Orbiting Particles */}
                {[0, 1, 2, 3].map(i => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-purple-400"
                        style={{
                            boxShadow: '0 0 8px rgba(168,85,247,0.8)'
                        }}
                        animate={{
                            rotate: [0, 360],
                            x: [Math.cos(i * Math.PI / 2) * 50, Math.cos(i * Math.PI / 2 + Math.PI * 2) * 50],
                            y: [Math.sin(i * Math.PI / 2) * 50, Math.sin(i * Math.PI / 2 + Math.PI * 2) * 50]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 1
                        }}
                    />
                ))}
            </div>

            {/* Processing Indicator */}
            <motion.div
                className="absolute bottom-4 left-4 right-4 flex items-center gap-2"
            >
                <div className="flex-1 h-1 bg-purple-500/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"
                        animate={{ width: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </motion.div>
        </div>
    )
}

// --- 3. VITALITY (Smooth Energy Ring) ---
const BurnoutStory = () => {
    const [progress, setProgress] = useState(92)

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                const newVal = p + (Math.random() - 0.5) * 8
                return Math.max(70, Math.min(98, newVal))
            })
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const strokeDashoffset = 226 * (1 - progress / 100)

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Ambient Glow */}
            <motion.div
                className="absolute w-28 h-28 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)'
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main Ring */}
            <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                    {/* Background Ring */}
                    <circle
                        cx="48" cy="48" r="36"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="6"
                        fill="none"
                    />
                    {/* Progress Ring */}
                    <motion.circle
                        cx="48" cy="48" r="36"
                        stroke="url(#energyGradient)"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="226"
                        initial={{ strokeDashoffset: 226 * (1 - 92 / 100) }}
                        animate={{ strokeDashoffset }}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    />
                    <defs>
                        <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-[9px] text-orange-400/70 font-mono uppercase tracking-wider">Energy</span>
                    <motion.span
                        className="text-xl font-bold text-white tabular-nums"
                        key={Math.round(progress)}
                        initial={{ scale: 1.1, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {Math.round(progress)}%
                    </motion.span>
                </div>

                {/* Glow Dot */}
                <motion.div
                    className="absolute w-2 h-2 rounded-full bg-orange-400"
                    style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: '0 0',
                        boxShadow: '0 0 10px rgba(249,115,22,0.8)'
                    }}
                    animate={{
                        rotate: [0, 360 * (progress / 100)]
                    }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                />
            </div>
        </div>
    )
}

// --- 4. MASTERY (Achievement Toast with Particles) ---
const AchievementsStory = () => {
    const [showSparkles, setShowSparkles] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setShowSparkles(true)
            setTimeout(() => setShowSparkles(false), 1500)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {/* Achievement Toast */}
            <motion.div
                className="w-full bg-gradient-to-r from-yellow-900/20 to-amber-900/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3 relative overflow-hidden"
                animate={{
                    y: [0, -3, 0],
                    boxShadow: [
                        '0 0 0px rgba(234,179,8,0)',
                        '0 0 20px rgba(234,179,8,0.1)',
                        '0 0 0px rgba(234,179,8,0)'
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Icon */}
                <motion.div
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/30 to-amber-500/20 flex items-center justify-center shrink-0"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Trophy className="w-5 h-5 text-yellow-400" />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="h-2.5 w-20 bg-yellow-500/30 rounded mb-1.5" />
                    <div className="h-2 w-28 bg-yellow-500/15 rounded" />
                </div>

                {/* Sparkle Effects */}
                <AnimatePresence>
                    {showSparkles && (
                        <>
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute"
                                    style={{
                                        left: `${20 + Math.random() * 60}%`,
                                        top: `${20 + Math.random() * 60}%`
                                    }}
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{
                                        scale: [0, 1.5, 0],
                                        opacity: [1, 1, 0],
                                        y: [0, -20],
                                        rotate: [0, 180]
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                >
                                    <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                                </motion.div>
                            ))}
                        </>
                    )}
                </AnimatePresence>

                {/* Continuous Sparkle */}
                <motion.div
                    className="absolute top-2 right-3"
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
            </motion.div>
        </div>
    )
}

// --- 5. RECAP (3D Card Stack) ---
const YearInReviewStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 800 }}>
            <div className="relative w-28 h-36">
                {/* Stacked Cards */}
                {[2, 1, 0].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-xl border border-emerald-500/20 overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, rgba(16,185,129,${0.15 + i * 0.05}) 0%, rgba(6,78,59,0.3) 100%)`,
                            zIndex: 3 - i,
                            transformStyle: 'preserve-3d'
                        }}
                        animate={{
                            y: [i * 8, i * 8 - 6, i * 8],
                            rotateX: [5 - i * 2, 8 - i * 2, 5 - i * 2],
                            rotateY: [i * 3, -i * 3, i * 3],
                            scale: [1 - i * 0.05, 1.02 - i * 0.05, 1 - i * 0.05]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                        }}
                    >
                        {/* Card Content Lines */}
                        {i === 0 && (
                            <div className="absolute inset-0 p-3 flex flex-col gap-2 pt-8">
                                <div className="h-1.5 w-14 bg-emerald-500/30 rounded-full" />
                                <div className="h-1.5 w-10 bg-emerald-500/20 rounded-full" />
                                <div className="h-1.5 w-16 bg-emerald-500/20 rounded-full" />
                            </div>
                        )}

                        {/* Card Shadow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
                    </motion.div>
                ))}

                {/* Year Badge */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                    animate={{
                        scale: [1, 1.05, 1],
                        textShadow: [
                            '0 0 20px rgba(16,185,129,0.3)',
                            '0 0 40px rgba(16,185,129,0.5)',
                            '0 0 20px rgba(16,185,129,0.3)'
                        ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span className="text-3xl font-bold text-white drop-shadow-lg">2024</span>
                </motion.div>
            </div>
        </div>
    )
}

// --- 6. GLOBAL CONSTELLATION (Network Visualization) ---
const TeamInsightsStory = () => {
    const nodes = [
        { x: 50, y: 50, size: 6, primary: true },
        { x: 20, y: 30, size: 3 },
        { x: 80, y: 25, size: 3 },
        { x: 30, y: 75, size: 3 },
        { x: 75, y: 70, size: 3 },
        { x: 50, y: 20, size: 2 },
        { x: 15, y: 55, size: 2 },
        { x: 85, y: 50, size: 2 },
    ]

    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Subtle Grid */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(99,102,241,0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(99,102,241,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px'
                }}
            />

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full">
                {nodes.slice(1).map((node, i) => (
                    <motion.line
                        key={i}
                        x1={`${nodes[0].x}%`}
                        y1={`${nodes[0].y}%`}
                        x2={`${node.x}%`}
                        y2={`${node.y}%`}
                        stroke="rgba(99,102,241,0.2)"
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: i * 0.15 }}
                    />
                ))}

                {/* Data Pulse along lines */}
                {nodes.slice(1).map((node, i) => (
                    <motion.circle
                        key={`pulse-${i}`}
                        r="2"
                        fill="#6366f1"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.8))' }}
                        initial={{
                            cx: `${nodes[0].x}%`,
                            cy: `${nodes[0].y}%`,
                            opacity: 0
                        }}
                        animate={{
                            cx: [`${nodes[0].x}%`, `${node.x}%`, `${nodes[0].x}%`],
                            cy: [`${nodes[0].y}%`, `${node.y}%`, `${nodes[0].y}%`],
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            times: [0, 0.45, 0.55, 1]
                        }}
                    />
                ))}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full ${node.primary ? 'bg-indigo-500' : 'bg-indigo-400/80'}`}
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: node.size * 2,
                        height: node.size * 2,
                        marginLeft: -node.size,
                        marginTop: -node.size,
                        boxShadow: node.primary
                            ? '0 0 20px rgba(99,102,241,0.6)'
                            : '0 0 10px rgba(99,102,241,0.4)'
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: [1, node.primary ? 1.3 : 1.15, 1],
                        opacity: 1
                    }}
                    transition={{
                        scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                        opacity: { duration: 0.5, delay: i * 0.1 }
                    }}
                >
                    {node.primary && (
                        <motion.div
                            className="absolute inset-0 rounded-full bg-indigo-400"
                            animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                        />
                    )}
                </motion.div>
            ))}
        </div>
    )
}

// --- MAIN EXPORT ---

export function StorytellingFeatures() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    return (
        <section id="features" className="py-32 relative overflow-hidden bg-black">
            {/* Subtle Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-600/[0.02] rounded-full blur-[200px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/[0.02] rounded-full blur-[200px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-4xl mx-auto mb-20"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-white/40 mb-8 uppercase tracking-widest"
                        whileHover={{ borderColor: 'rgba(168,85,247,0.3)', backgroundColor: 'rgba(168,85,247,0.05)' }}
                        transition={{ duration: 0.3 }}
                    >
                        <Command className="w-3 h-3" /> System Capabilities
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight text-white leading-[1.05]">
                        Precision tools for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">quantum velocity.</span>
                    </h2>
                    <p className="text-white/35 text-lg max-w-2xl mx-auto">
                        Developer analytics reimagined. Track, optimize, and celebrate your coding journey.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
                    style={{ perspective: 1200 }}
                >
                    {/* 1. HERO: Analytics (2 cols x 2 rows) */}
                    <div className="md:col-span-2 md:row-span-2 min-h-[300px] lg:min-h-[580px]">
                        <PremiumBentoCard
                            title="Live Analytics"
                            description="Real-time velocity metrics and continuous data streams."
                            icon={<Activity className="w-5 h-5" />}
                            accentColor="#22d3ee"
                        >
                            <AnalyticsStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 2. Neural Engine (1 col x 1 row) */}
                    <div className="min-h-[280px]">
                        <PremiumBentoCard
                            title="Neural Engine"
                            description="AI optimization & code review."
                            icon={<Brain className="w-5 h-5" />}
                            accentColor="#a855f7"
                        >
                            <AIStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 3. Vitality (1 col x 1 row) */}
                    <div className="min-h-[280px]">
                        <PremiumBentoCard
                            title="Vitality"
                            description="Energy & wellness tracking."
                            icon={<Flame className="w-5 h-5" />}
                            accentColor="#f97316"
                        >
                            <BurnoutStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 4. Mastery (1 col x 1 row) */}
                    <div className="min-h-[280px]">
                        <PremiumBentoCard
                            title="Mastery"
                            description="Unlock achievements."
                            icon={<Trophy className="w-5 h-5" />}
                            accentColor="#eab308"
                        >
                            <AchievementsStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 5. Recap (1 col x 1 row) */}
                    <div className="min-h-[280px]">
                        <PremiumBentoCard
                            title="Recap"
                            description="Year-end summaries."
                            icon={<Layers className="w-5 h-5" />}
                            accentColor="#10b981"
                        >
                            <YearInReviewStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 6. Global Constellation (4 cols x 1 row) */}
                    <div className="md:col-span-2 lg:col-span-4 min-h-[320px]">
                        <PremiumBentoCard
                            title="Global Constellation"
                            description="Visualize team collaboration patterns across the globe."
                            icon={<Globe className="w-5 h-5" />}
                            accentColor="#6366f1"
                        >
                            <TeamInsightsStory />
                        </PremiumBentoCard>
                    </div>

                </motion.div>
            </div>
        </section>
    )
}
