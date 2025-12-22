'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'
import { useScroll, useTransform, useSpring, motion } from 'framer-motion'

export function StarFieldBackground({ numStars = 6000 }) {
    const { scrollYProgress } = useScroll()

    // Slow, cinematic drift
    const warpSpeed = useSpring(useTransform(scrollYProgress, [0, 1], [0.05, 0.4]), {
        stiffness: 30,
        damping: 40
    })

    // Fade out starfield as user scrolls past Hero
    // Fully visible 0-15% scroll, fades to 0 by 30% scroll
    const opacity = useTransform(scrollYProgress, [0, 0.15, 0.30], [1, 1, 0])
    const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 })

    return (
        <motion.div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
                opacity: smoothOpacity,
                willChange: 'opacity'
            }}
        >
            {/* Pure black background that stays */}
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, #000000 0%, #050505 50%, #0a0a0a 100%)' }}
            />

            {/* Canvas with starfield */}
            <Canvas camera={{ position: [0, 0, 1], fov: 60 }}>
                <StarLayer count={numStars * 0.7} size={0.0012} color="#ffffff" speed={warpSpeed} speedMultiplier={1} opacity={0.6} />
                <StarLayer count={numStars * 0.2} size={0.002} color="#ffeedd" speed={warpSpeed} speedMultiplier={0.7} opacity={0.8} />
                <StarLayer count={numStars * 0.1} size={0.003} color="#ffcc99" speed={warpSpeed} speedMultiplier={0.5} opacity={0.5} />
            </Canvas>

            {/* Bottom gradient fade for smooth diffusion */}
            <div
                className="absolute inset-x-0 bottom-0 h-[40vh] pointer-events-none"
                style={{
                    background: 'linear-gradient(to top, #000000 0%, transparent 100%)'
                }}
            />
        </motion.div>
    )
}

interface StarLayerProps {
    count: number
    size: number
    color: string
    speed: any
    speedMultiplier: number
    opacity: number
}

function StarLayer({ count, size, color, speed, speedMultiplier, opacity }: StarLayerProps) {
    const ref = useRef<any>(null)

    const positions = useMemo(() => {
        const pos = new Float32Array(Math.floor(count) * 3)
        random.inSphere(pos, { radius: 2.2 })
        return pos
    }, [count])

    useFrame((state, delta) => {
        if (!ref.current) return

        const currentSpeed = speed.get()

        // Very slow, dreamy rotation for starry night feel
        ref.current.rotation.x -= delta * 0.003 * speedMultiplier
        ref.current.rotation.y -= delta * 0.005 * speedMultiplier

        // Gentle scroll-responsive drift
        ref.current.rotation.z += delta * currentSpeed * 0.02 * speedMultiplier

        // Subtle twinkling via z-oscillation
        const breathe = Math.sin(state.clock.elapsedTime * 0.3) * 0.01
        ref.current.position.z = breathe * speedMultiplier
    })

    return (
        <group rotation={[0, 0, Math.PI / 6]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color={color}
                    size={size}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={opacity}
                    blending={2}
                />
            </Points>
        </group>
    )
}
