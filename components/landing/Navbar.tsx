'use client'

import React, { useState } from 'react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { DevFlowLogo } from '@/components/ui/DevFlowLogo'

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
            className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 pointer-events-none"
        >
            <div className={cn(
                "pointer-events-auto relative flex items-center justify-between w-[95%] max-w-7xl px-4 py-3 rounded-full transition-all duration-500",
                isScrolled
                    ? "bg-black/80 border border-white/[0.08] backdrop-blur-md shadow-lg shadow-black/20"
                    : "bg-transparent border border-transparent"
            )}>
                {/* 1. LOGO */}
                <Link href="/" className="flex items-center gap-2 group relative z-10">
                    <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-colors duration-300">
                        <DevFlowLogo className="w-6 h-6" />
                        <div className="absolute inset-0 bg-white/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-purple-100 transition-colors">
                        DevFlow
                    </span>
                </Link>

                {/* 2. CENTER NAV (Desktop) */}
                <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.05] backdrop-blur-sm absolute left-1/2 -translate-x-1/2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="relative px-5 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white transition-colors group overflow-hidden"
                        >
                            <span className="relative z-10">{link.name}</span>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <Link
                        href="/blog"
                        className="relative px-5 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white transition-colors group"
                    >
                        <span className="relative z-10">Blog</span>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                    </Link>
                </nav>

                {/* 3. ACTIONS (Right) */}
                <div className="hidden md:flex items-center gap-4 relative z-10">
                    {session ? (
                        <Link href="/dashboard">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold shadow-lg shadow-white/5 hover:shadow-white/20 transition-all flex items-center gap-2"
                            >
                                Dashboard
                                <ChevronRight size={14} />
                            </motion.button>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2"
                            >
                                Sign In
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/signup')}
                                className="group relative px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold overflow-hidden shadow-lg shadow-white/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <span className="relative flex items-center gap-2">
                                    Get Started
                                    <Zap size={14} className="fill-black text-black" />
                                </span>
                            </motion.button>
                        </>
                    )}
                </div>

                {/* MOBILE MENU TOGGLE */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 text-zinc-400 hover:text-white bg-white/5 rounded-lg border border-white/5"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* MOBILE OVERLAY */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-4 inset-x-4 p-6 bg-black/95 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl z-50 flex flex-col gap-6 pointer-events-auto"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <DevFlowLogo className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg text-white">Menu</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white border border-white/5"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-lg font-medium text-zinc-400 hover:text-white hover:bg-white/5 p-4 rounded-xl transition-all"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                href="/blog"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-lg font-medium text-zinc-400 hover:text-white hover:bg-white/5 p-4 rounded-xl transition-all"
                            >
                                Blog
                            </Link>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="flex flex-col gap-3">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full py-3.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
                                    Sign In
                                </button>
                            </Link>
                            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full py-3.5 rounded-xl bg-white text-black font-bold shadow-lg shadow-white/5">
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
