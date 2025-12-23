'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const companies = [
    { name: 'Vercel', logo: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png' },
    { name: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
    { name: 'Raycast', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Raycast_logo_icon.png/1024px-Raycast_logo_icon.png' },
    { name: 'Linear', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Linear_logo.svg/1024px-Linear_logo.svg.png' },
    { name: 'GitHub', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' },
]

export const TrustedBy = () => {
    return (
        <section className="relative py-12 border-t border-b border-white/[0.05] bg-black/50 backdrop-blur-sm z-20">
            <div className="container mx-auto px-6">
                <p className="text-center text-sm font-medium text-zinc-500 mb-8 uppercase tracking-widest">
                    Trusted by engineering leaders at
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" /></svg>
                        <span>Vercel</span>
                    </div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>Stripe</span>
                    </div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>Raycast</span>
                    </div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>Linear</span>
                    </div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6" height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                        <span>GitHub</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
