'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<string>('')
    const { scrollY } = useScroll()
    const router = useRouter()
    const pathname = usePathname()
    const { data: session } = useSession()

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20)
    })

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How it works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
    ]

    if (pathname?.startsWith('/admin')) return null

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4"
        >
            <div className={cn(
                "relative flex items-center justify-between w-[95%] max-w-7xl px-4 py-3 rounded-2xl transition-all duration-300",
                isScrolled
                    ? "bg-[#09090b]/80 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50"
                    : "bg-transparent border border-transparent"
            )}>
                {/* 1. LOGO */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-8 h-8 flex items-center justify-center bg-white text-black rounded-lg font-bold font-mono text-lg shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        D
                        <div className="absolute inset-0 bg-white blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                        DevFlow
                    </span>
                </Link>

                {/* 2. CENTER NAV (Desktop) */}
                <nav className="hidden md:flex items-center gap-8 bg-white/5 px-6 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-white rounded-full transition-all group-hover:w-full opacity-0 group-hover:opacity-100" />
                        </Link>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <Link href="/blog" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                        Blog
                    </Link>
                </nav>

                {/* 3. ACTIONS (Right) */}
                <div className="hidden md:flex items-center gap-4">
                    {session ? (
                        <Link href="/dashboard">
                            <button className="px-5 py-2 rounded-lg bg-white text-black text-sm font-bold shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-105 transition-all">
                                Go to Dashboard
                            </button>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <button
                                onClick={() => router.push('/signup')}
                                className="group relative px-5 py-2 rounded-lg bg-gradient-to-b from-purple-500 to-purple-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105 transition-all overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative flex items-center gap-1.5">
                                    Get Started
                                    <Zap size={14} className="fill-white" />
                                </span>
                            </button>
                        </>
                    )}
                </div>

                {/* MOBILE MENU TOGGLE */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 text-zinc-400 hover:text-white"
                >
                    <Menu />
                </button>
            </div>

            {/* MOBILE OVERLAY */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-4 inset-x-4 p-6 bg-[#0a0612] border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col gap-6"
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-xl text-white">Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 bg-white/5 rounded-full text-zinc-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-lg font-medium text-zinc-300"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="flex flex-col gap-3">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium">
                                    Sign In
                                </button>
                            </Link>
                            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold">
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
