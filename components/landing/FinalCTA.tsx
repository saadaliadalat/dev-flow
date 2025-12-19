'use client'

import { motion } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { Github, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'

export function FinalCTA() {
    const router = useRouter()
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Mesh */}
            <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <GlassCard className="max-w-4xl mx-auto text-center py-20 px-6 md:px-20 overflow-visible" glow="cyan">
                    {/* Floating Glows */}
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-display font-bold mb-8 relative z-10"
                    >
                        Ready to Transform Your <br />
                        <span className="text-gradient">Coding Journey?</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-text-tertiary mb-10 max-w-2xl mx-auto relative z-10"
                    >
                        Join 10,000+ developers who track, improve, and showcase their work with DevFlow.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
                    >
                        <GradientButton size="lg" icon={<Github className="w-5 h-5" />} className="w-full sm:w-auto text-lg px-10 py-5" onClick={() => router.push('/login')}>
                            Start Free with GitHub
                        </GradientButton>
                    </motion.div>

                    <p className="mt-6 text-sm text-text-muted relative z-10">
                        No credit card required • Free forever • 2-minute setup
                    </p>
                </GlassCard>
            </div>
        </section>
    )
}
