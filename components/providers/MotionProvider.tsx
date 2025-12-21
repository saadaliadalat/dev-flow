'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { MotionConfig } from 'framer-motion'
import type { Transition, Variants } from 'framer-motion'

// === MOTION SYSTEM CONFIGURATION ===

// Spring configurations for different interaction types
export const springs = {
    // Soft ambient motion (slow, continuous)
    ambient: { type: 'spring', stiffness: 50, damping: 20, mass: 1 } as const,
    // Default interaction spring
    default: { type: 'spring', stiffness: 300, damping: 30, mass: 1 } as const,
    // Snappy feedback for intent (hover, click)
    snappy: { type: 'spring', stiffness: 400, damping: 25, mass: 0.8 } as const,
    // Bouncy for playful elements
    bouncy: { type: 'spring', stiffness: 500, damping: 15, mass: 0.5 } as const,
    // Smooth for transitions
    smooth: { type: 'spring', stiffness: 200, damping: 30, mass: 1 } as const,
}

// Easing curves matching CSS variables
export const easings = {
    outExpo: [0.16, 1, 0.3, 1] as const,
    outQuart: [0.25, 1, 0.5, 1] as const,
    inOutQuart: [0.76, 0, 0.24, 1] as const,
    springBounce: [0.34, 1.56, 0.64, 1] as const,
}

// Common transition presets
export const transitions: Record<string, Transition> = {
    // Fast feedback transitions
    fast: { duration: 0.15, ease: easings.outExpo },
    // Standard transitions
    default: { duration: 0.3, ease: easings.outQuart },
    // Smooth, deliberate transitions
    smooth: { duration: 0.5, ease: easings.outQuart },
    // Slow ambient transitions
    slow: { duration: 0.8, ease: easings.outQuart },
    // Spring-based
    spring: springs.default,
    springSnappy: springs.snappy,
    springAmbient: springs.ambient,
}

// === REUSABLE VARIANTS ===

export const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: transitions.smooth,
    },
}

export const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: transitions.smooth,
    },
}

export const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: springs.default,
    },
}

export const staggerContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
}

export const hoverLiftVariants: Variants = {
    rest: {
        y: 0,
        scale: 1,
        transition: springs.default,
    },
    hover: {
        y: -4,
        scale: 1.02,
        transition: springs.snappy,
    },
    tap: {
        scale: 0.98,
        transition: { duration: 0.1 },
    },
}

export const glowVariants: Variants = {
    rest: {
        boxShadow: '0 0 0 rgba(124, 58, 237, 0)',
    },
    hover: {
        boxShadow: '0 0 40px -10px rgba(124, 58, 237, 0.5)',
        transition: { duration: 0.3 },
    },
}

// Magnetic button effect variants
export const magneticVariants: Variants = {
    rest: { x: 0, y: 0 },
    hover: {
        transition: springs.snappy,
    },
}

// === CONTEXT ===

interface MotionContextValue {
    reducedMotion: boolean
    springs: typeof springs
    easings: typeof easings
    transitions: typeof transitions
}

const MotionContext = createContext<MotionContextValue>({
    reducedMotion: false,
    springs,
    easings,
    transitions,
})

export const useMotion = () => useContext(MotionContext)

// === PROVIDER COMPONENT ===

interface MotionProviderProps {
    children: React.ReactNode
    reducedMotion?: boolean
}

export function MotionProvider({ children, reducedMotion = false }: MotionProviderProps) {
    const contextValue = useMemo(() => ({
        reducedMotion,
        springs,
        easings,
        transitions,
    }), [reducedMotion])

    return (
        <MotionContext.Provider value={contextValue}>
            <MotionConfig
                reducedMotion={reducedMotion ? 'always' : 'never'}
                transition={transitions.default}
            >
                {children}
            </MotionConfig>
        </MotionContext.Provider>
    )
}

// === UTILITY HOOKS ===

// Hook for creating staggered children animations
export function useStaggerAnimation(itemCount: number, baseDelay = 0.1) {
    return useMemo(() => ({
        container: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: baseDelay,
                    delayChildren: 0.1,
                },
            },
        },
        item: slideUpVariants,
    }), [itemCount, baseDelay])
}

// Hook for scroll-triggered animations
export function useScrollAnimation() {
    return {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-100px' },
    }
}
