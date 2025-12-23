'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-bg-deepest flex items-center justify-center p-6 bg-noise">
            <GlassCard className="max-w-md w-full p-8 text-center" glow="cyan">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">System Critical</h2>
                    <p className="text-zinc-400 mb-8">
                        An unexpected error occurred in the DevFlow analytical engine.
                    </p>

                    <div className="bg-black/40 p-4 rounded-xl mb-8 text-left border border-white/5 font-mono text-xs text-red-400 overflow-auto max-h-32">
                        {error.message || "Unknown system error"}
                    </div>

                    <button
                        onClick={reset}
                        className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={16} />
                        Reboot System
                    </button>
                </motion.div>
            </GlassCard>
        </div>
    )
}
