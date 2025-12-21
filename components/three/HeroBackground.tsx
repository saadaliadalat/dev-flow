'use client'

import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// === FLOATING GEOMETRY PARTICLES ===

function FloatingParticles({ count = 100 }: { count?: number }) {
    const mesh = useRef<THREE.InstancedMesh>(null)
    const { viewport } = useThree()

    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * viewport.width * 2
            const y = (Math.random() - 0.5) * viewport.height * 2
            const z = (Math.random() - 0.5) * 10 - 5
            const scale = Math.random() * 0.02 + 0.005
            const speed = Math.random() * 0.5 + 0.2
            const offset = Math.random() * Math.PI * 2
            temp.push({ x, y, z, scale, speed, offset })
        }
        return temp
    }, [count, viewport])

    useFrame((state) => {
        if (!mesh.current) return
        const time = state.clock.elapsedTime

        particles.forEach((particle, i) => {
            const matrix = new THREE.Matrix4()
            const position = new THREE.Vector3(
                particle.x + Math.sin(time * particle.speed + particle.offset) * 0.3,
                particle.y + Math.cos(time * particle.speed * 0.7 + particle.offset) * 0.2,
                particle.z
            )
            matrix.setPosition(position)
            matrix.scale(new THREE.Vector3(particle.scale, particle.scale, particle.scale))
            mesh.current!.setMatrixAt(i, matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#7C3AED" transparent opacity={0.3} />
        </instancedMesh>
    )
}

// === ABSTRACT CODE GRID ===

function CodeGrid() {
    const gridRef = useRef<THREE.Group>(null)
    const { viewport } = useThree()

    const lines = useMemo(() => {
        const temp = []
        const spacing = 1.5
        const countX = Math.ceil(viewport.width / spacing) + 4
        const countY = Math.ceil(viewport.height / spacing) + 4

        // Horizontal lines
        for (let i = 0; i < countY; i++) {
            const y = (i - countY / 2) * spacing
            const length = Math.random() * 3 + 1
            const x = (Math.random() - 0.5) * viewport.width
            temp.push({ x, y, length, horizontal: true, delay: Math.random() * 10 })
        }

        // Vertical lines
        for (let i = 0; i < countX; i++) {
            const x = (i - countX / 2) * spacing
            const length = Math.random() * 2 + 0.5
            const y = (Math.random() - 0.5) * viewport.height
            temp.push({ x, y, length, horizontal: false, delay: Math.random() * 10 })
        }

        return temp
    }, [viewport])

    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.02
        }
    })

    return (
        <group ref={gridRef} position={[0, 0, -8]}>
            {lines.map((line, i) => (
                <mesh key={i} position={[line.x, line.y, 0]} rotation={[0, 0, line.horizontal ? 0 : Math.PI / 2]}>
                    <planeGeometry args={[line.length, 0.01]} />
                    <meshBasicMaterial color="#A855F7" transparent opacity={0.08} />
                </mesh>
            ))}
        </group>
    )
}

// === AMBIENT ORB ===

function AmbientOrb({ position, scale = 1, color = '#7C3AED' }: { position: [number, number, number], scale?: number, color?: string }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.2
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.1
            meshRef.current.rotation.z = state.clock.elapsedTime * 0.05
        }
    })

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <icosahedronGeometry args={[1, 1]} />
                <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
            </mesh>
        </Float>
    )
}

// === GRADIENT PLANE ===

function GradientPlane() {
    const meshRef = useRef<THREE.Mesh>(null)

    const gradientMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color('#7C3AED') },
                uColor2: { value: new THREE.Color('#A855F7') },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                varying vec2 vUv;

                void main() {
                    float noise = sin(vUv.x * 10.0 + uTime) * 0.1 + sin(vUv.y * 8.0 + uTime * 0.7) * 0.1;
                    float gradient = vUv.y + noise;
                    vec3 color = mix(uColor1, uColor2, gradient);
                    float alpha = smoothstep(0.0, 0.5, vUv.y) * 0.1;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
        })
    }, [])

    useFrame((state) => {
        gradientMaterial.uniforms.uTime.value = state.clock.elapsedTime * 0.2
    })

    return (
        <mesh ref={meshRef} position={[0, -2, -10]} rotation={[-Math.PI / 6, 0, 0]}>
            <planeGeometry args={[30, 20, 1, 1]} />
            <primitive object={gradientMaterial} attach="material" />
        </mesh>
    )
}

// === MOUSE PARALLAX CAMERA ===

function ParallaxCamera() {
    const { camera } = useThree()
    const mouseRef = useRef({ x: 0, y: 0 })

    React.useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2
            mouseRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    useFrame(() => {
        camera.position.x += (mouseRef.current.x * 0.5 - camera.position.x) * 0.02
        camera.position.y += (-mouseRef.current.y * 0.3 - camera.position.y) * 0.02
        camera.lookAt(0, 0, 0)
    })

    return null
}

// === MAIN SCENE ===

function Scene() {
    return (
        <>
            <ParallaxCamera />
            <ambientLight intensity={0.5} />
            <GradientPlane />
            <CodeGrid />
            <FloatingParticles count={80} />
            <AmbientOrb position={[-3, 1, -3]} scale={1.5} color="#7C3AED" />
            <AmbientOrb position={[4, -1, -4]} scale={1} color="#A855F7" />
            <AmbientOrb position={[0, 2, -5]} scale={0.8} color="#7C3AED" />
        </>
    )
}

// === CANVAS WRAPPER ===

interface HeroBackgroundProps {
    className?: string
}

export function HeroBackground({ className = '' }: HeroBackgroundProps) {
    return (
        <div className={`canvas-container ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                dpr={[1, 1.5]} // Limit pixel ratio for performance
                gl={{
                    antialias: false, // Disable for performance
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    )
}

// === FALLBACK FOR LOW-POWER DEVICES ===

export function HeroBackgroundFallback() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-radial-purple opacity-30" />

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #7C3AED 1px, transparent 1px),
                        linear-gradient(to bottom, #7C3AED 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Floating orbs (CSS only) */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/10 blur-[100px] animate-float" />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-purple-500/10 blur-[80px] animate-float" style={{ animationDelay: '-2s' }} />
        </div>
    )
}
