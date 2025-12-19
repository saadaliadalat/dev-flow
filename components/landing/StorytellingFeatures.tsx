'use client'

import { motion, useAnimation } from 'framer-motion'
import { BentoCard } from '@/components/ui/BentoCard'
import { BarChart3, Brain, Flame, Trophy, Share2, Users, Zap, Activity } from 'lucide-react'
import { containerVariants, itemVariants } from '@/lib/animations'
import { useEffect, useState } from 'react'

// --- Rive-Style Motion Components ---

const AnalyticsStory = () => {
    // Smooth Bezier Curve Animation
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" as const }
        }
    }

    return (
        <div className="absolute inset-0 flex flex-col justify-end p-6 overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

            {/* Floating Tooltip */}
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -20, 0] }}
                transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
                className="absolute top-1/2 left-1/4 z-10"
            >
                <div className="bg-bg-deep border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono text-cyan-100">Velocity: 94.2</span>
                </div>
                {/* Connecting Line */}
                <div className="w-px h-8 bg-cyan-500/50 mx-auto" />
                <div className="w-2 h-2 bg-cyan-500 rounded-full mx-auto shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </motion.div>

            {/* SVG Chart */}
            <svg className="w-full h-32 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area */}
                <motion.path
                    d="M0 50 L0 30 C 20 20, 40 40, 60 10 C 80 -10, 90 20, 100 30 L 100 50 Z"
                    fill="url(#chartGradient)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                />

                {/* Line */}
                <motion.path
                    d="M0 30 C 20 20, 40 40, 60 10 C 80 -10, 90 20, 100 30"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1"
                    variants={pathVariants}
                    initial="hidden"
                    whileInView="visible"
                />
            </svg>
        </div>
    )
}

const AIStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Spinning Rings */}
            {[1, 2, 3].map((ring, i) => (
                <motion.div
                    key={i}
                    className="absolute border border-purple-500/30 rounded-full"
                    style={{ width: ring * 60, height: ring * 40 }}
                    animate={{ rotate: 360, scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{
                        rotate: { duration: 10 + i * 5, ease: "linear", repeat: Infinity },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i }
                    }}
                />
            ))}

            {/* Central Core */}
            <div className="relative">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.6)] z-10 relative overflow-hidden"
                >
                    <Brain className="w-8 h-8 text-white relative z-10" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                    {/* Scan effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"
                        animate={{ y: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </motion.div>

                {/* Orbiting Particles */}
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                        animate={{
                            x: Math.cos(i * Math.PI / 2) * 50,
                            y: Math.sin(i * Math.PI / 2) * 50,
                            scale: [0, 1, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

const BurnoutStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Liquid Fill Effect */}
            <div className="w-32 h-32 rounded-full border-4 border-orange-500/20 relative overflow-hidden bg-bg-deep">
                <motion.div
                    className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-orange-600 to-orange-400 opacity-80"
                    animate={{ height: ["30%", "60%", "45%", "80%", "30%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Waves */}
                <motion.div
                    className="absolute bottom-0 inset-x-0 h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Wave_sine_animation.svg/1024px-Wave_sine_animation.svg.png')] bg-repeat-x opacity-30"
                    style={{ backgroundSize: "200% 100%" }}
                    animate={{ backgroundPositionX: ["0%", "100%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                    >
                        <Flame className="w-8 h-8 text-white drop-shadow-lg" />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

const AchievementsStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center perspective-[1000px]">
            <motion.div
                className="relative w-full h-full flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
                whileHover={{ rotateX: 15, rotateY: 15 }}
            >
                {/* 3D Floating Badge Layers */}
                <motion.div
                    className="absolute w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-[0_10px_30px_rgba(234,179,8,0.4)] flex items-center justify-center z-10"
                    animate={{ y: [0, -10, 0], rotateZ: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Trophy className="w-10 h-10 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-xl pointer-events-none" />
                </motion.div>

                {/* Layer 2 */}
                <motion.div
                    className="absolute w-20 h-20 bg-yellow-600/50 rounded-xl z-0 blur-sm"
                    animate={{ y: [0, -15, 0], rotateZ: [0, -5, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                />

                {/* Unlock Particles */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            y: -60 - Math.random() * 40,
                            x: (Math.random() - 0.5) * 60
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </motion.div>
        </div>
    )
}

const YearInReviewStory = () => {
    const cards = [
        { color: "bg-green-500", rotate: 5, z: 10 },
        { color: "bg-green-600", rotate: 0, z: 5 },
        { color: "bg-green-700", rotate: -5, z: 0 }
    ];

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-32 h-40">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        className={`absolute inset-0 rounded-xl ${card.color} shadow-lg border border-white/10 flex flex-col justify-between p-3`}
                        style={{ zIndex: card.z }}
                        initial={{ rotate: card.rotate, y: 0 }}
                        whileHover={{
                            rotate: i === 0 ? 15 : (i === 1 ? 0 : -15),
                            x: i === 0 ? 30 : (i === 1 ? 0 : -30),
                            scale: 1.05
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {/* Card Content Skeleton */}
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-16 bg-white/20 rounded-full" />
                            <div className="h-2 w-10 bg-white/10 rounded-full" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

const TeamInsightsStory = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* World/Map Dots */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-[400px] h-[400px] rounded-full border border-indigo-500/20 animate-[spin_60s_linear_infinite]" />
                <div className="absolute w-[300px] h-[300px] rounded-full border border-dashed border-indigo-500/20 animate-[spin_40s_linear_infinite_reverse]" />
            </div>

            {/* Connecting Nodes */}
            <div className="relative w-64 h-32">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute w-10 h-10 rounded-full bg-bg-elevated border border-indigo-500 flex items-center justify-center shadow-lg hover:z-20 hover:scale-110 transition-transform"
                        style={{
                            left: i === 0 ? '10%' : i === 1 ? '50%' : '90%',
                            top: i === 1 ? '10%' : '60%',
                            transform: 'translate(-50%, -50%)'
                        }}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: i * 0.2 }}
                    >
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=devflow${i}`} alt="user" className="w-8 h-8 rounded-full" />

                        {/* Connection Beam */}
                        {i < 2 && (
                            <svg className="absolute top-1/2 left-1/2 w-[200px] h-20 -z-10 overflow-visible pointer-events-none">
                                <motion.path
                                    d={i === 0 ? "M 0 0 Q 50 -20 100 0" : "M 0 0 Q 50 20 100 50"}
                                    fill="none"
                                    stroke="#6366f1"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </svg>
                        )}
                    </motion.div>
                ))}

                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 px-3 py-1 rounded-full text-xs text-white shadow-lg z-10 whitespace-nowrap"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    Collision Detected 🚀
                </motion.div>
            </div>
        </div>
    )
}

// --- Main Layout ---

export function StorytellingFeatures() {
    return (
        <section id="features" className="py-32 relative overflow-hidden bg-bg-deepest">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="text-center max-w-4xl mx-auto mb-20"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300 mb-6">
                        <Zap className="w-3 h-3" /> FEATURES 2.0
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight text-white">
                        Every tool you need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient-x">master your workflow.</span>
                    </motion.h2>
                </motion.div>

                {/* Perfect Bento Layout */}
                <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6 h-auto md:h-[600px]">

                    {/* 1. Real-Time Analytics (Large Square - 2x2) */}
                    <div className="md:col-span-2 md:row-span-2">
                        <BentoCard
                            title="Real-Time Analytics"
                            description="Visualize your coding velocity with millisecond precision."
                            icon={<BarChart3 />}
                            size="large"
                            gradient="from-cyan-600 to-blue-600"
                            className="h-full"
                        >
                            <AnalyticsStory />
                        </BentoCard>
                    </div>

                    {/* 2. AI Insights (Wide Rectangle - 2x1) */}
                    <div className="md:col-span-2 md:row-span-1">
                        <BentoCard
                            title="Neural Architect"
                            description="AI-driven code review."
                            icon={<Brain />}
                            size="medium"
                            gradient="from-purple-600 to-pink-600"
                            className="h-full"
                        >
                            <AIStory />
                        </BentoCard>
                    </div>

                    {/* 3. Burnout (Small Square - 1x1) */}
                    <div className="md:col-span-1 md:row-span-1">
                        <BentoCard
                            title="Zen Mode"
                            description="Health monitoring."
                            icon={<Flame />}
                            size="small"
                            gradient="from-orange-500 to-red-500"
                            className="h-full"
                        >
                            <BurnoutStory />
                        </BentoCard>
                    </div>

                    {/* 4. Achievements (Small Square - 1x1) */}
                    <div className="md:col-span-1 md:row-span-1">
                        <BentoCard
                            title="Awards"
                            description="Unlock badges."
                            icon={<Trophy />}
                            size="small"
                            gradient="from-yellow-500 to-amber-500"
                            className="h-full"
                        >
                            <AchievementsStory />
                        </BentoCard>
                    </div>

                    {/* Row 2 Fills */}

                    {/* 5. Year in Review (Wide Rectangle - 2x1) - Under AI */}
                    <div className="md:col-span-2 md:row-span-1">
                        <BentoCard
                            title="Year Lookback"
                            description="Viral summary cards."
                            icon={<Share2 />}
                            size="medium"
                            gradient="from-green-500 to-emerald-500"
                            className="h-full"
                        >
                            <YearInReviewStory />
                        </BentoCard>
                    </div>

                    {/* 6. Team Insights (Wide Rectangle - 2x1) - Under Small Squares */}
                    <div className="md:col-span-2 md:row-span-1">
                        <BentoCard
                            title="Team Sync"
                            description="Collaboration graph."
                            icon={<Users />}
                            size="medium"
                            gradient="from-indigo-500 to-violet-500"
                            className="h-full"
                        >
                            <TeamInsightsStory />
                        </BentoCard>
                    </div>
                </div>
            </div>
        </section>
    )
}
