'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface DashboardPageHeaderProps {
    title: string
    description?: string
    backLink?: string
    backLabel?: string
}

export function DashboardPageHeader({
    title,
    description,
    backLink = '/dashboard',
    backLabel = 'Back to Dashboard',
}: DashboardPageHeaderProps) {
    return (
        <div className="mb-8">
            <Link
                href={backLink}
                className="inline-flex items-center gap-2 text-sm text-text-tertiary hover:text-white transition-colors mb-4 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                {backLabel}
            </Link>
            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-display font-bold text-white mb-2"
            >
                {title}
            </motion.h1>
            {description && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-text-secondary"
                >
                    {description}
                </motion.p>
            )}
        </div>
    )
}
