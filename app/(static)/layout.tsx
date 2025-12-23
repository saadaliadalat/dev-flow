'use client'

import React from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export default function StaticLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-bg-deepest text-text-primary selection:bg-purple-500/30">
            <Navbar />
            <main className="pt-24 pb-12">
                {children}
            </main>
            <Footer />
        </div>
    )
}
