'use client'

import React from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>
            <GlassCard className="p-10 prose prose-invert prose-zinc max-w-none">
                <p>Last updated: December 2024</p>
                <h3>1. Introduction</h3>
                <p>Welcome to DevFlow. We respect your privacy and are committed to protecting your personal data.</p>

                <h3>2. Data We Collect</h3>
                <p>We collect GitHub profile data, repository metadata, and commit history to generate analytics. We do not store your actual code.</p>

                <h3>3. How We Use Your Data</h3>
                <p>Your data is used solely to generate productivity insights, achievements, and statistics for your dashboard.</p>

                <h3>4. Data Security</h3>
                <p>We use industry-standard encryption for all data transmission and storage.</p>
            </GlassCard>
        </div>
    )
}
