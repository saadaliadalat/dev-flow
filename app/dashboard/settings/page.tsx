'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Key, CreditCard, Bell, Copy, Check, Shield, Zap, Sparkles } from 'lucide-react'
import { useToastActions } from '@/components/ui/Toast'

// Tabs configuration
// Tabs configuration
const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'tokens', label: 'Access Tokens', icon: Key },
    { id: 'usage', label: 'Usage', icon: Sparkles },
    { id: 'preferences', label: 'Preferences', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<string>('profile')
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

                                    {/* Danger Zone */}
                                    <div className="premium-card p-6 border-red-500/20 bg-red-500/5">
                                        <h2 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h2>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-medium">Delete Personal Data</p>
                                                <p className="text-sm text-red-400/60 mt-1">Permanently remove all your data in accordance with GDPR.</p>
                                            </div>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 transition-colors text-sm font-medium"
                                                onClick={() => success('Request Sent', 'Data deletion request has been submitted.')}
                                            >
                                                Delete Data
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Access Tokens Tab */}
                            {activeTab === 'tokens' && (
                                <div className="space-y-6 max-w-3xl">
                                    <div className="premium-card p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-lg font-semibold text-white">Personal Access Tokens</h2>
                                                <p className="text-sm text-zinc-400">Manage tokens for CLI access and external integrations.</p>
                                            </div>
                                            <button className="btn-primary">
                                                <Shield size={16} className="mr-2" />
                                                Generate Token
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                    <Key size={20} className="text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">CLI Access Token</p>
                                                    <p className="text-xs text-zinc-500 font-mono mt-0.5">df_live_...8f92m</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Active</span>
                                                <button
                                                    onClick={() => copyToClipboard('df_live_51M3T...x8f92m')}
                                                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                                                    title="Copy Token"
                                                >
                                                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Usage Tab (Resource Consumption) */}
                            {activeTab === 'usage' && (
                                <div className="space-y-6 max-w-3xl">
                                    <div className="premium-card p-6 border-zinc-800 relative overflow-hidden bg-zinc-900/50">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-500/10 text-purple-400 border border-purple-500/20">Public Beta</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                </div>
                                                <h2 className="text-2xl font-bold text-white mb-1">Unlimited Access</h2>
                                                <p className="text-sm text-zinc-400">You are currently on the Public Beta plan.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="premium-card p-6 space-y-8">
                                        <h3 className="text-sm font-semibold text-white mb-4">Resource Consumption</h3>

                                        {/* AI Insights Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-400">AI Insights Generated</span>
                                                <span className="text-white font-mono">12 / 500</span>
                                            </div>
                                            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-[2.4%]" />
                                            </div>
                                        </div>

                                        {/* Data Points Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-400">Data Points Analyzed</span>
                                                <span className="text-white font-mono">45,231</span>
                                            </div>
                                            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                                <div className="h-full bg-zinc-200 w-[75%]" />
                                            </div>
                                        </div>

                                        {/* API Health */}
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-950 border border-zinc-900">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-emerald-500/10">
                                                    <Zap size={16} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">API Rate Limit</p>
                                                    <p className="text-xs text-zinc-500">10,000 req/hour</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-emerald-400">Healthy</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="premium-card p-6">
                                        <h2 className="text-lg font-semibold text-white mb-6">Editor Preferences</h2>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Code Theme</label>
                                                <select className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors appearance-none">
                                                    <option>Vercel Dark</option>
                                                    <option>Dracula</option>
                                                    <option>Monokai</option>
                                                    <option>GitHub Dark</option>
                                                </select>
                                                <p className="text-xs text-zinc-500">This theme will apply to all code snippets in the dashboard.</p>
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
