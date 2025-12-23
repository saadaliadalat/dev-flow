'use client'

import React from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-bg-deepest text-text-primary flex relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-noise pointer-events-none z-0 opacity-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Sidebar (Desktop) */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 md:pl-[280px] p-4 md:p-4 h-screen overflow-y-auto custom-scrollbar">
                {/* Content Wrapper */}
                <div className="max-w-7xl mx-auto min-h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
