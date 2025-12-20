'use client'

import React from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Heart } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-mono font-bold text-lg">
                                D
                            </div>
                            <span className="font-bold text-xl text-white">DevFlow</span>
                        </Link>
                        <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                            The intelligent analytics platform for high-performance engineering teams.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Github size={18} />} href="#" />
                            <SocialIcon icon={<Twitter size={18} />} href="#" />
                            <SocialIcon icon={<Linkedin size={18} />} href="#" />
                        </div>
                    </div>

                    {/* Columns */}
                    <FooterColumn title="Product">
                        <FooterLink href="#features">Features</FooterLink>
                        <FooterLink href="#pricing">Pricing</FooterLink>
                        <FooterLink href="/changelog">Changelog</FooterLink>
                        <FooterLink href="/docs">Documentation</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Company">
                        <FooterLink href="/about">About</FooterLink>
                        <FooterLink href="/blog">Blog</FooterLink>
                        <FooterLink href="/careers">Careers</FooterLink>
                        <FooterLink href="/contact">Contact</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Legal">
                        <FooterLink href="/privacy">Privacy</FooterLink>
                        <FooterLink href="/terms">Terms</FooterLink>
                        <FooterLink href="/security">Security</FooterLink>
                        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-500 text-xs font-medium">All Systems Normal</span>
                        </div>
                    </FooterColumn>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-600">
                    <p>© {new Date().getFullYear()} DevFlow Inc. All rights reserved.</p>
                    <div className="flex items-center gap-1">
                        Made with <Heart size={12} className="text-red-500 fill-red-500" /> by Developers, for Developers.
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterColumn({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div>
            <h4 className="font-bold text-white mb-6">{title}</h4>
            <ul className="space-y-4">{children}</ul>
        </div>
    )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-zinc-500 hover:text-white transition-colors text-sm">
                {children}
            </Link>
        </li>
    )
}

function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-black transition-all"
        >
            {icon}
        </a>
    )
}
