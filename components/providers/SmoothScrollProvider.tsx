'use client'

import { ReactNode, useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        // Initialize Lenis with premium feel settings
        const lenis = new Lenis({
            duration: 1.2, // Slightly dampened for premium feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth exponential easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2, // Touch support enabled
        })

        lenisRef.current = lenis

        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        // Cleanup on unmount
        return () => {
            lenis.destroy()
            lenisRef.current = null
        }
    }, [])

    return <>{children}</>
}
