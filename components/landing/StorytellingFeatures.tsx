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
        cyan: 'from-cyan-500/50 via-cyan-400/30 to-cyan-500/50',
        purple: 'from-purple-500/50 via-fuchsia-400/30 to-purple-500/50',
        orange: 'from-orange-500/50 via-amber-400/30 to-orange-500/50',
        yellow: 'from-yellow-500/50 via-amber-400/30 to-yellow-500/50',
        green: 'from-emerald-500/50 via-green-400/30 to-emerald-500/50',
        indigo: 'from-indigo-500/50 via-violet-400/30 to-indigo-500/50'
    }

    return (
        <motion.div
            variants={cardVariants}
            className={`group relative h-full ${className}`}
        >
            {/* Animated Gradient Border */}
            <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${glowColors[glowColor]} animate-gradient-x`} />
            </div>

            {/* Outer Glow on Hover */}
            <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-r ${glowColors[glowColor]} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700`} />

            {/* Main Card */}
            <div className="relative h-full rounded-2xl border border-white/[0.08] bg-[#0a0612]/80 backdrop-blur-xl overflow-hidden transition-all duration-500 group-hover:border-white/20 group-hover:shadow-2xl group-hover:-translate-y-1">

                {/* Content Layer */}
                <div className="relative z-10 p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:border-white/20 transition-colors">
                            {icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display font-semibold text-white text-lg tracking-tight">{title}</h3>
                            <p className="text-white/40 text-sm mt-0.5 leading-relaxed">{description}</p>
                        </div>
                    </div>

                    {/* Visual Area */}
                    <div className="relative flex-1 min-h-0">
                        {children}
                    </div>
                </div>



                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-transparent" />
                </div>
            </div>
        </motion.div>
    )
}

// --- 1. LIVE ANALYTICS ---
const AnalyticsStory = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-end overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-[linear-gradient(to_right,rgba(6,182,212,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.08)_1px,transparent_1px)] bg-[size:32px_32px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-60" />

        <motion.div
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.6)] z-20"
            style={{ left: '50%' }}
            animate={{ x: [-120, 120] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
        >
            <div className="absolute top-0 bottom-0 left-[-30px] w-[60px] bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
        </motion.div>

        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_12px_rgba(34,211,238,1)]"
                style={{ bottom: 30 + Math.random() * 120, left: `${8 + Math.random() * 84}%` }}
                animate={{
                    scale: [0, 1.5, 0],
                    y: [0, -50],
                    opacity: [0, 1, 0]
                }}
                transition={{
                    duration: 2.5 + Math.random(),
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
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
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
                    strokeWidth="2"
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
        <svg className="absolute inset-0 w-full h-full opacity-20">
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
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-purple-500/40"
                    animate={{ scale: [1, 2.8], opacity: [0.8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: riveEasing }}
                />
            ))}

            <motion.div
                className="relative w-16 h-16 bg-[#09090b] border-2 border-zinc-500/60 rounded-2xl flex items-center justify-center z-10 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                <Brain className="w-8 h-8 text-purple-400" />
                <motion.div
                    className="absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
                />
            </motion.div>
        </div>
    </div>
)

// --- 3. VITALITY ---
const BurnoutStory = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-28 h-28 -rotate-90">
            <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
            <motion.circle
                cx="56" cy="56" r="48"
                stroke="url(#orange-grad)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="301"
                animate={{ strokeDashoffset: [301 * 0.2, 301 * 0.5, 301 * 0.1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
                <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
            </defs>
        </svg>

        <div className="absolute w-16 h-16 rounded-full bg-orange-950/40 overflow-hidden border border-orange-500/20">
            <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-600 to-orange-400"
                animate={{ height: ["35%", "70%", "40%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white/40 rounded-full w-1 h-1"
                    style={{ left: `${25 + i * 25}%` }}
                    animate={{ y: [-5, -60], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
                />
            ))}
        </div>
    </div>
)

// --- 4. MASTERY ---
const AchievementsStory = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div animate={{ opacity: [0, 0.1, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-yellow-500" />

        <motion.div className="relative" whileHover={{ scale: 1.1, rotateY: 15 }} transition={{ duration: 0.5 }}>
            <motion.div
                animate={{ y: [-4, 4] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 p-[2px] shadow-[0_0_60px_rgba(234,179,8,0.4)]">
                    <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center relative overflow-hidden border border-white/10">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent"
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                        />
                        <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-500/20" />
                    </div>
                </div>
            </motion.div>

            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    animate={{
                        y: [0, -50],
                        x: [(i - 1.5) * 15, (i - 1.5) * 35],
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "circOut" }}
                >
                    <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                </motion.div>
            ))}
        </motion.div>
    </div>
)

// --- 5. RECAP ---
const YearInReviewStory = () => {
    const cards = [
        { bg: 'bg-emerald-600', text: '2024' },
        { bg: 'bg-green-700', text: 'Top 1%' },
        { bg: 'bg-teal-700', text: 'Legend' }
    ]

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-28 h-36">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        className={`absolute inset-0 rounded-xl ${card.bg} shadow-xl border border-white/10 flex items-center justify-center`}
                        style={{ zIndex: (cards.length - i) * 10 }}
                        animate={{
                            rotate: [(i - 1) * 6, (i - 1) * 6 - 3, (i - 1) * 6],
                            y: [0, -6, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                    >
                        <span className="text-white font-display font-bold text-lg">{card.text}</span>
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
            className="absolute w-[400px] h-[400px] rounded-full border border-indigo-500/10 border-dashed"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
            className="absolute w-[280px] h-[280px] rounded-full border border-violet-500/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
            const angle = (i / 8) * Math.PI * 2
            const rx = 110, ry = 50
            return (
                <motion.div
                    key={i}
                    className="absolute w-7 h-7 bg-[#0c0618] border border-indigo-400/60 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.4)] z-10"
                    animate={{
                        x: [Math.cos(angle) * rx, Math.cos(angle + Math.PI) * rx, Math.cos(angle + Math.PI * 2) * rx],
                        y: [Math.sin(angle) * ry, Math.sin(angle + Math.PI) * ry, Math.sin(angle + Math.PI * 2) * ry],
                        scale: [1, 0.7, 1],
                        opacity: [1, 0.5, 1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                    <Users className="w-3 h-3 text-indigo-300" />
                </motion.div>
            )
        })}

        <motion.div
            className="w-3 h-3 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,1)]"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
        />
    </div>
)

// --- MAIN EXPORT ---

export function StorytellingFeatures() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section id="features" className="py-32 relative overflow-hidden bg-[#0a0612]">


            {/* Ambient Background Glows */}
            <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: riveEasing }}
                    className="text-center max-w-4xl mx-auto mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/5 border border-purple-500/10 text-[11px] font-mono text-purple-300 mb-8 uppercase tracking-widest">
                        <Command className="w-3 h-3" /> System Capabilities
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight text-white leading-[1.05]">
                        Precision tools for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">quantum velocity.</span>
                    </h2>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto">
                        Developer analytics reimagined. Track, optimize, and celebrate your coding journey.
                    </p>
                </motion.div>

                {/* 
                    PERFECT BENTO GRID LAYOUT
                    ┌─────────────┬───────┬───────┐
                    │             │   2   │   3   │
                    │      1      ├───────┼───────┤
                    │   (HERO)    │   4   │   5   │
                    ├─────────────┴───────┴───────┤
                    │             6                │
                    └──────────────────────────────┘
                    4 columns, Hero=2x2, Supporting=1x1, Footer=4x1
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
