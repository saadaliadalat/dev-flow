'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { hoverVariants } from '@/lib/animations'

interface GlassCardProps {
    children: React.ReactNode
    hover?: boolean
    glow?: 'cyan' | 'purple' | 'none'
    className?: string
    onClick?: () => void
}

export function GlassCard({
    children,
    hover = true,
    glow = 'none',
    className,
    onClick
}: GlassCardProps) {
    return (
        <motion.div
            variants={hover ? hoverVariants : undefined}
            initial="rest"
            whileHover={hover ? "hover" : "rest"}
            whileTap={hover ? "tap" : "rest"}
            onClick={onClick}
            className={cn(
                "glass-card relative overflow-hidden rounded-2xl p-6 md:p-8",
                hover && "glass-card-hover cursor-pointer",
                glow === 'cyan' && "hover:shadow-[0_0_30px_-5px_var(--cyan-glow)]",
                glow === 'purple' && "hover:shadow-[0_0_30px_-5px_var(--purple-glow)]",
                className
            )}
        >
            {/* Gradient Mesh Overlay - Subtle */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}
