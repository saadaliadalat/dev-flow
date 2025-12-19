'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Navbar } from '@/components/landing/Navbar'
import { useSession } from 'next-auth/react'
import { Share2, Download, Copy, Check } from 'lucide-react'
import { useState, useRef } from 'react'

export default function ShareProfilePage() {
    const { data: session } = useSession()
    const [copied, setCopied] = useState(false)
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/u/${session?.user?.name?.replace(/\s+/g, '').toLowerCase()}` : ''

    const handleCopy = () => {
        navigator.clipboard.writeText(profileUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-bg-deep text-white">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20 flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold font-display mb-2">Share Your Flow</h1>
                    <p className="text-zinc-400">Show off your stats with a generated developer card.</p>
                </div>

                {/* The Share Card - Designed to look like a Spotify Wrapped card */}
                <div className="relative group perspective-1000 mb-8">
                    <GlassCard className="w-[350px] md:w-[400px] h-[600px] relative overflow-hidden bg-zinc-900 border-zinc-800 p-0 flex flex-col">

                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-cyan-900/30" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen" />

                        {/* Content */}
                        <div className="relative z-10 flex-1 p-8 flex flex-col items-center text-center">

                            {/* Logo */}
                            <div className="w-full flex justify-between items-center mb-12 opacity-80">
                                <span className="font-mono text-xs tracking-[0.2em] font-bold">DEVFLOW 2024</span>
                                <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                            </div>

                            {/* Avatar */}
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-white/20 to-white/0 backdrop-blur-md border border-white/10">
                                    <img
                                        src={session?.user?.image || 'https://github.com/shadcn.png'}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black font-bold font-mono text-xs rounded-full shadow-lg">
                                    TOP 1%
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold font-display mb-1">{session?.user?.name || 'Developer'}</h2>
                            <p className="text-zinc-500 font-mono text-xs mb-8">@developer</p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                    <p className="text-xs text-zinc-400 font-mono uppercase">Commits</p>
                                    <p className="text-3xl font-bold text-white mt-1">1,248</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                    <p className="text-xs text-zinc-400 font-mono uppercase">Streak</p>
                                    <p className="text-3xl font-bold text-emerald-400 mt-1">42<span className="text-sm">d</span></p>
                                </div>
                                <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/20">
                                    <p className="text-xs text-purple-300 font-mono uppercase">Productivity Score</p>
                                    <p className="text-4xl font-bold text-white mt-1">98<span className="text-lg opacity-50">/100</span></p>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-black/40 backdrop-blur-md border-t border-white/5 flex justify-between items-center relative z-10">
                            <div className="text-left">
                                <p className="text-[10px] text-zinc-500 font-mono uppercase">Generated by</p>
                                <p className="text-sm font-bold text-white">DevFlow</p>
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <Share2 size={14} />
                            </div>
                        </div>

                    </GlassCard>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">
                        <Download size={18} />
                        Download Image
                    </button>
                </div>
            </main>
        </div>
    )
}
