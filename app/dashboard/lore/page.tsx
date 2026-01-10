'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'
import { EternalFlame } from '@/components/lore/EternalFlame'
import { ShadowSelf } from '@/components/lore/ShadowSelf'
import { WhisperCard } from '@/components/lore/WhisperCard'
import { SoulVelocityGauge } from '@/components/lore/SoulVelocity'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
}

export default function LoreProfilePage() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                    <Sparkles className="text-violet-500" />
                    Your LORE
                </h1>
                <p className="text-zinc-500 mt-2 max-w-xl">
                    The story your code tells about who you're becoming.
                    Not just metrics — mythology.
                </p>
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Eternal Flame + Soul Velocity */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <AliveCard className="p-6" glass>
                        <h2 className="font-heading font-semibold text-white mb-4">
                            Eternal Flame
                        </h2>
                        <EternalFlame />
                    </AliveCard>

                    <AliveCard className="p-6" glass>
                        <h2 className="font-heading font-semibold text-white mb-4">
                            Soul Velocity
                        </h2>
                        <SoulVelocityGauge depth={65} learning={78} risk={42} />
                    </AliveCard>
                </motion.div>

                {/* Center Column - Shadow Self */}
                <motion.div variants={itemVariants}>
                    <ShadowSelf className="h-full" />
                </motion.div>

                {/* Right Column - Whispers */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="font-heading font-semibold text-zinc-400 text-sm uppercase tracking-wider">
                        Whispers from the Network
                    </h2>
                    <WhisperCard />
                    <WhisperCard />
                    <WhisperCard />
                </motion.div>
            </div>

            {/* Bottom Quote */}
            <motion.div
                variants={itemVariants}
                className="text-center pt-8 border-t border-white/5"
            >
                <p className="text-sm text-zinc-600 italic max-w-md mx-auto">
                    "Code isn't just work — it's your life's artifact.
                    We make the artifact speak back to you with beauty, story, wisdom, and friendly rivalry."
                </p>
                <p className="text-xs text-zinc-700 mt-2">— LORE</p>
            </motion.div>
        </motion.div>
    )
}
