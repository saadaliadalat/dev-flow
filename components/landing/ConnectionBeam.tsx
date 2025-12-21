'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export function ConnectionBeam() {
    const { scrollYProgress } = useScroll()
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const [bgHeight, setBgHeight] = useState(0)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current) {
            setBgHeight(document.body.scrollHeight)
        }
    }, [])

    return (
        <div ref={ref} className="fixed left-0 top-0 bottom-0 w-px z-[0] pointer-events-none hidden md:block">
            {/* The Track */}
            <div className="absolute top-0 bottom-0 left-8 md:left-12 lg:left-24 w-px bg-white/5" />

            {/* The Beam */}
            <motion.div
                className="absolute top-0 left-8 md:left-12 lg:left-24 w-px bg-gradient-to-b from-purple-500 via-cyan-400 to-purple-500 origin-top shadow-[0_0_40px_rgba(34,211,238,0.5)]"
                style={{ scaleY, height: '100vh' }}
            />

            {/* The Head Particle */}
            <motion.div
                className="absolute left-8 md:left-12 lg:left-24 -ml-[2.5px] w-[6px] h-[30px] rounded-full bg-cyan-400 blur-[2px] shadow-[0_0_20px_rgba(34,211,238,1)] z-10"
                style={{ top: useTransform(scaleY, value => `${value * 100}vh`) }}
            />
        </div>
    )
}
