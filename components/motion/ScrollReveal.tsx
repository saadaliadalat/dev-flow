'use client'

import { ReactNode, useRef } from 'react'
import { motion, useInView, Variants } from 'framer-motion'

interface ScrollRevealProps {
    children: ReactNode
    /** Delay before animation starts (seconds) */
    delay?: number
    /** Direction the element comes from */
    direction?: 'up' | 'down' | 'left' | 'right'
    /** Animation duration */
    duration?: number
    /** Additional className */
    className?: string
    /** Once triggered, stay visible */
    once?: boolean
    /** Viewport margin for trigger */
    margin?: string
}

const directionOffsets = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 }
}

/**
 * ScrollReveal - Animates children into view when scrolled into viewport
 */
export function ScrollReveal({
    children,
    delay = 0,
    direction = 'up',
    duration = 0.6,
    className = '',
    once = true,
    margin = "-100px"
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once, margin: margin as any })

    const offset = directionOffsets[direction]

    const variants: Variants = {
        hidden: {
            opacity: 0,
            x: offset.x,
            y: offset.y,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1] // Smooth easeOutExpo
            }
        }
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * ScrollRevealGroup - Container that staggers children animations
 */
export function ScrollRevealGroup({
    children,
    staggerDelay = 0.1,
    className = ''
}: {
    children: ReactNode
    staggerDelay?: number
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: staggerDelay
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
            className={className}
        >
            {children}
        </motion.div>
    )
}
