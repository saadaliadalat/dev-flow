'use client'

import React from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'

export default function TermsPage() {
    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>
            <GlassCard className="p-10 prose prose-invert prose-zinc max-w-none">
                <p>Last updated: December 2024</p>
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing DevFlow, you agree to be bound by these Terms of Service.</p>

                <h3>2. Usage License</h3>
                <p>DevFlow grants you a limited, non-exclusive license to use the platform for personal analytics.</p>

                <h3>3. Disclaimer</h3>
                <p>The materials on DevFlow are provided on an 'as is' basis.</p>

                <h3>4. Limitations</h3>
                <p>In no event shall DevFlow be liable for any damages arising out of the use or inability to use the materials.</p>
            </GlassCard>
        </div>
    )
}
