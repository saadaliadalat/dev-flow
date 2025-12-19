'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Github, Menu, X, LogOut, LayoutDashboard, Sparkles, ChevronRight } from 'lucide-react'
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

// --- Magnetic Nav Link ---
const MagneticLink = ({ href, children, onMouseEnter, onMouseLeave, isActive }: any) => {
    return (
        <Link
            href={href}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 z-10"
        >
            {children}
            {isActive && (
                <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </Link>
    )
}

export function Navbar() {
    const { data: session, status } = useSession()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [hoveredNav, setHoveredNav] = useState<string | null>(null)
    const { scrollY } = useScroll()

    const navWidth = useTransform(scrollY, [0, 100], ['100%', '80%'])
    const navTop = useTransform(scrollY, [0, 100], ['24px', '16px'])
    const navBorderRadius = useTransform(scrollY, [0, 100], ['16px', '50px'])

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
                style={{ top: navTop }}
            >
                <motion.nav
                    style={{
                        width: isScrolled ? 'auto' : '100%',
                        maxWidth: isScrolled ? 'fit-content' : '1280px',
                        borderRadius: navBorderRadius
                    }}
                    className={cn(
                        "pointer-events-auto transition-all duration-500 border backdrop-blur-xl mx-4",
                        isScrolled
                            ? "border-white/10 bg-[#0a0612]/70 shadow-[0_8px_32px_rgb(0,0,0,0.4)] px-6 py-2" // Compact Island
                            : "border-transparent bg-transparent px-6 py-4" // Full Width
                    )}
                >
                    <div className="flex items-center justify-between gap-8">

                        {/* Logo Area */}
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <DevFlowLogo className="w-9 h-9" />
                            <AnimatePresence>
                                {!isScrolled && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="flex flex-col overflow-hidden whitespace-nowrap"
                                    >
                                        <span className="font-display font-bold text-lg text-white tracking-tight leading-none">
                                            DevFlow
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Link>

                        {/* Center Island Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {['Features', 'How it Works', 'Pricing', 'Blog'].map((item) => {
                                const slug = item.toLowerCase().replace(/\s+/g, '-')
                                const href = slug === 'blog' ? '/blog' : `/#${slug}`
                                return (
                                    <MagneticLink
                                        key={item}
                                        href={href}
                                        onMouseEnter={() => setHoveredNav(item)}
                                        onMouseLeave={() => setHoveredNav(null)}
                                        isActive={hoveredNav === item}
                                    >
                                        {item}
                                    </MagneticLink>
                                )
                            })}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                            {status === 'loading' ? (
                                <div className="w-24 h-9 bg-white/5 animate-pulse rounded-full" />
                            ) : session ? (
                                <div className="flex items-center gap-3">
                                    <Link href="/dashboard">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/5 transition-all"
                                        >
                                            <LayoutDashboard className="w-3.5 h-3.5" />
                                            Dashboard
                                        </motion.button>
                                    </Link>
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-[1px] cursor-pointer" onClick={() => signOut()}>
                                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0612]">
                                            {session.user?.image ? (
                                                <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/10 text-xs font-bold text-white">
                                                    {session.user?.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:block">
                                        Sign In
                                    </Link>
                                    <Link href="/login">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="group relative flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-sm font-bold shadow-lg shadow-white/20 hover:shadow-white/40 transition-shadow overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                Get Started <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 via-cyan-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </motion.button>
                                    </Link>
                                </>
                            )}

                            {/* Mobile Toggle */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="md:hidden w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/80"
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <Menu size={18} />
                            </motion.button>
                        </div>
                    </div>
                </motion.nav>
            </motion.div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="absolute top-0 right-0 bottom-0 w-[300px] bg-[#0a0612] border-l border-white/10 p-6 flex flex-col shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <DevFlowLogo className="w-8 h-8" />
                                    <span className="font-display font-bold text-lg text-white">DevFlow</span>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {['Features', 'How it Works', 'Pricing', 'Blog'].map((item) => (
                                    <Link
                                        key={item}
                                        href={item === 'Blog' ? '/blog' : `/#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="py-3 px-4 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium text-lg"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-auto flex flex-col gap-3">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full py-3 rounded-xl bg-white text-black font-bold">
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/20">
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
