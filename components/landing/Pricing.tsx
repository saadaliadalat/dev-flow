'use client'

import { motion } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { Github, CheckCircle2 } from 'lucide-react'

export function Pricing() {
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">

                    {/* Free */}
                    <GlassCard className="border-glass-border/50">
                        <div className="p-4">
                            <h3 className="text-2xl font-bold mb-2">Hobby</h3>
                            <div className="text-4xl font-display font-bold mb-6">$0<span className="text-lg text-text-tertiary font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                {['Limited History', 'Basic Analytics', 'Public Profile'].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-text-secondary">
                                        <CheckCircle2 size={18} className="text-text-tertiary" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <GradientButton variant="secondary" className="w-full">Start Free</GradientButton>
                        </div>
                    </GlassCard>

                    {/* Pro */}
                    <div className="relative transform md:-translate-y-4">
                        <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-[20px] opacity-30" />
                        <GlassCard className="relative border-cyan-500/50 bg-bg-elevated/50" glow="cyan">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <span className="px-4 py-1 rounded-full bg-gradient-primary text-white text-xs font-bold uppercase tracking-wider">
                                    Most Popular
                                </span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
                                <div className="text-5xl font-display font-bold mb-6 text-gradient">$9<span className="text-lg text-text-tertiary font-normal">/mo</span></div>
                                <ul className="space-y-4 mb-8">
                                    {['Unlimited History', 'AI Insights & Coach', 'Burnout Protection', 'Private Leaderboards'].map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-white">
                                            <CheckCircle2 size={18} className="text-cyan-400" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <GradientButton variant="primary" className="w-full h-14 text-lg">
                                    Get Started
                                </GradientButton>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Team */}
                    <GlassCard className="border-glass-border/50">
                        <div className="p-4">
                            <h3 className="text-2xl font-bold mb-2">Team</h3>
                            <div className="text-4xl font-display font-bold mb-6">$19<span className="text-lg text-text-tertiary font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                {['Everything in Pro', 'Team Dashboard', 'Export Reports', 'Priority Support'].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-text-secondary">
                                        <CheckCircle2 size={18} className="text-text-tertiary" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <GradientButton variant="secondary" className="w-full">Contact Sales</GradientButton>
                        </div>
                    </GlassCard>

                </div>
            </div>
        </section>
    )
}
