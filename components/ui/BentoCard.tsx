'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GlassCard } from './GlassCard'

interface BentoCardProps {
    title: string
    description: string
    icon: React.ReactNode
    size?: 'small' | 'medium' | 'large'
    gradient?: string
    className?: string
    children?: React.ReactNode
}

export function BentoCard({
    title,
    description,
    icon,
    size = 'small',
    gradient = "from-cyan-500/20 to-blue-500/20",
    className,
    children
}: BentoCardProps) {

    const sizeClasses = {
        small: "col-span-1",
        medium: "col-span-1 md:col-span-2",
        large: "col-span-1 md:col-span-3"
    }

    return (
        <GlassCard
            className={cn(
                "group flex flex-col justify-between h-full min-h-[240px]",
                sizeClasses[size],
                className
            )}
            glow="cyan"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg",
                    gradient
                )}>
                    {icon}
                </div>
            </div>

            {/* Content */}
            <div className="mt-auto relative z-10">
                <h3 className="text-xl font-bold font-display text-text-primary mb-2 group-hover:text-cyan-400 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Visual / Children */}
            {children && (
                <div className="absolute right-0 top-1/4 w-1/2 h-full opacity-30 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 mask-gradient pointer-events-none">
                    {children}
                </div>
            )}
        </GlassCard>
    )
}
