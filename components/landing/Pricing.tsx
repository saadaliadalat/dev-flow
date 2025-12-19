'use client'

import { motion } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { Github, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Pricing() {
    const router = useRouter()
    return (
        <section id="pricing" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                        Simple, Transparent <span className="text-gradient">Pricing</span>
                    </h2>
                    <p className="text-text-tertiary text-lg">
                        Start for free, upgrade when you need more power.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <GlassCard className="relative border-white/10 bg-zinc-900/50 backdrop-blur-2xl overflow-hidden">
                        {/* Spotlight Effect */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-8 md:p-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    COMPLETELY FREE
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    Professional Grade. <br />
                                    <span className="text-zinc-500">Zero Cost.</span>
                                </h3>
                                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                                    We believe developer tools should be accessible to everyone. No credit card required. No hidden fees. Just code.
                                </p>
                                <GradientButton variant="primary" size="lg" className="w-full md:w-auto min-w-[200px]" onClick={() => router.push('/login')}>
                                    Start Building Now
                                </GradientButton>
                            </div>

                            <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                                <div className="text-white font-bold mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="text-white" /> What's Included
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        'Unlimited Repositories',
                                        'Advanced Analytics',
                                        'Team Leaderboards',
                                        'Export Data Options',
                                        'Dark Mode UI',
                                        'Priority Support'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-zinc-300">
                                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                                <CheckCircle2 size={12} className="text-white" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </section>
    )
}
