'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Heart, Zap } from 'lucide-react'
import { DevFlowLogo } from '@/components/ui/DevFlowLogo'

const footerLinks = {
    product: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Changelog', href: '/changelog' },
        { name: 'Roadmap', href: '/roadmap' },
    ],
    company: [
        { name: 'About', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
    ],
    legal: [
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/terms' },
        { name: 'Security', href: '/security' },
    ],
}

const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
]

export function Footer() {
    return (
        <footer className="relative border-t border-white/[0.06] bg-[#050508]">
            {/* Gradient Top Border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <div className="container mx-auto px-6 pt-16 pb-8">
                {/* Main Grid */}
                <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="col-span-2 md:col-span-4">
                        <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
                            <div className="relative p-1.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all duration-300">
                                <DevFlowLogo className="w-5 h-5" />
                                <div className="absolute inset-0 bg-white/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                            </div>
                            <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-purple-100 transition-colors">
                                DevFlow
                            </span>
                        </Link>
                        <p className="text-sm text-zinc-500 leading-relaxed mb-6 max-w-xs">
                            The intelligent analytics platform for high-performance engineering teams.
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300"
                                    aria-label={social.label}
                                >
                                    <social.icon size={16} strokeWidth={1.5} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="col-span-1 md:col-span-2">
                        <FooterColumn title="Product" links={footerLinks.product} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <FooterColumn title="Company" links={footerLinks.company} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <FooterColumn title="Legal" links={footerLinks.legal} />
                    </div>

                    {/* Status Section */}
                    <div className="col-span-2 md:col-span-2 flex flex-col items-start md:items-end">
                        <motion.div
                            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20"
                            whileHover={{ scale: 1.02 }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-emerald-400 text-xs font-medium tracking-wide">All Systems Operational</span>
                        </motion.div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-8" />

                {/* Bottom Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
                    <p>© {new Date().getFullYear()} DevFlow Inc. All rights reserved.</p>
                    <div className="flex items-center gap-1.5">
                        <span>Crafted with</span>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Heart size={12} className="text-red-500 fill-red-500" />
                        </motion.div>
                        <span>for developers, by developers.</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterColumn({ title, links }: { title: string; links: { name: string; href: string }[] }) {
    return (
        <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">{title}</h4>
            <ul className="space-y-3">
                {links.map((link) => (
                    <li key={link.name}>
                        <Link
                            href={link.href}
                            className="text-sm text-zinc-500 hover:text-white transition-colors duration-200 relative group"
                        >
                            <span className="relative z-10">{link.name}</span>
                            <span className="absolute left-0 bottom-0 w-0 h-px bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
