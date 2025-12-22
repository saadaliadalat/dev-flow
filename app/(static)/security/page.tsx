'use client'

import React from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Shield, Lock, Eye, Server } from 'lucide-react'

export default function SecurityPage() {
    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <h1 className="text-4xl font-display font-bold mb-8">Security</h1>
            <GlassCard className="p-10" glow="cyan">
                <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 h-fit">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Data Protection</h3>
                            <p className="text-zinc-400">All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never store your actual source code.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 h-fit">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">OAuth Security</h3>
                            <p className="text-zinc-400">We use GitHub OAuth for authentication. We only request read-only access to your public profile and repository metadata.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 h-fit">
                            <Eye size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Minimal Data Collection</h3>
                            <p className="text-zinc-400">We only collect commit metadata (timestamps, counts) — never your actual code, commit messages, or sensitive repository contents.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 h-fit">
                            <Server size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Infrastructure</h3>
                            <p className="text-zinc-400">Hosted on Vercel with SOC 2 Type II compliance. Database secured with Supabase Row Level Security policies.</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}
