'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GradientButton } from '@/components/ui/GradientButton'
import { Github, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { scrollY } = useScroll()

    const navBackground = useTransform(
        scrollY,
        [0, 50],
        ['rgba(10, 10, 15, 0)', 'rgba(10, 10, 15, 0.8)']
    )

    const navBackdrop = useTransform(
        scrollY,
        [0, 50],
        ['blur(0px)', 'blur(12px)']
    )

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.nav
            style={{ backgroundColor: navBackground, backdropFilter: navBackdrop }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled ? "border-glass-border py-4" : "border-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                        D
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight">DevFlow</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'How it Works', 'Pricing', 'Blog'].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase().replace(' ', '-')}`}
                            className="text-sm font-medium text-text-secondary hover:text-white transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
                        Sign In
                    </Link>
                    <GradientButton size="sm" icon={<Github className="w-4 h-4" />}>
                        Get Started
                    </GradientButton>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-text-secondary hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 bg-bg-deep border-b border-glass-border p-6 md:hidden flex flex-col gap-4 shadow-2xl"
                >
                    {['Features', 'How it Works', 'Pricing', 'Blog'].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase().replace(' ', '-')}`}
                            className="py-2 text-text-secondary hover:text-white border-b border-glass-border/50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 mt-4">
                        <GradientButton variant="secondary" onClick={() => setMobileMenuOpen(false)}>
                            Sign In
                        </GradientButton>
                        <GradientButton icon={<Github className="w-4 h-4" />} onClick={() => setMobileMenuOpen(false)}>
                            Get Started
                        </GradientButton>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    )
}
