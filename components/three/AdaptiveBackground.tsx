'use client'

import React, { useState, useEffect, lazy, Suspense } from 'react'
import { HeroBackgroundFallback } from './HeroBackground'

// Lazy load the 3D background to prevent blocking
const HeroBackground = lazy(() =>
    import('./HeroBackground').then(mod => ({ default: mod.HeroBackground }))
)

interface AdaptiveBackgroundProps {
    className?: string
}

export function AdaptiveBackground({ className = '' }: AdaptiveBackgroundProps) {
    const [canUse3D, setCanUse3D] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        // Check for WebGL support and device capability
        const checkCapability = () => {
            try {
                const canvas = document.createElement('canvas')
                const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

                if (!gl) {
                    return false
                }

                // Check for reduced motion preference
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                if (prefersReducedMotion) {
                    return false
                }

                // Check device memory (if available)
                const nav = navigator as Navigator & { deviceMemory?: number }
                if (nav.deviceMemory && nav.deviceMemory < 4) {
                    return false
                }

                // Check for mobile devices with lower capability
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                const isLowPowerMode = (navigator as Navigator & { getBattery?: () => Promise<{ charging: boolean; level: number }> }).getBattery

                // On mobile, be more conservative
                if (isMobile) {
                    // Still allow 3D on high-end mobile devices
                    const pixelRatio = window.devicePixelRatio || 1
                    return pixelRatio >= 2
                }

                return true
            } catch {
                return false
            }
        }

        const capable = checkCapability()
        setCanUse3D(capable)
        setIsLoaded(true)
    }, [])

    if (!isLoaded) {
        // Show nothing during capability check to prevent flash
        return <div className={`absolute inset-0 bg-bg-deepest ${className}`} />
    }

    if (!canUse3D) {
        return <HeroBackgroundFallback />
    }

    return (
        <Suspense fallback={<HeroBackgroundFallback />}>
            <HeroBackground className={className} />
        </Suspense>
    )
}
