'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    ScrollText,
    Activity,
    Shield,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Home
} from 'lucide-react'

interface AdminSidebarProps {
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
}

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'System', href: '/admin/system', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Logs', href: '/admin/logs', icon: ScrollText },
]

export function AdminSidebar({ collapsed, setCollapsed }: AdminSidebarProps) {
    const pathname = usePathname()

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-black/40 backdrop-blur-xl border-r border-white/5 z-50 shadow-2xl"
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-3 relative z-10"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Shield size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-white text-lg tracking-tight">DevFlow</h1>
                                <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest pl-0.5">Admin Portal</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {collapsed && (
                    <div className="w-full flex justify-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield size={20} className="text-white" />
                        </div>
                    </div>
                )}

                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors relative z-10"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}
            </div>

            {/* Toggle Button for Collapsed State - Floating when collapsed */}
            {collapsed && (
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-lg z-50"
                >
                    <ChevronRight size={14} />
                </button>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="block relative group"
                        >
                            <div className={`
                                relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300
                                ${isActive
                                    ? 'text-white bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}
                            `}>
                                {/* Active Glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 rounded-xl bg-blue-500/5 blur-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}

                                <item.icon
                                    size={20}
                                    className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-blue-400' : 'group-hover:text-zinc-300'}`}
                                />

                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="font-medium text-sm relative z-10"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {/* Tooltip for collapsed state */}
                                {collapsed && (
                                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl transform translate-x-2 group-hover:translate-x-0 duration-200">
                                        {item.name}
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all group ${collapsed ? 'justify-center' : ''}`}
                >
                    <Home size={20} className="group-hover:text-emerald-400 transition-colors" />
                    {!collapsed && <span className="font-medium text-sm">Back to App</span>}
                </Link>

                {!collapsed && (
                    <div className="px-3 py-2">
                        <p className="text-[10px] text-zinc-600 text-center font-mono">v1.2.0 • Admin</p>
                    </div>
                )}
            </div>
        </motion.aside>
    )
}
