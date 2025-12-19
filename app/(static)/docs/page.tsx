'use client'

import React from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'

export default function DocsPage() {
    return (
        <div className="container mx-auto px-6 max-w-4xl pt-32 pb-20">
            <Navbar />
            <h1 className="text-4xl font-display font-bold mb-8">Documentation</h1>
            <GlassCard className="p-10 prose prose-invert max-w-none">
                <p className="text-xl text-text-secondary">Documentation coming soon...</p>
                <p>We are currently writing comprehensive guides for the DevFlow API and platform.</p>
            </GlassCard>
        </div>
    )
}
