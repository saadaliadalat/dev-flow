'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export default function StatusPage() {
    return (
        <div className="container mx-auto px-6 max-w-4xl pt-32">
            <h1 className="text-4xl font-display font-bold mb-8 text-center">System Status</h1>

            <GlassCard className="p-8 mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 font-bold mb-4">
                    <CheckCircle size={20} />
                    All Systems Operational
                </div>
                <p className="text-text-tertiary">Last updated: Just now</p>
            </GlassCard>

            <div className="space-y-4">
                {['API', 'Dashboard', 'GitHub Sync', 'Notifications'].map(service => (
                    <GlassCard key={service} className="p-4 flex justify-between items-center">
                        <span className="font-medium">{service}</span>
                        <span className="text-green-400 text-sm font-bold">Operational</span>
                    </GlassCard>
                ))}
            </div>
        </div>
    )
}
