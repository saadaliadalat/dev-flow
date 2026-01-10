'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/dashboard/Sidebar'
import {
    LayoutDashboard,
    BarChart3,
    Trophy,
    Crown,
    Target,
    Brain,
} from 'lucide-react'
import Link from 'next/link'

const mobileLinks = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Ranks', href: '/dashboard/leaderboard', icon: Crown },
    { name: 'Goals', href: '/dashboard/goals', icon: Target },
    { name: 'AI', href: '/dashboard/insights', icon: Brain },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-void flex">
            {/* 🧬 2026 MAGNET SIDEBAR (Desktop) */}
            <Sidebar />

            {/* 📱 MOBILE GLASS DOCK */}
            <nav className="fixed bottom-4 inset-x-4 h-16 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl z-50 lg:hidden shadow-2xl flex items-center justify-around px-2">
                {mobileLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${isActive ? 'text-white' : 'text-zinc-500'}`}
                        >
                            <link.icon size={20} className={isActive ? 'text-violet-500 drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]' : ''} />
                            {isActive && <div className="w-1 h-1 rounded-full bg-violet-500 mt-1" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Main Content */}
            <main className="flex-1 lg:ml-[290px] min-h-screen pb-24 lg:pb-0">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} // Butter ease
                    className="max-w-[var(--content-max-width)] mx-auto p-6 lg:p-8"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    )
}
