'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, RefreshCw } from 'lucide-react'
import { SPRINGS } from '@/lib/motion'

interface WhisperData {
    whisper: string
    sender: { name: string; years: string }
    category: string
}

interface WhisperCardProps {
    className?: string
    autoRefresh?: boolean
}

export function WhisperCard({ className, autoRefresh = false }: WhisperCardProps) {
    const [data, setData] = useState<WhisperData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [key, setKey] = useState(0)

    const fetchWhisper = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/user/whisper')
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (err) {
            console.error('Whisper fetch failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWhisper()

        // Auto-refresh every 5 minutes if enabled
        if (autoRefresh) {
            const interval = setInterval(fetchWhisper, 5 * 60 * 1000)
            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    const handleRefresh = () => {
        setKey(k => k + 1)
        fetchWhisper()
    }

    if (isLoading && !data) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-24 bg-white/5 rounded-2xl" />
            </div>
        )
    }

    if (!data) return null

    return (
        <motion.div
            className={`relative group ${className}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="relative bg-gradient-to-br from-violet-500/5 to-blue-500/5 border border-white/5 rounded-2xl p-5 overflow-hidden">
                {/* Subtle glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />

                {/* Refresh button */}
                <button
                    onClick={handleRefresh}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                >
                    <RefreshCw size={14} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                    <MessageCircle size={14} className="text-violet-400" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                        Whisper Network
                    </span>
                </div>

                {/* Message */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={SPRINGS.fluid}
                        className="text-sm text-zinc-300 leading-relaxed italic relative z-10"
                    >
                        "{data.whisper}"
                    </motion.p>
                </AnimatePresence>

                {/* Sender */}
                <motion.div
                    className="mt-4 pt-3 border-t border-white/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="text-xs text-zinc-500">
                        — {data.sender.name}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                        {data.sender.years}
                    </p>
                </motion.div>
            </div>
        </motion.div>
    )
}

// Compact inline version
export function WhisperInline({ className }: { className?: string }) {
    const [whisper, setWhisper] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/user/whisper')
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setWhisper(data.whisper))
            .catch(() => { })
    }, [])

    if (!whisper) return null

    return (
        <motion.div
            className={`flex items-center gap-2 ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <MessageCircle size={12} className="text-violet-400 flex-shrink-0" />
            <p className="text-xs text-zinc-500 italic truncate">"{whisper}"</p>
        </motion.div>
    )
}
