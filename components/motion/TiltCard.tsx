'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TiltCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
    className?: string
    glareColor?: string
}

export function TiltCard({
    children,
    className,
    glareColor = "rgba(255, 255, 255, 0.1)",
    ...props
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null)

    // Mouse position state
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Smooth physics for the tilt
    const mouseX = useSpring(x, { stiffness: 200, damping: 20, mass: 1 })
    const mouseY = useSpring(y, { stiffness: 200, damping: 20, mass: 1 })

    // Calculate rotation based on mouse position
    // Max rotation: 2.5 degrees as requested
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [2.5, -2.5])
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-2.5, 2.5])

    // Glare positioning - moves opposite to rotation
    const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"])
    const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"])
    const glareOpacity = useTransform(mouseX, [-0.5, 0, 0.5], [0, 0.6, 0]) // Visible mostly on sides

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        const mouseXFromCenter = e.clientX - rect.left - width / 2
        const mouseYFromCenter = e.clientY - rect.top - height / 2

        // Normalize to -0.5 to 0.5
        x.set(mouseXFromCenter / width)
        y.set(mouseYFromCenter / height)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000
            }}
            className={cn("relative will-change-transform", className)}
            {...props}
        >
            {/* Content */}
            <div style={{ transform: "translateZ(20px)" }} className="relative z-10 w-full h-full">
                {children}
            </div>

            {/* Glare Overlay */}
            <motion.div
                className="absolute inset-0 z-20 pointer-events-none rounded-[inherit] mix-blend-overlay"
                style={{
                    background: `radial-gradient(circle at ${glareX} ${glareY}, ${glareColor}, transparent 80%)`,
                    opacity: useTransform(mouseX, (value) => Math.abs(value) * 0.8) // Only show when tilting
                }}
            />
        </motion.div>
    )
}
