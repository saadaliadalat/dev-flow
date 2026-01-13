'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { AliveCard } from '@/components/ui/AliveCard'
import { EternalFlame } from '@/components/lore/EternalFlame'
import { ShadowSelf } from '@/components/lore/ShadowSelf'
import { BurnoutOracle } from '@/components/lore/BurnoutOracle'
import { SoulVelocityGauge } from '@/components/lore/SoulVelocity'
import { JourneyNarrative } from '@/components/lore/JourneyNarrative'

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

// Soul Velocity wrapper that fetches real data
function SoulVelocityWithData() {
    const [data, setData] = useState<{
        depth: number
        learning: number
        risk: number
        combined?: number
        history?: number[]
        streak?: number
        recencyWeight?: number
        message?: string
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch('/api/user/soul-velocity', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                if (json) setData(json)
            })
            .catch(() => { })
            .finally(() => setIsLoading(false))
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
        )
    }

    // Fallback to neutral values if no data
    const metrics = data || { depth: 50, learning: 50, risk: 50 }
    return (
        <SoulVelocityGauge
            depth={metrics.depth}
            learning={metrics.learning}
            risk={metrics.risk}
            combined={metrics.combined}
            history={metrics.history}
            streak={metrics.streak}
            recencyWeight={metrics.recencyWeight}
        />
    )
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

            {/* Journey Narrative - LLM Generated */}
            <motion.div variants={itemVariants}>
                <JourneyNarrative />
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Eternal Flame + Soul Velocity */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <AliveCard className="p-6 flex flex-col items-center justify-center min-h-[280px]" glass>
                        <EternalFlame />
                    </AliveCard>

                    <AliveCard className="p-6" glass>
                        <h2 className="font-heading font-semibold text-white mb-4 text-center">
                            Soul Velocity
                        </h2>
                        <SoulVelocityWithData />
                    </AliveCard>
                </motion.div>

                {/* Center Column - Shadow Self */}
                <motion.div variants={itemVariants}>
                    <ShadowSelf className="h-full" />
                </motion.div>

                {/* Right Column - Burnout Oracle */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <h2 className="font-heading font-semibold text-zinc-400 text-sm uppercase tracking-wider">
                        Burnout Oracle
                    </h2>
                    <BurnoutOracle />
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

