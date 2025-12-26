'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { User, Settings, Shield, LogOut } from 'lucide-react'
import { DevFlowLogo } from '@/components/ui/DevFlowLogo'

export default function ProfilePage() {
    return (
        <div className="container mx-auto">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto"
            >
                <motion.h1 variants={itemVariants} className="text-3xl font-display font-bold mb-8">
                    Profile Settings
                </motion.h1>

                {/* Profile Info */}
                <motion.div variants={itemVariants} className="mb-8">
                    <GlassCard className="p-8">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-primary p-1">
                                    <div className="w-full h-full rounded-full bg-bg-deep flex items-center justify-center">
                                        <DevFlowLogo className="w-16 h-16" />
                                    </div>
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-bg-elevated rounded-full border border-glass-border hover:text-cyan-400 transition-colors">
                                    <Settings size={16} />
                                </button>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-1">DevUser</h2>
                                <p className="text-text-tertiary mb-4">devuser@example.com</p>
                                <div className="flex gap-3">
                                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">Pro Plan</span>
                                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">Level 42</span>
                                </div>
                            </div>

                            <GradientButton variant="secondary" icon={<LogOut size={16} />}>
                                Sign Out
                            </GradientButton>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Settings Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div variants={itemVariants}>
                        <GlassCard className="h-full p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <User className="text-cyan-400" />
                                <h3 className="text-lg font-bold">Personal Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Display Name</label>
                                    <input type="text" defaultValue="DevUser" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Bio</label>
                                    <textarea rows={3} defaultValue="Full Stack Developer focused on React and Node.js." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <GradientButton size="sm">Save Changes</GradientButton>
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <GlassCard className="h-full p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="text-purple-400" />
                                <h3 className="text-lg font-bold">Privacy & Security</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-sm">Public Profile</span>
                                    <div className="w-10 h-5 bg-cyan-500 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-sm">Show Achievements</span>
                                    <div className="w-10 h-5 bg-cyan-500 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-sm">Allow Team Invites</span>
                                    <div className="w-10 h-5 bg-white/20 rounded-full relative cursor-pointer">
                                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
