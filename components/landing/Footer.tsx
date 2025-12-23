'use client'

import React from 'react'
import Link from 'next/link'

export function Footer() {
    return (
        <footer className="bg-black/50 border-t border-white/5 py-8 backdrop-blur-sm relative z-10">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-white font-mono font-bold text-xs border border-white/10">
                        D
                    </div>
                    <span className="text-sm font-medium text-zinc-500">© 2024 DevFlow Inc.</span>
                </div>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                    <FooterLink href="#features">Features</FooterLink>
                    <FooterLink href="#pricing">Pricing</FooterLink>
                    <FooterLink href="/about">About</FooterLink>
                    <FooterLink href="/blog">Blog</FooterLink>
                    <FooterLink href="/privacy">Privacy</FooterLink>
                    <FooterLink href="/terms">Terms</FooterLink>
                </div>
            </div>
        </footer>
    )
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm text-slate-600 hover:text-slate-400 transition-colors font-medium"
        >
            {children}
        </Link>
    )
}
