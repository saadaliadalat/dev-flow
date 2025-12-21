'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cardVariants, springs } from '@/lib/animations'

interface BentoCardProps {
    title: string
    description: string
    icon: React.ReactNode
    size?: 'small' | 'medium' | 'large'
    gradient?: 'purple' | 'silver' | 'subtle'
    className?: string
    children?: React.ReactNode
    index?: number
}

export function BentoCard({
    title,
    description,
    icon,
    size = 'small',
    gradient = 'purple',
    className,
    children,
    index = 0,
}: BentoCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    // Mouse position for spotlight effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth spring values for rotation
    const rotateX = useSpring(0, { stiffness: 300, damping: 30 })
    const rotateY = useSpring(0, { stiffness: 300, damping: 30 })

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return

        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        // Update spotlight position
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)

        // Update rotation (subtle 3D tilt)
        const deltaX = (e.clientX - centerX) / (rect.width / 2)
        const deltaY = (e.clientY - centerY) / (rect.height / 2)
        rotateX.set(-deltaY * 5)
        rotateY.set(deltaX * 5)
    }

    const handleMouseLeave = () => {
        rotateX.set(0)
        rotateY.set(0)
        setIsHovered(false)
    }

    const sizeClasses = {
        small: "col-span-1",
        medium: "col-span-1 md:col-span-2",
        large: "col-span-1 md:col-span-3"
    }

    const gradientStyles = {
        purple: 'from-purple-600 to-purple-800',
        silver: 'from-zinc-400 to-zinc-600',
        subtle: 'from-zinc-700 to-zinc-800',
    }

    // Spotlight gradient based on mouse position
    const spotlightBackground = useTransform(
        [mouseX, mouseY],
        ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(124, 58, 237, 0.1), transparent 40%)`
    )

    return (
        <motion.div
            ref={cardRef}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                perspective: 1000,
            }}
            transition={{ delay: index * 0.1 }}
            className={cn(
                "group relative flex flex-col justify-between h-full min-h-[260px]",
                "rounded-2xl p-6 md:p-8",
                "bg-gradient-to-br from-zinc-900/80 to-bg-deep/90",
                "border border-white/[0.06] hover:border-purple-500/20",
                "backdrop-blur-xl overflow-hidden",
                "transition-colors duration-500",
                sizeClasses[size],
                className
            )}
        >
            {/* Spotlight effect */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: spotlightBackground }}
            />

            {/* Ambient glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-transparent blur-xl" />
            </div>

            {/* Corner gradient accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between mb-4">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={springs.snappy}
                    className={cn(
                        "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                        gradientStyles[gradient],
                        "shadow-purple-500/20"
                    )}
                >
                    <div className="w-5 h-5 text-white">
                        {icon}
                    </div>
                </motion.div>
            </div>

            {/* Content */}
            <div className="relative z-10 mt-auto">
                <motion.h3
                    className="text-xl font-bold font-display text-white mb-2 group-hover:text-purple-300 transition-colors duration-300"
                >
                    {title}
                </motion.h3>
                <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                    {description}
                </p>
            </div>

            {/* Visual / Children */}
            {children && (
                <div className="absolute right-0 top-1/4 w-1/2 h-full opacity-30 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 pointer-events-none">
                    {children}
                </div>
            )}

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    )
}
