'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { springs } from '@/lib/animations'

interface GlassCardProps {
    children: React.ReactNode
    hover?: boolean
    glow?: 'purple' | 'white' | 'none'
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
    const cardRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useSpring(0, { stiffness: 300, damping: 30 })
    const rotateY = useSpring(0, { stiffness: 300, damping: 30 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current || !hover) return

        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)

        const deltaX = (e.clientX - centerX) / (rect.width / 2)
        const deltaY = (e.clientY - centerY) / (rect.height / 2)
        rotateX.set(-deltaY * 3)
        rotateY.set(deltaX * 3)
    }

    const handleMouseLeave = () => {
        rotateX.set(0)
        rotateY.set(0)
    }

    const spotlightBackground = useTransform(
        [mouseX, mouseY],
        ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(124, 58, 237, 0.08), transparent 40%)`
    )

    const glowStyles = {
        purple: 'hover:shadow-purple',
        white: 'hover:shadow-glow',
        none: '',
    }

    return (
        <motion.div
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: hover ? rotateX : 0,
                rotateY: hover ? rotateY : 0,
                transformStyle: 'preserve-3d',
            }}
            whileHover={hover ? { scale: 1.01 } : undefined}
            whileTap={hover ? { scale: 0.99 } : undefined}
            transition={springs.snappy}
            className={cn(
                "glass-card relative overflow-hidden rounded-2xl p-6 md:p-8",
                "bg-gradient-to-br from-zinc-900/60 to-bg-deep/80",
                "border border-white/[0.06]",
                "backdrop-blur-xl",
                hover && "hover:border-purple-500/20 transition-all duration-500 cursor-pointer group",
                glowStyles[glow],
                className
            )}
        >
            {/* Spotlight effect */}
            {hover && (
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: spotlightBackground }}
                />
            )}

            {/* Gradient Mesh Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}
