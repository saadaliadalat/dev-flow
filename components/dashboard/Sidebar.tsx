'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutGrid,
    Activity,
    Target,
    Settings,
    LogOut,
    Github,
    Home
} from 'lucide-react'
import { DevFlowLogo } from '@/components/ui/DevFlowLogo'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const sidebarItems = [
    { icon: Home, label: 'Overview', href: '/dashboard' },
    { icon: Activity, label: 'Activity', href: '/dashboard/activity' },
    { icon: Target, label: 'Goals', href: '/dashboard/goals' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-64 z-50 flex flex-col hidden md:flex pointer-events-none">
            {/* Glass Container */}
            <div className="flex-1 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl flex flex-col p-4 pointer-events-auto overflow-hidden relative">

                {/* Logo Area */}
                <div className="h-16 flex items-center gap-3 px-2 mb-6">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                        <DevFlowLogo className="w-6 h-6" />
                    </div>
                    <span className="font-display font-bold text-lg text-white tracking-tight">
                        DevFlow
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "relative px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 group overflow-hidden",
                                    isActive
                                        ? "text-white"
                                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                                )}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute inset-0 bg-white/10 border border-white/5 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <item.icon size={20} className={cn("relative z-10 transition-colors", isActive ? "text-white" : "group-hover:text-white")} />
                                    <span className="relative z-10 font-medium text-sm">{item.label}</span>

                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}
