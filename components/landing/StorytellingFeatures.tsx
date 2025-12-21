'use client'

import { motion, useInView } from 'framer-motion'
import { BarChart3, Brain, Flame, Trophy, Share2, Users, Command, Star, Activity, Layers, Globe } from 'lucide-react'
import { useRef } from 'react'

// --- Config ---
const riveEasing = [0.6, 0.01, 0.05, 0.95]

// --- Stagger Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
}

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 60,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: riveEasing
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
    glowColor?: string
}

const PremiumBentoCard = ({ title, description, icon, children, className = '', glowColor = 'purple' }: BentoCardProps) => {
    const glowColors: Record<string, string> = {
        cyan: 'from-cyan-500/20 via-cyan-400/10 to-cyan-500/20',
        purple: 'from-purple-500/20 via-fuchsia-400/10 to-purple-500/20',
        orange: 'from-orange-500/20 via-amber-400/10 to-orange-500/20',
        yellow: 'from-yellow-500/20 via-amber-400/10 to-yellow-500/20',
        green: 'from-emerald-500/20 via-green-400/10 to-emerald-500/20',
        indigo: 'from-indigo-500/20 via-violet-400/10 to-indigo-500/20'
    }

    return (
        <motion.div
            variants={cardVariants}
            className={`group relative h-full ${className}`}
        >
            {/* Animated Gradient Border - Subtler now */}
            <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[1px]">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${glowColors[glowColor]} animate-gradient-x`} />
            </div>

            {/* Main Card */}
            <div className="relative h-full rounded-2xl border border-white/[0.06] bg-zinc-900/20 backdrop-blur-sm overflow-hidden transition-all duration-500 group-hover:border-white/10 group-hover:bg-zinc-900/30">

                {/* Content Layer */}
                <div className="relative z-10 p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/70 group-hover:border-white/15 group-hover:text-white transition-colors duration-300">
                            {icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display font-medium text-white text-base tracking-wide">{title}</h3>
                            <p className="text-zinc-500 text-sm mt-1 leading-relaxed">{description}</p>
                        </div>
                    </div>

                    {/* Visual Area */}
                    <div className="relative flex-1 min-h-0">
                        {children}
                    </div>
                </div>

                {/* Subtle sheen on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
                </div>
            </div>
        </motion.div>
    )
}

// --- 1. LIVE ANALYTICS ---
const AnalyticsStory = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-end overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-[linear-gradient(to_right,rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-50" />

        <motion.div
            className="absolute top-0 bottom-0 w-[1px] bg-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.4)] z-20"
            style={{ left: '50%' }}
            animate={{ x: [-120, 120] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
        >
            <div className="absolute top-0 bottom-0 left-[-20px] w-[40px] bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent" />
        </motion.div>

        {[...Array(6)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-200 rounded-full"
                style={{ bottom: 30 + Math.random() * 120, left: `${10 + Math.random() * 80}%` }}
                animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.2, 0]
                }}
                transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: riveEasing
                }}
            />
        ))}

        <div className="w-full h-[140px] relative z-10">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <motion.path
                    d="M0 50 L0 30 C 20 20, 30 40, 50 25 C 70 10, 80 35, 100 20 L 100 50 Z"
                    fill="url(#cyan-grad)"
                    animate={{
                        d: [
                            "M0 50 L0 30 C 20 20, 30 40, 50 25 C 70 10, 80 35, 100 20 L 100 50 Z",
                            "M0 50 L0 40 C 20 45, 30 20, 50 35 C 70 40, 80 15, 100 30 L 100 50 Z",
                            "M0 50 L0 22 C 20 12, 30 38, 50 18 C 70 2, 80 28, 100 12 L 100 50 Z",
                            "M0 50 L0 30 C 20 20, 30 40, 50 25 C 70 10, 80 35, 100 20 L 100 50 Z"
                        ]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.path
                    d="M0 30 C 20 20, 30 40, 50 25 C 70 10, 80 35, 100 20"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    animate={{
                        d: [
                            "M0 30 C 20 20, 30 40, 50 25 C 70 10, 80 35, 100 20",
                            "M0 40 C 20 45, 30 20, 50 35 C 70 40, 80 15, 100 30",
                            "M0 22 C 20 12, 30 38, 50 18 C 70 2, 80 28, 100 12",
                            "M0 30 C 20 20, 30 40, 50 25 C 70 10, 80 35, 100 20"
                        ]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
            </svg>
        </div>
    </div>
)

// --- 2. NEURAL ENGINE ---
const AIStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full opacity-10">
            {[0, 1, 2].map(i => (
                <motion.line
                    key={i}
                    x1="50%" y1="50%"
                    x2={50 + Math.cos(i * 2.09) * 35 + "%"}
                    y2={50 + Math.sin(i * 2.09) * 35 + "%"}
                    stroke="#a855f7"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            ))}
        </svg>

        <div className="relative">
            {[0, 1].map(i => (
                <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-purple-500/20"
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: riveEasing }}
                />
            ))}

            <motion.div
                className="relative w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center z-10 shadow-2xl"
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                <Brain className="w-6 h-6 text-purple-400" />
            </motion.div>
        </div>
    </div>
)

// --- 3. VITALITY ---
const BurnoutStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-24 h-24 -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.04)" strokeWidth="4" fill="none" />
            <motion.circle
                cx="48" cy="48" r="40"
                stroke="url(#orange-grad)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="251"
                animate={{ strokeDashoffset: [251 * 0.2, 251 * 0.5, 251 * 0.1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
                <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
            </defs>
        </svg>

        <div className="absolute w-12 h-12 rounded-full bg-orange-950/20 overflow-hidden border border-orange-500/10">
            <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-600/60 to-orange-400/60"
                animate={{ height: ["35%", "70%", "40%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    </div>
)

// --- 4. MASTERY ---
const AchievementsStory = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <motion.div
                animate={{ y: [-3, 3] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-800/20 to-amber-900/20 p-[1px] border border-yellow-500/20">
                    <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-yellow-500/80" />
                    </div>
                </div>
            </motion.div>

            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    animate={{
                        y: [0, -40],
                        x: [(i - 1) * 20, (i - 1) * 30],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "circOut" }}
                >
                    <Star className="w-2 h-2 text-yellow-300" />
                </motion.div>
            ))}
        </motion.div>
    </div>
)

// --- 5. RECAP ---
const YearInReviewStory = () => {
    const cards = [
        { bg: 'bg-emerald-900/60', text: '2024', border: 'border-emerald-500/20' },
        { bg: 'bg-green-900/60', text: 'Top 1%', border: 'border-green-500/20' },
        { bg: 'bg-emerald-950/80', text: 'Legend', border: 'border-emerald-400/20' }
    ]

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-32">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        className={`absolute inset-0 rounded-lg ${card.bg} ${card.border} shadow-lg border flex items-center justify-center backdrop-blur-md`}
                        style={{ zIndex: (cards.length - i) * 10 }}
                        animate={{
                            rotate: [(i - 1) * 6, (i - 1) * 6 - 3, (i - 1) * 6],
                            y: [0, -4, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                    >
                        <span className="text-white/90 font-display font-medium text-sm">{card.text}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// --- 6. GLOBAL CONSTELLATION ---
const TeamInsightsStory = () => (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
            className="absolute w-[360px] h-[360px] rounded-full border border-indigo-500/5 border-dashed"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
            className="absolute w-[240px] h-[240px] rounded-full border border-violet-500/5"
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        {[0, 1, 2, 3, 4, 5].map(i => {
            const angle = (i / 6) * Math.PI * 2
            const rx = 100, ry = 40
            return (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10"
                    animate={{
                        x: [Math.cos(angle) * rx, Math.cos(angle + Math.PI) * rx, Math.cos(angle + Math.PI * 2) * rx],
                        y: [Math.sin(angle) * ry, Math.sin(angle + Math.PI) * ry, Math.sin(angle + Math.PI * 2) * ry],
                        opacity: [0.8, 0.3, 0.8]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
            )
        })}

        <motion.div
            className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
        />
    </div>
)

// --- MAIN EXPORT ---

export function StorytellingFeatures() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section id="features" className="py-32 relative overflow-hidden bg-black">

            {/* Removed noisy background blobs for 10/10 polish */}

            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: riveEasing }}
                    className="text-center max-w-4xl mx-auto mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-zinc-400 mb-8 uppercase tracking-widest backdrop-blur-md">
                        <Command className="w-3 h-3" /> System Capabilities
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold mb-6 tracking-tight text-white leading-[1.1]">
                        Precision tools for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500">quantum velocity.</span>
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-light">
                        Developer analytics reimagined. Track, optimize, and celebrate your coding journey.
                    </p>
                </motion.div>

                {/* 
                    PERFECT BENTO GRID LAYOUT
                */}
                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {/* 1. HERO: Analytics (2 cols x 2 rows) */}
                    <div className="md:col-span-2 md:row-span-2 min-h-[300px] lg:min-h-[580px]">
                        <PremiumBentoCard
                            title="Live Analytics"
                            description="Real-time velocity metrics and continuous data streams."
                            icon={<Activity className="w-5 h-5" />}
                            glowColor="cyan"
                        >
                            <AnalyticsStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 2. Neural Engine (1 col x 1 row) - Top Right */}
                    <div className="min-h-[280px]">
                        <PremiumBentoCard
                            title="Neural Engine"
                            description="AI optimization & code review."
                            icon={<Brain className="w-5 h-5" />}
                            glowColor="purple"
                        >
                            <AIStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 3. Vitality (1 col x 1 row) - Top Right */}
                    <div className="min-h-[280px]">
                        <PremiumBentoCard
                            title="Vitality"
                            description="Energy & wellness tracking."
                            icon={<Flame className="w-5 h-5" />}
                            glowColor="orange"
                        >
                            <BurnoutStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 4. Mastery (1 col x 1 row) - Bottom Right */}
                    <div className="min-h-[280px]">
                        <PremiumBentoCard
                            title="Mastery"
                            description="Unlock achievements."
                            icon={<Trophy className="w-5 h-5" />}
                            glowColor="yellow"
                        >
                            <AchievementsStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 5. Recap (1 col x 1 row) - Bottom Right */}
                    <div className="min-h-[280px]">
                        <PremiumBentoCard
                            title="Recap"
                            description="Year-end summaries."
                            icon={<Layers className="w-5 h-5" />}
                            glowColor="green"
                        >
                            <YearInReviewStory />
                        </PremiumBentoCard>
                    </div>

                    {/* 6. Global Constellation (4 cols x 1 row) - Full Width Footer */}
                    <div className="md:col-span-2 lg:col-span-4 min-h-[320px]">
                        <PremiumBentoCard
                            title="Global Constellation"
                            description="Visualize team collaboration patterns across the globe."
                            icon={<Globe className="w-5 h-5" />}
                            glowColor="indigo"
                        >
                            <TeamInsightsStory />
                        </PremiumBentoCard>
                    </div>

                </motion.div>
            </div>
        </section>
    )
}
