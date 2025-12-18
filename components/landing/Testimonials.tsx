'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Star } from 'lucide-react'
import { containerVariants, itemVariants } from '@/lib/animations'

const testimonials = [
    {
        name: "Alex Chen",
        role: "Senior Engineer @ Stripe",
        quote: "DevFlow helped me realize I was burning out before it was too late. The AI insights are spot-on.",
        avatar: "A"
    },
    {
        name: "Sarah Park",
        role: "Indie Developer",
        quote: "Finally, a beautiful way to showcase my coding journey. The year-in-review cards went viral!",
        avatar: "S"
    },
    {
        name: "Michael Torres",
        role: "CTO @ TechCorp",
        quote: "Our team uses DevFlow to track collaboration and prevent burnout. Game-changer.",
        avatar: "M"
    }
]

export function Testimonials() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="text-center mb-16"
                >
                    <motion.h2 variants={itemVariants} className="text-4xl font-display font-bold mb-6">
                        Loved by Developers <span className="text-gradient">Worldwide</span>
                    </motion.h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <GlassCard className="h-full flex flex-col justify-between" glow="purple">
                                <div>
                                    <div className="flex gap-1 text-orange-400 mb-6">
                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
                                    </div>
                                    <p className="text-lg text-text-secondary italic mb-8">"{t.quote}"</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{t.name}</div>
                                        <div className="text-sm text-text-tertiary">{t.role}</div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
