'use client'

import { motion } from 'framer-motion'
import { BentoCard } from '@/components/ui/BentoCard'
import { BarChart3, Brain, Flame, Trophy, Share2, Users } from 'lucide-react'
import { containerVariants, itemVariants } from '@/lib/animations'

export function Features() {
    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">

                {/* Section Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-display font-bold mb-6">
                        Everything You Need to <span className="text-gradient">Level Up</span>
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-text-tertiary text-lg">
                        From deep productivity insights to viral social sharing cards, DevFlow gives you the tools to master your craft and showcase your journey.
                    </motion.p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(240px,auto)]">

                    {/* Main Card: Productivity */}
                    <BentoCard
                        title="Real-Time Analytics"
                        description="Track commits, PRs, issues, and productivity patterns with stunning visualizations."
                        icon={<BarChart3 />}
                        size="medium"
                        gradient="from-cyan-500 to-blue-500"
                    >
                        {/* Abstract Chart Visual */}
                        <div className="w-full h-full flex items-end gap-2 p-4 pb-0 opacity-50">
                            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-gradient-to-t from-cyan-500/50 to-transparent rounded-t-sm" />
                            ))}
                        </div>
                    </BentoCard>

                    {/* AI Insights */}
                    <BentoCard
                        title="AI-Powered Insights"
                        description="Get personalized recommendations from our GPT-4 coding coach."
                        icon={<Brain />}
                        size="small"
                        gradient="from-purple-500 to-pink-500"
                    >
                        <div className="absolute top-1/2 right-4 text-6xl opacity-10 rotate-12">🤖</div>
                    </BentoCard>

                    {/* Burnout Detection */}
                    <BentoCard
                        title="Burnout Prevention"
                        description="Early warning algorithms detect when you're pushing too hard."
                        icon={<Flame />}
                        size="small"
                        gradient="from-orange-500 to-red-500"
                    />

                    {/* Achievements */}
                    <BentoCard
                        title="Unlock Achievements"
                        description="Gamify your coding journey with 15+ unique badges and milestones."
                        icon={<Trophy />}
                        size="small"
                        gradient="from-yellow-500 to-amber-500"
                    />

                    {/* Year in Review */}
                    <BentoCard
                        title="Year in Review"
                        description="Generate beautiful, shareable cards that summarize your entire year of coding. Viral ready."
                        icon={<Share2 />}
                        size="medium"
                        gradient="from-green-500 to-emerald-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent skew-y-3 scale-110 opacity-20" />
                    </BentoCard>

                    {/* Teams */}
                    <BentoCard
                        title="Team Insights"
                        description="Understand team dynamics and collaboration patterns."
                        icon={<Users />}
                        size="large"
                        gradient="from-indigo-500 to-violet-500"
                    />

                </div>
            </div>
        </section>
    )
}
