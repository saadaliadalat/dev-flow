'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Brain, Flame, Trophy, Activity, Layers, Globe, Zap, BarChart2, GitCommit } from 'lucide-react'
import { useState, useRef } from 'react'
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
    hidden: { opacity: 0, y: 40, scale: 0.95, filter: "blur(10px)" },
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
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black/20">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 bg-center" />

            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(6, 182, 212, 0.4)" />
                        <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                    </linearGradient>
                </defs>
                {/* Wave Path */}
                <motion.path
                    fill="url(#waveGradient)"
                    stroke="rgba(6, 182, 212, 1)"
                    strokeWidth="3"
                    initial={{ d: "M0,100 C100,100 200,100 400,100 L400,200 L0,200 Z" }}
                    animate={{
                        d: [
                            "M0,80 C100,60 200,120 400,80 L400,200 L0,200 Z",
                            "M0,100 C150,140 250,50 400,100 L400,200 L0,200 Z",
                            "M0,80 C100,60 200,120 400,80 L400,200 L0,200 Z"
                        ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* Scanning Line */}
            <motion.div
                className="absolute top-0 bottom-0 w-[2px] bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,1)]"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-32 bg-gradient-to-t from-cyan-500/20 to-transparent" />
            </motion.div>

        </div>
    )
}

// --- 2. NEURAL ENGINE (Synaptic Core) ---
const NeuralStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Orbital Rings */}
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full border border-purple-500/20"
                    style={{ width: `${i * 35 + 30}%`, height: `${i * 35 + 30}%` }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7] -translate-x-1/2 -translate-y-1/2" />
                </motion.div>
            ))}

            {/* Central Core */}
            <div className="relative z-10">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-full bg-purple-600/30 blur-[40px] absolute inset-0 -translate-x-4 -translate-y-4"
                />
                <Brain className="w-16 h-16 text-purple-200 relative z-10 drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]" />
            </div>

            {/* Connecting Synapses */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                <motion.line x1="50%" y1="50%" x2="20%" y2="20%" stroke="rgba(168,85,247,0.5)" strokeDasharray="4 4" animate={{ strokeDashoffset: [0, -20] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                <motion.line x1="50%" y1="50%" x2="80%" y2="80%" stroke="rgba(168,85,247,0.5)" strokeDasharray="4 4" animate={{ strokeDashoffset: [0, 20] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                <motion.line x1="50%" y1="50%" x2="80%" y2="20%" stroke="rgba(168,85,247,0.5)" strokeDasharray="4 4" animate={{ strokeDashoffset: [0, -25] }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} />
            </svg>
        </div>
    )
}

// --- 3. VITALITY (Cyber HUD) ---
const VitalityStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-36 h-36">
            {/* Outer Segmented Ring */}
            <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="64" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
                <motion.circle
                    cx="72" cy="72" r="64"
                    stroke="#f97316" strokeWidth="2" fill="none"
                    strokeDasharray="4 8"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "72px", originY: "72px" }}
                />
            </svg>

            {/* Inner Progress - Glowy */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 scale-75">
                <defs>
                    <linearGradient id="vitalityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                </defs>
                <circle cx="72" cy="72" r="64" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <motion.circle
                    cx="72" cy="72" r="64"
                    stroke="url(#vitalityGrad)" strokeWidth="8" fill="none"
                    strokeDasharray="402"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 402 }}
                    whileInView={{ strokeDashoffset: 40 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    filter="drop-shadow(0 0 4px rgba(249, 115, 22, 0.5))"
                />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Flame className="w-8 h-8 text-orange-400 mb-1 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)] fill-orange-500/20" />
                </motion.div>
                <span className="text-3xl font-bold text-white tracking-tighter">98<span className="text-sm text-zinc-500 font-normal">%</span></span>
            </div>
        </div>
    </div>
)

// --- 4. GLOBAL NETWORK (Holographic Globe) ---
const ConstellationStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center perspective-[1200px] overflow-hidden">
            {/* 3D Rotating Sphere Effect simulated with CSS */}
            <div className="relative w-80 h-80 animate-[spin-slow_25s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }}>
                {/* Latitude Lines */}
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 rotate-x-[75deg] scale-y-50" />
                <div className="absolute inset-10 rounded-full border border-indigo-500/10 rotate-x-[75deg] scale-y-50" />
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 rotate-x-[15deg] scale-y-50" />

                {/* Longitude Approximation */}
                <div className="absolute inset-[10%] rounded-full border-l border-r border-indigo-500/10 rotate-45" />
                <div className="absolute inset-[10%] rounded-full border-l border-r border-indigo-500/10 -rotate-45" />

                {/* Nodes */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                    <motion.div
                        key={deg}
                        className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_15px_#6366f1]"
                        style={{ marginLeft: -5, marginTop: -5 }}
                        animate={{
                            x: [Math.cos(deg * Math.PI / 180) * 120, Math.cos((deg + 360) * Math.PI / 180) * 120],
                            y: [Math.sin(deg * Math.PI / 180) * 40, Math.sin((deg + 360) * Math.PI / 180) * 40],
                            scale: [0.8, 1.5, 0.8], // Fake depth scale
                            opacity: [0.3, 1, 0.3], // Fake depth opacity
                            zIndex: [0, 10, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: i * 1 }}
                    />
                ))}

                {/* Center Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/30 blur-[60px] rounded-full" />
            </div>
            <Globe className="absolute w-20 h-20 text-indigo-400/20 animate-pulse" />
        </div>
    )
}

// --- 5. MASTERY (Floating Badge) ---
const MasteryStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
            {/* Sunburst background */}
            <motion.div
                className="absolute inset-0 bg-yellow-500/20 blur-[50px]"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            <motion.div
                whileHover={{ rotateY: 180, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative z-10"
            >
                <div className="relative">
                    <Trophy className="w-24 h-24 text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.5)]" />
                    <motion.div
                        className="absolute -top-4 -right-4"
                        animate={{ rotate: [0, 10, 0, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Zap className="w-8 h-8 text-white fill-current drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    </div>
)

// --- 6. RECAP (Layered Stack) ---
const RecapStory = () => (
    <div className="absolute inset-0 flex items-center justify-center perspective-[1000px]">
        <div className="relative w-40 h-52 transform-style-3d rotate-y-12 rotate-x-12">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 to-emerald-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-2xl"
                    style={{
                        transform: `translateZ(${i * 25}px) translateY(${i * -12}px) translateX(${i * 8}px)`,
                        zIndex: 3 - i,
                        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)'
                    }}
                    whileHover={{
                        translateZ: i * 50 + 30,
                        translateY: i * -25,
                        translateX: i * 15,
                        rotateZ: i * 5
                    }}
                    transition={SPRING_ELASTIC}
                >
                    {i === 2 && (
                        <div className="text-center">
                            <span className="block text-4xl font-bold text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">2024</span>
                            <span className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase mt-1">Wrapped</span>
                        </div>
                    )}
                    {i !== 2 && <div className="w-full h-full bg-emerald-500/5 rounded-2xl" />}
                </motion.div>
            ))}
        </div>
    </div>
)


