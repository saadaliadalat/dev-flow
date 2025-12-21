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

// --- 1. LIVE ANALYTICS (Velocity Histogram) ---
const AnalyticsStory = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-end p-6 pb-0">
        <div className="w-full h-full flex items-end justify-between gap-1">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="relative w-full bg-cyan-500/10 rounded-t-sm overflow-hidden"
                    initial={{ height: "10%" }}
                    animate={{
                        height: [
                            `${20 + Math.random() * 60}%`,
                            `${30 + Math.random() * 50}%`,
                            `${20 + Math.random() * 60}%`
                        ]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                >
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-cyan-400"
                        style={{ height: '4px' }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            ))}
        </div>

        {/* Scanning Line */}
        <motion.div
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20 pointer-events-none"
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
            <div className="absolute top-0 bottom-0 left-[-20px] w-[40px] bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
        </motion.div>
    </div>
)

// --- 2. NEURAL ENGINE (Code Stream) ---
const AIStory = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-black/20">
        {[0, 1, 2, 3].map(i => (
            <motion.div
                key={i}
                className="w-[120%] h-3 my-1.5 flex items-center gap-2 opacity-40"
                initial={{ x: -20 }}
                animate={{ x: -100 }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
            >
                <div className="w-16 h-1 bg-purple-500/30 rounded-full" />
                <div className="w-8 h-1 bg-purple-500/20 rounded-full" />
                <div className="w-24 h-1 bg-purple-500/30 rounded-full" />
                <div className="w-12 h-1 bg-purple-500/20 rounded-full" />
            </motion.div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
                className="w-14 h-14 bg-black/80 backdrop-blur-xl border border-purple-500/40 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] z-10"
                animate={{ boxShadow: ["0 0 30px rgba(168,85,247,0.3)", "0 0 50px rgba(168,85,247,0.6)", "0 0 30px rgba(168,85,247,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Brain className="w-7 h-7 text-purple-400" />
            </motion.div>
        </div>

        {/* Scanned Lines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-pulse pointer-events-none" />
    </div>
)

// --- 3. VITALITY (Resource Monitor) ---
const BurnoutStory = () => (
    <div className="absolute inset-0 flex items-center justify-center gap-4">
        {/* Ring 1 */}
        <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                <motion.circle
                    cx="40" cy="40" r="36"
                    stroke="#f97316"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="226"
                    initial={{ strokeDashoffset: 226 }}
                    animate={{ strokeDashoffset: [226 * 0.3, 226 * 0.1, 226 * 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[10px] text-orange-400 font-mono uppercase">Energy</span>
                <span className="text-sm font-bold text-white">92%</span>
            </div>
        </div>
    </div>
)

// --- 4. MASTERY (Toast) ---
const AchievementsStory = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <motion.div
            className="w-full bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-3 flex items-center gap-3 relative overflow-hidden backdrop-blur-sm"
            initial={{ y: 0 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="h-2 w-16 bg-yellow-500/20 rounded mb-1.5" />
                <div className="h-1.5 w-24 bg-yellow-500/10 rounded" />
            </div>

            {/* Sparkles */}
            <motion.div
                className="absolute top-2 right-2"
                animate={{ rotate: [0, 180], scale: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
            </motion.div>
        </motion.div>
    </div>
)

// --- 5. RECAP (Cards Shuffle) ---
const YearInReviewStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center perspective-1000">
            <div className="relative w-24 h-32">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-lg border border-emerald-500/20 bg-emerald-900/80 backdrop-blur-md flex items-center justify-center"
                        style={{ zIndex: i }}
                        animate={{
                            y: [0, -5 * (i + 1), 0],
                            rotate: [i * 2, i * -2, i * 2],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                    >
                        <div className="w-12 h-1 bg-emerald-500/30 rounded-full" />
                    </motion.div>
                ))}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="text-2xl font-bold text-white drop-shadow-md">2024</span>
                </div>
            </div>
        </div>
    )
}

// --- 6. GLOBAL CONSTELLATION (Network Map) ---
const TeamInsightsStory = () => (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Central Hub */}
        <motion.div
            className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] z-20 relative"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75" />
        </motion.div>

        {/* Nodes and Links */}
        {[0, 1, 2, 3, 4].map(i => {
            const angle = (i / 5) * Math.PI * 2
            const dist = 100
            return (
                <div key={i} className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        className="absolute w-2 h-2 bg-indigo-400 rounded-full"
                        style={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute h-[1px] bg-indigo-500/30 origin-left"
                        style={{ width: dist, rotate: `${angle}rad` }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                    />
                </div>
            )
        })}
    </div>
)

// --- MAIN EXPORT ---

export function StorytellingFeatures() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section id="features" className="py-32 relative overflow-hidden bg-black">


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
