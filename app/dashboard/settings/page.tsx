'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Key, CreditCard, Bell, Copy, Check, Shield, Zap, Sparkles } from 'lucide-react'
import { useToastActions } from '@/components/ui/Toast'

// Tabs configuration
const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')
    const [copied, setCopied] = useState(false)
    const { success } = useToastActions()

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        success('Key Copied', 'API Secret copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
                <p className="text-[var(--text-tertiary)]">Manage your account preferences and API access.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Vertical Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="premium-card p-6 space-y-6">
                                        <h2 className="text-lg font-semibold text-white">Personal Information</h2>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Full Name</label>
                                                <input
                                                    type="text"
                                                    defaultValue="Saad Ali"
                                                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Email Address</label>
                                                <input
                                                    type="email"
                                                    defaultValue="saad@example.com"
                                                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <button
                                                onClick={() => success('Profile Updated', 'Your personal information has been saved.')}
                                                className="btn-primary"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* API Keys Tab */}
                            {activeTab === 'api-keys' && (
                                <div className="space-y-6 max-w-3xl">
                                    <div className="premium-card p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-lg font-semibold text-white">API Keys</h2>
                                                <p className="text-sm text-zinc-400">Manage your secret keys for external access.</p>
                                            </div>
                                            <button className="btn-primary">
                                                <Shield size={16} className="mr-2" />
                                                Generate Secret Key
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                    <Key size={20} className="text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">Default S/K</p>
                                                    <p className="text-xs text-zinc-500 font-mono mt-0.5">sk_live_...8f92m</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Active</span>
                                                <button
                                                    onClick={() => copyToClipboard('sk_live_51M3T...x8f92m')}
                                                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                                                    title="Copy Key"
                                                >
                                                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Billing Tab */}
                            {activeTab === 'billing' && (
                                <div className="space-y-6 max-w-3xl">
                                    <div className="premium-card p-6 border-purple-500/30 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[50px] rounded-full pointer-events-none" />

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-zinc-800 text-zinc-400 border border-zinc-700">Free Plan</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                </div>
                                                <h2 className="text-2xl font-bold text-white mb-1">Passanger Tier</h2>
                                                <p className="text-sm text-zinc-400">Basic access to DevFlow features.</p>
                                            </div>
                                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                                <Zap size={16} className="fill-black" />
                                                Upgrade to Pro
                                            </button>
                                        </div>
                                    </div>

                                    <div className="premium-card p-6">
                                        <h3 className="text-sm font-semibold text-white mb-4">Plan Usage</h3>
                                        <div className="space-y-4">
                                            {/* AI Insights Usage */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-zinc-400">AI Insights</span>
                                                    <span className="text-white">3 / 5 per hour</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500 w-[60%]" />
                                                </div>
                                            </div>
                                            {/* API Calls Usage */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-zinc-400">API Calls</span>
                                                    <span className="text-white">842 / 1,000</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 w-[84%]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="premium-card p-6">
                                        <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
                                        <div className="space-y-4">
                                            {['Weekly Digest', 'New Achievements', 'Streak Reminders', 'Productivity Alerts'].map((item) => (
                                                <div key={item} className="flex items-center justify-between py-3 border-b border-[var(--glass-border)] last:border-0">
                                                    <span className="text-sm text-zinc-300">{item}</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
