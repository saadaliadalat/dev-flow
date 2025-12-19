'use client'

import React from 'react'
import { GlassCard } from '@/components/ui/GlassCard'

export default function SupportPage() {
    return (
        <div className="container mx-auto px-6 max-w-4xl pt-32">
            <h1 className="text-4xl font-display font-bold mb-8">Support Center</h1>
            <GlassCard className="p-10 text-center">
                <h2 className="text-2xl font-bold mb-4">How can we help?</h2>
                <p className="text-text-secondary mb-8">Search our knowledge base or contact our support team.</p>
                <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full max-w-lg mx-auto block bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                />
            </GlassCard>
        </div>
    )
}
