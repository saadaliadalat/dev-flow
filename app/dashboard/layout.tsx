'use client'

import React from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { motion } from 'framer-motion'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-bg-deepest text-text-primary">
            <Navbar /> {/* Reusing the Landing Navbar for now - consistency */}
            <div className="pt-24 pb-12 px-6">
                {children}
            </div>
        </div>
    )
}
