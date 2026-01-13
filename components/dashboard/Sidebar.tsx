'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
    LayoutDashboard,
    BarChart3,
    Trophy,
    Crown,
    Target,
    Brain,
    Settings,
    LogOut,
    Sparkles,
    Flame
} from 'lucide-react'
import { DevFlowLogo } from '@/components/ui/DevFlowLogo'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { SPRINGS } from '@/lib/motion'

// 🔗 NAVIGATION CONFIG
const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Crown },
    { name: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
    { name: 'Goals', href: '/dashboard/goals', icon: Target },
    { name: 'AI Insights', href: '/dashboard/insights', icon: Brain },
    { name: 'Your LORE', href: '/dashboard/lore', icon: Flame },
]

// 🧲 MAGNETIC LINK COMPONENT
function MagneticLink({
    href,
    isActive,
    icon: Icon,
    label
}: {
    href: string,
    isActive: boolean,
    icon: any,
    label: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 }
        const x = (clientX - (left + width / 2)) * 0.2 // dampening
        const y = (clientY - (top + height / 2)) * 0.2
        setPosition({ x, y })
    }

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 })
    }

    return (
        <Link href={href} className="block relative group">
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                animate={{ x: position.x, y: position.y }}
                transition={SPRINGS.micro}
                className={cn(
                    "relative px-4 py-3 rounded-2xl flex items-center gap-3 transition-colors duration-300 overflow-hidden",
                    isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                )}
            >
                {/* Active Background Pill (Arc Style) */}
                {isActive && (
                    <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-white/10 border border-white/5 rounded-2xl z-0"
                        transition={SPRINGS.fluid}
                    />
                )}

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                <Icon size={20} className="relative z-10" />
                <span className="relative z-10 font-medium text-sm tracking-tight">{label}</span>

                {/* Active Indicator Dot */}
                {isActive && (
                    <motion.div
                        layoutId="active-dot"
                        className="absolute right-4 w-1.5 h-1.5 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.8)]"
                    />
                )}
            </motion.div>
        </Link>
    )
}

// 🏗️ MAIN SIDEBAR
export function Sidebar() {
    return (
        <aside className="fixed left-4 top-4 bottom-4 w-[260px] hidden lg:flex flex-col z-50 pointer-events-none">
            {/* The Floating Glass Dock */}
            <div className="flex-1 rounded-[32px] bg-zinc-950/80 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/50 flex flex-col p-3 pointer-events-auto relative overflow-hidden">

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 bg-void-noise opacity-[0.03] pointer-events-none" />

                {/* Header */}
                <div className="px-4 pt-6 pb-6 flex items-center gap-3 relative z-10">
                    <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
                        <DevFlowLogo className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="font-heading font-bold text-lg text-white leading-none">DevFlow</h1>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-2 h-2 text-violet-500" /> Pro
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-1 relative z-10">
                    <LayoutGroup>
                        {sidebarLinks.map((link) => (
                            <MagneticComponentsWrapper key={link.href} link={link} />
                        ))}
                    </LayoutGroup>
                </nav>

                {/* Footer Actions */}
                <div className="mt-auto pt-4 border-t border-white/5 relative z-10 space-y-2">
                    <Link href="/dashboard/settings" className="px-4 py-3 rounded-2xl flex items-center gap-3 text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                        <Settings size={20} />
                        <span className="font-medium text-sm">Settings</span>
                    </Link>
                    <button
                        onClick={() => signOut()}
                        className="w-full px-4 py-3 rounded-2xl flex items-center gap-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}

// Wrapper to handle hook logic outside of map if needed, or just inline
function MagneticComponentsWrapper({ link }: { link: typeof sidebarLinks[0] }) {
    const pathname = usePathname()
    // Simple check: exact match or starts with for sub-routes
    const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href))

    return <MagneticLink href={link.href} isActive={isActive || false} icon={link.icon} label={link.name} />
}

