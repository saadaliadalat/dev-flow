'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { Rocket, ArrowRight } from 'lucide-react'

const positions = [
    {
        title: "Senior Full Stack Engineer",
        department: "Engineering",
        location: "Remote / SF",
        type: "Full-time"
    },
    {
        title: "AI Researcher",
        department: "Data Science",
        location: "Remote",
        type: "Full-time"
    },
    {
        title: "Product Designer",
        department: "Design",
        location: "Hybrid / NY",
        type: "Contract"
    }
]

export default function CareersPage() {
    return (
        <div className="container mx-auto px-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto"
            >
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
                        Join the <span className="text-gradient">Mission</span>
                    </h1>
                    <p className="text-xl text-text-tertiary mb-8">
                        Help us build the future of developer analytics and well-being.
                    </p>
                    <GradientButton size="lg" icon={<Rocket size={20} />}>
                        View Open Roles
                    </GradientButton>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                    <h2 className="text-2xl font-bold font-display mb-6">Open Positions</h2>
                    {positions.map((job, i) => (
                        <GlassCard key={i} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 group cursor-pointer" hover>
                            <div>
                                <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors">{job.title}</h3>
                                <div className="flex gap-3 text-sm text-text-tertiary mt-1">
                                    <span>{job.department}</span>
                                    <span>•</span>
                                    <span>{job.location}</span>
                                    <span>•</span>
                                    <span>{job.type}</span>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                <ArrowRight className="text-cyan-400" />
                            </div>
                        </GlassCard>
                    ))}
                </motion.div>

                <motion.div variants={itemVariants} className="mt-16 text-center">
                    <p className="text-text-secondary">
                        Don't see a role that fits? <a href="#" className="text-cyan-400 hover:underline">Send us your resume</a> anyway.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}
