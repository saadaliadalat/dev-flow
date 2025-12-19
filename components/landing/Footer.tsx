import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-bg-deep border-t border-glass-border pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                                D
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight text-white">DevFlow</span>
                        </Link>
                        <p className="text-text-tertiary text-sm leading-relaxed mb-6">
                            Spotify Wrapped for Developers. <br />
                            Track, improve, and share your coding journey.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary hover:bg-cyan-500 hover:text-white transition-all">
                                <Github size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary hover:bg-cyan-500 hover:text-white transition-all">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary hover:bg-cyan-500 hover:text-white transition-all">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div key="Product">
                        <h4 className="font-bold text-white mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li><Link href="/#features" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Features</Link></li>
                            <li><Link href="/#pricing" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Pricing</Link></li>
                            <li><Link href="/changelog" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Changelog</Link></li>
                            <li><Link href="/roadmap" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Roadmap</Link></li>
                        </ul>
                    </div>
                    <div key="Company">
                        <h4 className="font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">About</Link></li>
                            <li><Link href="/blog" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div key="Resources">
                        <h4 className="font-bold text-white mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link href="/docs" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Documentation</Link></li>
                            <li><Link href="/docs" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">API Reference</Link></li>
                            <li><Link href="/support" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Support</Link></li>
                            <li><Link href="/status" className="text-text-tertiary text-sm hover:text-cyan-400 transition-colors">Status</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-glass-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
                    <p>© {new Date().getFullYear()} DevFlow. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-text-secondary">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-text-secondary">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
