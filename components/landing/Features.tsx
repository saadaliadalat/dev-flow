'use client'

import { motion } from 'framer-motion'
import { BentoCard } from '@/components/ui/BentoCard'
import { BarChart3, Brain, Flame, Trophy, Share2, Users } from 'lucide-react'
import { containerVariants, itemVariants } from '@/lib/animations'

// Animated chart visualization
function ChartVisual() {
    const bars = [40, 70, 45, 90, 65, 85, 100]

    return (
        <div className="w-full h-full flex items-end gap-1.5 p-4 pb-0">
            {bars.map((h, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0, opacity: 0 }}
                    whileInView={{ height: `${h}%`, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: [0.25, 1, 0.5, 1],
                    }}
                    className="flex-1 bg-gradient-to-t from-purple-500/60 via-purple-500/30 to-transparent rounded-t"
                />
            ))}
        </div>
    )
}

// Pulsing AI indicator
function AIVisual() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/30 to-purple-600/20 blur-xl"
            />
        </div>
    )
}

export function Features() {
    return (
        <section id="features" className="py-32 relative overflow-hidden bg-bg-deepest">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-radial-purple opacity-20" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <motion.span
                        variants={itemVariants}
                        className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6"
                    >
                        Features
                    </motion.span>

                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6 tracking-tight"
                    >
                        Everything You Need to{' '}
                        <span className="text-gradient-purple">Level Up</span>
                    </motion.h2>

                    <motion.p
                        variants={itemVariants}
                        className="text-zinc-400 text-lg md:text-xl leading-relaxed"
                    >
                        From deep productivity insights to viral social sharing cards,
                        DevFlow gives you the tools to master your craft.
                    </motion.p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(260px,auto)]">
                    {/* Main Card: Productivity */}
                    <BentoCard
                        title="Real-Time Analytics"
                        description="Track commits, PRs, issues, and productivity patterns with stunning visualizations that update as you code."
                        icon={<BarChart3 className="w-5 h-5" />}
                        size="medium"
                        gradient="purple"
                        index={0}
                    >
                        <ChartVisual />
                    </BentoCard>

                    {/* AI Insights */}
                    <BentoCard
                        title="AI-Powered Insights"
                        description="Get personalized recommendations from our GPT-4 powered coding coach."
                        icon={<Brain className="w-5 h-5" />}
                        size="small"
                        gradient="purple"
                        index={1}
                    >
                        <AIVisual />
                    </BentoCard>

                    {/* Burnout Detection */}
                    <BentoCard
                        title="Burnout Prevention"
                        description="Early warning algorithms detect when you're pushing too hard and need rest."
                        icon={<Flame className="w-5 h-5" />}
                        size="small"
                        gradient="subtle"
                        index={2}
                    />

                    {/* Achievements */}
                    <BentoCard
                        title="Unlock Achievements"
                        description="Gamify your coding journey with 15+ unique badges and milestone celebrations."
                        icon={<Trophy className="w-5 h-5" />}
                        size="small"
                        gradient="purple"
                        index={3}
                    />

                    {/* Year in Review */}
                    <BentoCard
                        title="Year in Review"
                        description="Generate beautiful, shareable cards that summarize your entire year of coding. Perfect for social."
                        icon={<Share2 className="w-5 h-5" />}
                        size="medium"
                        gradient="purple"
                        index={4}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent skew-y-3 scale-110" />
                    </BentoCard>

                    {/* Teams */}
                    <BentoCard
                        title="Team Insights"
                        description="Understand team dynamics, collaboration patterns, and identify bottlenecks before they impact velocity."
                        icon={<Users className="w-5 h-5" />}
                        size="large"
                        gradient="silver"
                        index={5}
                    />
                </div>
            </div>
        </section>
    )
}
