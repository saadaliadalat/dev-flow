'use client'

import { ReactNode, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxLayerProps {
    children: ReactNode
    /** Parallax speed: 0 = fixed, 0.5 = half speed, 1 = normal, 2 = double */
    speed?: number
    /** Additional className */
    className?: string
    /** Disable on mobile for performance */
    disableOnMobile?: boolean
}

/**
 * ParallaxLayer - Applies scroll-based parallax transform to children
 * @param speed - 0.3 = slow (background), 0.7 = medium, 1.0 = normal
 */
export function ParallaxLayer({
    children,
    speed = 0.5,
    className = '',
    disableOnMobile = true
}: ParallaxLayerProps) {
    const ref = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // Calculate parallax offset based on speed
    // speed < 1 = slower than scroll (feels like background)
    // speed > 1 = faster than scroll (feels like foreground)
    const yOffset = useTransform(
        scrollYProgress,
        [0, 1],
        [100 * (1 - speed), -100 * (1 - speed)]
    )

    return (
        <motion.div
            ref={ref}
            style={{ y: yOffset }}
            className={`${className} ${disableOnMobile ? 'motion-reduce:transform-none' : ''}`}
        >
            {children}
        </motion.div>
    )
}
