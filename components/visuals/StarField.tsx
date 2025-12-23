'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'

export function StarField() {
    return (
        <div className="absolute inset-x-0 top-0 w-full h-[100vh] pointer-events-none [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
            <Canvas camera={{ position: [0, 0, 1] }} gl={{ toneMapping: 3 }}>{/* ACESFilmicToneMapping */}
                <StarFieldContent />
            </Canvas>
        </div>
    )
}

function StarFieldContent() {
    // Robust velocity tracking via DOM listener + Ref
    // This avoids re-rendering the Canvas parent
    const velocityRef = useRef(0.1)

    useEffect(() => {
        let lastScrollY = window.scrollY
        let lastTime = Date.now()

        const handleScroll = () => {
            const now = Date.now()
            const currentScrollY = window.scrollY
            const deltaY = Math.abs(currentScrollY - lastScrollY)
            const deltaTime = now - lastTime

            if (deltaTime > 0) {
                const vel = deltaY / deltaTime // px/ms
                // Target: Idle=0.1, Warp=5.0
                // Sensitivity: vel=2.0 (fast scroll) -> ~ 4.0
                const target = 0.1 + Math.min(vel * 3, 5)
                velocityRef.current = target
            }

            lastScrollY = currentScrollY
            lastTime = now
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return <StarLayer velocityRef={velocityRef} />
}

function StarLayer({ velocityRef }: { velocityRef: React.MutableRefObject<number> }) {
    const ref = useRef<any>()

    // Generate 4000 stars (Series A density)
    const sphere = useMemo(() => {
        const positions = new Float32Array(4000 * 3)
        return random.inSphere(positions, { radius: 1.8 }) as Float32Array
    }, [])

    // Smooth velocity tracker for visual decay
    const currentVelocity = useRef(0.1)

    useFrame((state, delta) => {
        if (!ref.current) return

        // 1. Decay the target velocity back to idle automatically
        // This ensures if scroll stops, we slow down even if no scroll event fires
        velocityRef.current += (0.1 - velocityRef.current) * 0.05

        // 2. Smoothly interpolate current velocity towards target (Spring-like lerp)
        currentVelocity.current += (velocityRef.current - currentVelocity.current) * 0.08

        const v = currentVelocity.current

        // 3. Application of velocity
        // Rotation on X/Y gives the "turning" feel
        // Movement on Z gives the "Warp" feel
        ref.current.rotation.x -= delta * v * 0.05
        ref.current.rotation.y -= delta * v * 0.1

        // Pulse effect based on speed - Stars get brighter/larger at warp speed
        // Actually, let's keep size uniform but maybe stretch them?
        // Stretching points is hard without custom shader.
        // Let's just scale the whole group slightly for impact.
        const s = 1 + (v - 0.1) * 0.3
        ref.current.scale.set(s, s, s)
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#ffffff"
                    size={0.0025} // Slightly larger for sparkle visibility
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={2} // Additive blending for "light" feel
                />
            </Points>
        </group>
    )
}