// --- HELPER: Icon Container ---
const IconContainer = ({ color, children }: { color: string, children: React.ReactNode }) => (
    <div
        className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 relative overflow-hidden group-hover:scale-110 mb-2"
        style={{
            backgroundColor: `${color}05`, // 5% opacity
            borderColor: `${color}15`,
            boxShadow: `0 0 20px ${color}05`
        }}
    >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: color }} />
        {/* Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
        <div className="relative z-10" style={{ color: color, filter: `drop-shadow(0 0 8px ${color}60)` }}>
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
            className={cn(`rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/5 group ${colSpan} ${className} shadow-2xl`)}
            glareColor={accentColor}
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 20px 40px -20px rgba(0,0,0,0.5)' }}
        >
            {/* Inner Darkening for contrast */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

            {/* Ambient Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 opacity-[0.15] pointer-events-none blur-[80px]" style={{ background: accentColor }} />

            <div className="relative h-full flex flex-col p-8 z-10">
                {/* Header */}
                <div className="flex flex-col items-start mb-6">
                    <IconContainer color={accentColor!}>
                        {icon}
                    </IconContainer>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform duration-300">{title}</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-[90%] font-light">{description}</p>
                    </div>
                </div>

                {/* Visual */}
                <div className="relative mt-2 flex-1 min-h-[160px] w-full rounded-2xl border border-white/5 overflow-hidden bg-[#030014]/50">
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
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#030014] to-[#030014] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-24 max-w-2xl">
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
                        className="text-5xl md:text-6xl font-bold text-white mb-6 font-display leading-[1.1]"
                    >
                        Engineering Intelligence <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Reimagined.</span>
                    </motion.h2>
                </div>

                <ScrollTiltWrapper>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[420px]"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {/* LIVE ANALYTICS - Double Width */}
                        <PremiumBentoCard
                            title="Live Analytics"
                            description="Real-time velocity and impact tracking."
                            icon={<BarChart2 size={24} />}
                            accentColor="#22d3ee" // Cyan
                            colSpan="md:col-span-2"
                        >
                            <AnalyticsStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Neural Engine"
                            description="AI pattern recognition."
                            icon={<Brain size={24} />}
                            accentColor="#a855f7" // Purple
                        >
                            <NeuralStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Vitality Score"
                            description="Burnout prevention."
                            icon={<Activity size={24} />}
                            accentColor="#f97316" // Orange
                        >
                            <VitalityStory />
                        </PremiumBentoCard>

                        {/* GLOBAL MESH - Double Width */}
                        <PremiumBentoCard
                            title="Global Mesh"
                            description="Elite network connectivity."
                            icon={<Globe size={24} />}
                            accentColor="#6366f1" // Indigo
                            colSpan="md:col-span-2"
                        >
                            <ConstellationStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Mastery"
                            description="Gamified progression."
                            icon={<Trophy size={24} />}
                            accentColor="#eab308" // Yellow
                        >
                            <MasteryStory />
                        </PremiumBentoCard>

                        <PremiumBentoCard
                            title="Time Travel"
                            description="Yearly evolution."
                            icon={<Layers size={24} />}
                            accentColor="#10b981" // Emerald
                        >
                            <RecapStory />
                        </PremiumBentoCard>
                    </motion.div>
                </ScrollTiltWrapper>
            </div>
        </section>
    )
}
