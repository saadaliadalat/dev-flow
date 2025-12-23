'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function ScrollTiltWrapper({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["0 1", "0.2 1"]
    })

    const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0])
    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
    const y = useTransform(scrollYProgress, [0, 1], [100, 0])

    return (
        <motion.div
            ref={ref}
            style={{ rotateX, opacity, y, transformStyle: "preserve-3d", perspective: 1200 }}
        >
            {children}
        </motion.div>
    )
}
