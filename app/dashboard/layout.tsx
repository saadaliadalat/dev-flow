'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    BarChart3,
    Trophy,
    Target,
    Brain,
    Settings,
    LogOut,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import { DevFlowLogo } from '@/components/ui/DevFlowLogo'

const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
    { name: 'Goals', href: '/dashboard/goals', icon: Target },
    { name: 'AI Insights', href: '/dashboard/insights', icon: Brain },
]

const bottomLinks = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] flex">
            {/* Fixed Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-[var(--bg-deepest)] border-r border-[var(--glass-border)] flex flex-col z-40 hidden lg:flex">
                {/* Logo */}
                <div className="p-6 border-b border-[var(--glass-border)]">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="p-2 rounded-xl bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 group-hover:border-[var(--accent-blue)]/40 transition-all">
                            <DevFlowLogo className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="font-display font-bold text-lg text-white">DevFlow</span>
                            <div className="flex items-center gap-1 text-[10px] text-[var(--accent-blue)]">
                                <Sparkles size={10} />
                                <span>Pro</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <link.icon size={18} strokeWidth={1.5} />
                                <span className="flex-1 text-sm font-medium">{link.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-[var(--glass-border)] space-y-1">
                    {bottomLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <link.icon size={18} strokeWidth={1.5} />
                                <span className="flex-1 text-sm font-medium">{link.name}</span>
                            </Link>
                        )
                    })}
                    <button
                        onClick={() => signOut()}
                        className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <LogOut size={18} strokeWidth={1.5} />
                        <span className="flex-1 text-sm font-medium">Sign Out</span>
                    </button>
                </div>

                {/* User Profile */}
                {session?.user && (
                    <div className="p-4 border-t border-[var(--glass-border)]">
                        <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] transition-all group"
                        >
                            <div className="relative">
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="w-10 h-10 rounded-full border-2 border-[var(--glass-border)]"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-sm font-bold">
                                        {session.user.name?.[0] || 'U'}
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--accent-emerald)] rounded-full border-2 border-[var(--bg-deepest)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                                <p className="text-xs text-[var(--text-tertiary)] truncate">{session.user.email}</p>
                            </div>
                            <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
                        </Link>
                    </div>
                )}
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 inset-x-0 bg-[var(--bg-deepest)] border-t border-[var(--glass-border)] z-40 lg:hidden" aria-label="Mobile navigation">
                <div className="flex items-center justify-around py-2">
                    {sidebarLinks.slice(0, 5).map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex flex-col items-center gap-1 p-2 min-w-[60px] ${isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-tertiary)]'
                                    }`}
                            >
                                <link.icon size={20} strokeWidth={1.5} />
                                <span className="text-[10px] font-medium">{link.name.split(' ')[0]}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 lg:ml-[280px] min-h-screen pb-20 lg:pb-0">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="max-w-[var(--content-max-width)] mx-auto p-6 lg:p-8"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    )
}
