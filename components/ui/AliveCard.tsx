'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SPRINGS } from '@/lib/motion'

interface AliveCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    glass?: boolean
}

export function AliveCard({ children, className, glass = false, ...props }: AliveCardProps) {
    const mouseX = useSpring(0, SPRINGS.fluid)
    const mouseY = useSpring(0, SPRINGS.fluid)

    // Internal state for raw values to avoid react re-renders if possible, 
    // but specific implementation handles it via Motion values

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    return (
        <motion.div
            className={cn(
                "group relative border rounded-3xl overflow-hidden transition-colors",
                glass
                    ? "bg-glass-bg border-glass-border hover:border-violet-500/30"
                    : "bg-zinc-900/40 border-white/5 hover:border-violet-500/20",
                className
            )}
            onMouseMove={onMouseMove}
            whileHover={{ scale: 1.005, transition: SPRINGS.micro }}
            {...props as any}
        >
            {/* 🔦 Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            var(--spotlight-color, rgba(124, 58, 237, 0.1)),
                            transparent 80%
                        )
                    `
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>

            {/* Noise Texture */}
            <div className="absolute inset-0 bg-void-noise opacity-[0.02] pointer-events-none mix-blend-overlay" />
        </motion.div>
    )
}
