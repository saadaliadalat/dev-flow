'use client'

import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/animations'
import { GlassCard } from '@/components/ui/GlassCard'
import { Github, FileCode2, Rocket } from 'lucide-react'

const steps = [
    {
        number: "01",
        title: "Connect",
        description: "Sign in with GitHub in one click. We securely sync your contribution history.",
        icon: <Github className="w-8 h-8" />
    },
    {
        number: "02",
        title: "Analyze",
        description: "Our AI engine processes your commits, languages, and coding patterns.",
        icon: <FileCode2 className="w-8 h-8" />
    },
    {
        number: "03",
        title: "Level Up",
        description: "Get insights, unlock achievements, and share your Year in Review card.",
        icon: <Rocket className="w-8 h-8" />
    }
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 relative overflow-hidden bg-bg-mid/30">

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-gradient-primary opacity-5 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-display font-bold mb-6">
                        From GitHub to Insights in <br /><span className="text-gradient">60 Seconds</span>
                    </motion.h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-glass-border to-transparent z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            className="relative z-10"
                        >
                            <GlassCard className="text-center h-full group" hover>
                                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-bg-elevated border border-glass-border shadow-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
                                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                                        {step.icon}
                                    </span>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm border-4 border-bg-deep">
                                        {step.number}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold font-display mb-4 text-white group-hover:text-cyan-300 transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {step.description}
                                </p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
