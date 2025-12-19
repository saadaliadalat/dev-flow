'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { Github, Menu, X, LogOut, LayoutDashboard, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

// --- Custom DevFlow Logo Component ---
const DevFlowLogo = ({ className = '' }: { className?: string }) => (
    <motion.svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
    >
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="logoInner" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Outer Ring - Orbiting effect */}
        <motion.circle
            cx="20" cy="20" r="18"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="8 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
        />

        {/* Background Circle */}
        <circle cx="20" cy="20" r="14" fill="#0a0612" />

        {/* Inner Gradient Circle */}
        <circle cx="20" cy="20" r="12" fill="url(#logoInner)" opacity="0.2" />

        {/* The "D" Letter - Stylized */}
        <motion.path
            d="M13 12 L13 28 L20 28 C25 28 28 24 28 20 C28 16 25 12 20 12 L13 12 Z M16 15 L19 15 C23 15 25 17 25 20 C25 23 23 25 19 25 L16 25 L16 15 Z"
            fill="white"
            filter="url(#logoGlow)"
        />

        {/* Flow Lines - Animated */}
        <motion.path
            d="M30 14 Q34 20 30 26"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.path
            d="M33 16 Q36 20 33 24"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        {/* Pulse Dot */}
        <motion.circle
            cx="28" cy="20" r="2"
            fill="#06b6d4"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
    </motion.svg>
)

// --- Navigation Link Component ---
const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link
        href={href}
        className="relative px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-all duration-300 group"
    >
        <span className="relative z-10">{children}</span>
        {/* Hover Background */}
        <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
        {/* Underline */}
        <motion.span
            className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 group-hover:w-[calc(100%-16px)] transition-all duration-300"
            style={{ transform: 'translateX(-50%)' }}
        />
    </Link>
)

export function Navbar() {
    const { data: session, status } = useSession()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { scrollY } = useScroll()

    const navOpacity = useTransform(scrollY, [0, 100], [0, 1])
    const navBlur = useTransform(scrollY, [0, 100], [0, 16])

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            <motion.nav
                className={cn(
                    "fixed top-4 left-4 right-4 z-50 transition-all duration-500 rounded-2xl border",
                    isScrolled
                        ? "border-white/10 bg-[#0a0612]/80 shadow-2xl shadow-purple-500/10"
                        : "border-transparent bg-transparent"
                )}
                style={{
                    backdropFilter: useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(20px)']),
                }}
            >
                {/* Animated Border Gradient on Scroll */}
                <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 pointer-events-none"
                    style={{ opacity: navOpacity }}
                />

                <div className="relative container mx-auto px-6 py-3 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <DevFlowLogo className="w-10 h-10" />
                        <div className="flex flex-col">
                            <span className="font-display font-bold text-lg text-white tracking-tight leading-none">
                                DevFlow
                            </span>
                            <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase">
                                Analytics
                            </span>
                        </div>
                    </Link>

                    {/* Center Navigation */}
                    <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <NavLink href="/#features">Features</NavLink>
                        <NavLink href="/#how-it-works">How it Works</NavLink>
                        <NavLink href="/#pricing">Pricing</NavLink>
                        <NavLink href="/blog">Blog</NavLink>
                    </div>

                    {/* Right Side CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        {status === 'loading' ? (
                            <div className="w-28 h-10 bg-white/5 animate-pulse rounded-xl" />
                        ) : session ? (
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </motion.button>
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all text-white/60 hover:text-white"
                                    title="Sign Out"
                                >
                                    <LogOut size={18} />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 p-[1px]">
                                    <div className="w-full h-full rounded-[10px] overflow-hidden bg-[#0a0612]">
                                        {session.user?.image ? (
                                            <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-white/10 text-sm font-bold text-white">
                                                {session.user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link href="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168,85,247,0.4)" }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] animate-gradient-x text-white text-sm font-medium shadow-lg shadow-purple-500/25 border border-white/10"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Get Started
                                    </motion.button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </motion.button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-24 left-4 right-4 z-40 bg-[#0a0612]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
                    >
                        <Link href="/#features" className="py-3 text-white/70 hover:text-white border-b border-white/5" onClick={() => setMobileMenuOpen(false)}>
                            Features
                        </Link>
                        <Link href="/#how-it-works" className="py-3 text-white/70 hover:text-white border-b border-white/5" onClick={() => setMobileMenuOpen(false)}>
                            How it Works
                        </Link>
                        <Link href="/#pricing" className="py-3 text-white/70 hover:text-white border-b border-white/5" onClick={() => setMobileMenuOpen(false)}>
                            Pricing
                        </Link>
                        <Link href="/blog" className="py-3 text-white/70 hover:text-white border-b border-white/5" onClick={() => setMobileMenuOpen(false)}>
                            Blog
                        </Link>
                        <div className="flex flex-col gap-3 mt-4">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium">
                                    Sign In
                                </button>
                            </Link>
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium flex items-center justify-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
