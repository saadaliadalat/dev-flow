'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, LogOut, Zap, Menu, X } from 'lucide-react'
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
            <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Outer Ring */}
        <motion.circle
            cx="20" cy="20" r="18"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
            opacity="0.6"
        />

        {/* Solid Background */}
        <circle cx="20" cy="20" r="14" fill="#0a0612" />

        {/* The "D" Shape */}
        <path
            d="M14 12 L14 28 L20 28 C25 28 28 24 28 20 C28 16 25 12 20 12 L14 12 Z"
            fill="url(#logoGradient)"
        />

        {/* Pulse Dot */}
        <motion.circle
            cx="28" cy="12" r="2"
            fill="#06b6d4"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
    </motion.svg>
)

const NavLink = ({ href, children, isActive, onClick }: any) => (
    <Link
        href={href}
        onClick={onClick}
        className={cn(
            "relative px-4 py-1.5 text-sm font-medium transition-colors rounded-full z-10",
            isActive ? "text-white" : "text-white/60 hover:text-white"
        )}
    >
        {children}
        {isActive && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/10 rounded-full -z-10 backdrop-blur-sm border border-white/5"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
    </Link>
)

const MobileNavLink = ({ href, children, onClick }: any) => (
    <Link
        href={href}
        onClick={onClick}
        className="text-2xl font-medium text-white/70 hover:text-white transition-colors"
    >
        {children}
    </Link>
)

export function Navbar() {
    const { data: session, status } = useSession()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<string>('')
    const { scrollY } = useScroll()

    const navY = useTransform(scrollY, [0, 100], [24, 16])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
            const sections = ['features', 'how-it-works', 'pricing']
            const current = sections.find(section => {
                const el = document.getElementById(section)
                if (el) {
                    const rect = el.getBoundingClientRect()
                    return rect.top >= 0 && rect.top <= 400
                }
                return false
            })
            if (current) setActiveTab(current)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            {/* --- DESKTOP FLOATING DOCK --- */}
            <div className="hidden md:flex fixed top-0 left-0 right-0 z-50 justify-center pointer-events-none">
                <motion.nav
                    style={{ y: navY }}
                    className="pointer-events-auto"
                >
                    <div className={cn(
                        "relative flex items-center gap-2 p-2 rounded-full transition-all duration-500",
                        "bg-[#0a0612]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10"
                    )}>

                        {/* Logo Area - Icon Only */}
                        <Link href="/" className="pl-2 pr-2 flex items-center justify-center">
                            <DevFlowLogo className="w-9 h-9" />
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center">
                            {['Features', 'How it Works', 'Pricing', 'Blog'].map((item) => {
                                const slug = item.toLowerCase().replace(/\s+/g, '-')
                                return (
                                    <NavLink
                                        key={item}
                                        href={slug === 'blog' ? '/blog' : `/#${slug}`}
                                        isActive={activeTab === slug}
                                        onClick={() => setActiveTab(slug)}
                                    >
                                        {item}
                                    </NavLink>
                                )
                            })}
                        </div>

                        {/* Divider */}
                        <div className="w-[1px] h-6 bg-white/10 mx-2" />

                        {/* Actions */}
                        <div className="flex items-center gap-2 pr-1">
                            {status === 'loading' ? (
                                <div className="w-20 h-8 bg-white/5 animate-pulse rounded-full" />
                            ) : session ? (
                                <div className="flex items-center gap-2">
                                    <Link href="/dashboard">
                                        <div className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white" title="Dashboard">
                                            <LayoutDashboard size={18} />
                                        </div>
                                    </Link>
                                    <button onClick={() => signOut()} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white" title="Sign Out">
                                        <LogOut size={18} />
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-[1px] mx-1">
                                        <img
                                            src={session.user?.image || ''}
                                            alt="User"
                                            className="w-full h-full rounded-full bg-black object-cover"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className="px-3 text-sm font-medium text-white/70 hover:text-white transition-colors">
                                        Sign In
                                    </Link>
                                    <Link href="/login">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-shadow"
                                        >
                                            <Zap className="w-3 h-3 text-purple-600 fill-purple-600" />
                                            <span>Start</span>
                                        </motion.button>
                                    </Link>
                                </>
                            )}
                        </div>

                    </div>
                </motion.nav>
            </div>

            {/* --- MOBILE NAVBAR --- */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
                <div className="pointer-events-auto flex items-center justify-between p-4 rounded-2xl bg-[#0a0612]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <Link href="/" className="flex items-center gap-2">
                        <DevFlowLogo className="w-8 h-8" />
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-white"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* --- MOBILE MENU OVERLAY --- */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl md:hidden flex flex-col p-6"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <span className="font-display font-bold text-2xl text-white">Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 items-start">
                            {['Features', 'How it Works', 'Pricing', 'Blog'].map((item) => (
                                <MobileNavLink
                                    key={item}
                                    href={item === 'Blog' ? '/blog' : `/#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item}
                                </MobileNavLink>
                            ))}
                        </div>

                        <div className="mt-auto flex flex-col gap-4">
                            {!session ? (
                                <>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <button className="w-full py-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5">
                                            Sign In
                                        </button>
                                    </Link>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <button className="w-full py-4 rounded-xl bg-white text-black font-bold">
                                            Get Started
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold">
                                        Go to Dashboard
                                    </button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
