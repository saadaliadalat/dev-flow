'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    ScrollText,
    Activity,
    ChevronLeft,
    ChevronRight,
    Shield,
    LogOut,
    Home,
    Bell,
    Moon,
    Search,
    Menu,
    X
} from 'lucide-react'

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'System', href: '/admin/system', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Logs', href: '/admin/logs', icon: ScrollText },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        async function checkAdmin() {
            if (status === 'loading') return

            if (!session) {
                router.push('/login')
                return
            }

            try {
                const res = await fetch('/api/admin/verify')
                const data = await res.json()

                if (!data.isAdmin) {
                    router.push('/dashboard')
                    return
                }

                setIsAdmin(true)
            } catch (error) {
                console.error('Admin check failed:', error)
                router.push('/dashboard')
            }
        }

        checkAdmin()
    }, [session, status, router])

    if (status === 'loading' || isAdmin === null) {
        return (
            <div className="min-h-screen bg-bg-deepest flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400 font-mono text-sm">Verifying admin access...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <div className="min-h-screen bg-bg-deepest text-text-primary flex">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? 80 : 280 }}
                className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-bg-deep border-r border-white/5 z-50"
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                    <AnimatePresence mode="wait">
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                    <Shield size={18} className="text-black" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-white">DevFlow</h1>
                                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Admin Panel</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${isActive
                                    ? 'bg-white text-black'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-black' : 'text-zinc-500 group-hover:text-white'} />
                                <AnimatePresence mode="wait">
                                    {!sidebarCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="font-medium text-sm"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {sidebarCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-white/5 space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Home size={20} className="text-zinc-500" />
                        <AnimatePresence mode="wait">
                            {!sidebarCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="font-medium text-sm"
                                >
                                    Back to App
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-bg-deep border-b border-white/5 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                        <Shield size={18} className="text-black" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-sm">DevFlow Admin</h1>
                    </div>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="lg:hidden fixed inset-0 top-16 bg-bg-deep z-40"
                    >
                        <nav className="p-4 space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-white text-black'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon size={20} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                )
                            })}
                            <div className="pt-4 border-t border-white/5">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <Home size={20} />
                                    <span className="font-medium">Back to App</span>
                                </Link>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'} pt-16 lg:pt-0`}>
                {/* Top Bar */}
                <div className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-white/5 bg-bg-deep/50 backdrop-blur-xl sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
                            <Bell size={20} className="text-zinc-400" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            {session?.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'Admin'}
                                    className="w-8 h-8 rounded-full border border-white/10"
                                />
                            )}
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                                <p className="text-xs text-zinc-500">Administrator</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
