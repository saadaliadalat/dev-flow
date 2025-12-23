'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarFieldBackground } from '@/components/landing/StarFieldBackground'
import { ChevronRight } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen relative flex items-center justify-center bg-black overflow-hidden">
            <StarFieldBackground />

            <div className="relative z-10 px-6">
                <GlassCard className="max-w-md text-center p-12" glow="purple">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-9xl font-bold text-white mb-2 opacity-10">404</h1>
                        <h2 className="text-3xl font-display font-bold text-white mb-4">Lost in Space?</h2>
                        <p className="text-zinc-400 mb-8">
                            The signal you're looking for seems to have drifted into the void.
                        </p>

                        <Link href="/">
                            <button className="px-6 py-3 rounded-full bg-white text-black font-semibold flex items-center gap-2 mx-auto hover:scale-105 transition-transform">
                                Return to Base <ChevronRight size={16} />
                            </button>
                        </Link>
                    </motion.div>
                </GlassCard>
            </div>
        </div>
    )
}
