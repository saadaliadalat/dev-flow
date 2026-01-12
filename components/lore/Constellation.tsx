'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star as StarIcon, GitCommit, Clock, ExternalLink } from 'lucide-react'
import { Star, getStarSize, getStarBrightness, getLanguageColor, getSpiralPosition } from '@/lib/constellation'
import { SPRINGS } from '@/lib/motion'

interface ConstellationProps {
    stars: Star[]
    onStarClick?: (star: Star) => void
}

// Nebula particle for background effect
interface Particle {
    x: number
    y: number
    size: number
    opacity: number
    speed: number
    hue: number
}

export function Constellation({ stars, onStarClick }: ConstellationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [hoveredStar, setHoveredStar] = useState<Star | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const animationRef = useRef<number>()
    const starsWithPositions = useRef<Star[]>([])
    const particlesRef = useRef<Particle[]>([])

    // Initialize nebula particles
    useEffect(() => {
        if (!containerRef.current) return
        const { width, height } = containerRef.current.getBoundingClientRect()

        particlesRef.current = Array.from({ length: 60 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.3 + 0.1,
            speed: Math.random() * 0.3 + 0.1,
            hue: Math.random() > 0.5 ? 270 : 220, // Purple or blue
        }))
    }, [])

    // Calculate star positions on mount/resize
    useEffect(() => {
        if (!containerRef.current) return

        const { width, height } = containerRef.current.getBoundingClientRect()
        const centerX = width / 2
        const centerY = height / 2

        starsWithPositions.current = stars.map((star, i) => {
            const pos = getSpiralPosition(i, centerX, centerY, 60)
            return {
                ...star,
                x: pos.x,
                y: pos.y,
                size: getStarSize(star.commits),
                color: getLanguageColor(star.language),
                brightness: getStarBrightness(star.lastCommitAt),
            }
        })
    }, [stars])

    // Canvas rendering loop - WORLD CLASS DESIGN
    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx || !containerRef.current) return

        const { width, height } = containerRef.current.getBoundingClientRect()
        canvas.width = width * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

        let time = 0

        function draw() {
            if (!ctx) return
            ctx.clearRect(0, 0, width, height)

            // ═══════════════════════════════════════════════════════════
            // LAYER 1: Deep Space Background with Nebula
            // ═══════════════════════════════════════════════════════════
            const bgGradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) / 1.5
            )
            bgGradient.addColorStop(0, '#0d0d12')
            bgGradient.addColorStop(0.3, '#080810')
            bgGradient.addColorStop(0.7, '#050508')
            bgGradient.addColorStop(1, '#020204')
            ctx.fillStyle = bgGradient
            ctx.fillRect(0, 0, width, height)

            // Nebula clouds - breathing effect
            const nebulaOpacity = 0.03 + Math.sin(time * 0.5) * 0.015

            // Purple nebula cloud
            const purpleNebula = ctx.createRadialGradient(
                width * 0.3 + Math.sin(time * 0.3) * 20,
                height * 0.4 + Math.cos(time * 0.2) * 15,
                0,
                width * 0.3, height * 0.4, width * 0.4
            )
            purpleNebula.addColorStop(0, `rgba(139, 92, 246, ${nebulaOpacity * 2})`)
            purpleNebula.addColorStop(0.5, `rgba(124, 58, 237, ${nebulaOpacity})`)
            purpleNebula.addColorStop(1, 'transparent')
            ctx.fillStyle = purpleNebula
            ctx.fillRect(0, 0, width, height)

            // Blue nebula cloud
            const blueNebula = ctx.createRadialGradient(
                width * 0.7 + Math.cos(time * 0.25) * 25,
                height * 0.6 + Math.sin(time * 0.35) * 20,
                0,
                width * 0.7, height * 0.6, width * 0.35
            )
            blueNebula.addColorStop(0, `rgba(59, 130, 246, ${nebulaOpacity * 1.5})`)
            blueNebula.addColorStop(0.5, `rgba(37, 99, 235, ${nebulaOpacity * 0.5})`)
            blueNebula.addColorStop(1, 'transparent')
            ctx.fillStyle = blueNebula
            ctx.fillRect(0, 0, width, height)

            // ═══════════════════════════════════════════════════════════
            // LAYER 2: Floating cosmic dust particles
            // ═══════════════════════════════════════════════════════════
            particlesRef.current.forEach((particle) => {
                particle.y -= particle.speed
                if (particle.y < 0) {
                    particle.y = height
                    particle.x = Math.random() * width
                }

                const twinkle = 0.5 + Math.sin(time * 3 + particle.x) * 0.5
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = `hsla(${particle.hue}, 60%, 70%, ${particle.opacity * twinkle})`
                ctx.fill()
            })

            // ═══════════════════════════════════════════════════════════
            // LAYER 3: Constellation lines with gradient & energy pulse
            // ═══════════════════════════════════════════════════════════
            starsWithPositions.current.forEach((star, i) => {
                if (i > 0 && star.x && star.y) {
                    const prev = starsWithPositions.current[i - 1]
                    if (prev.x && prev.y) {
                        // Energy pulse position along line
                        const pulsePos = (time * 0.5 + i * 0.1) % 1
                        const pulseX = prev.x + (star.x - prev.x) * pulsePos
                        const pulseY = prev.y + (star.y - prev.y) * pulsePos

                        // Gradient line
                        const lineGradient = ctx.createLinearGradient(prev.x, prev.y, star.x, star.y)
                        lineGradient.addColorStop(0, `${prev.color || '#8B5CF6'}15`)
                        lineGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.12)')
                        lineGradient.addColorStop(1, `${star.color || '#8B5CF6'}15`)

                        ctx.beginPath()
                        ctx.moveTo(prev.x, prev.y)
                        ctx.lineTo(star.x, star.y)
                        ctx.strokeStyle = lineGradient
                        ctx.lineWidth = 1.5
                        ctx.stroke()

                        // Energy pulse dot
                        ctx.beginPath()
                        ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2)
                        ctx.fillStyle = 'rgba(139, 92, 246, 0.6)'
                        ctx.fill()
                    }
                }
            })

            // ═══════════════════════════════════════════════════════════
            // LAYER 4: Premium Star Rendering with Multi-Glow
            // ═══════════════════════════════════════════════════════════
            starsWithPositions.current.forEach((star) => {
                if (!star.x || !star.y) return

                const size = star.size || 8
                const brightness = star.brightness || 0.5
                const color = star.color || '#71717a'

                // Magnetic effect - slight attraction to mouse
                const dx = mousePos.x - star.x
                const dy = mousePos.y - star.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                const magneticStrength = Math.max(0, 1 - dist / 150) * 3
                const drawX = star.x + dx * magneticStrength * 0.02
                const drawY = star.y + dy * magneticStrength * 0.02

                // Pulse effect for active stars
                const isActive = brightness > 0.8
                const pulse = isActive ? 1 + Math.sin(time * 3) * 0.12 : 1

                // OUTER HALO (large, soft glow)
                const outerGlow = ctx.createRadialGradient(
                    drawX, drawY, 0,
                    drawX, drawY, size * 3.5 * pulse
                )
                outerGlow.addColorStop(0, `${color}${Math.floor(brightness * 40).toString(16).padStart(2, '0')}`)
                outerGlow.addColorStop(0.4, `${color}${Math.floor(brightness * 15).toString(16).padStart(2, '0')}`)
                outerGlow.addColorStop(1, 'transparent')
                ctx.beginPath()
                ctx.arc(drawX, drawY, size * 3.5 * pulse, 0, Math.PI * 2)
                ctx.fillStyle = outerGlow
                ctx.fill()

                // INNER GLOW (medium, colored)
                const innerGlow = ctx.createRadialGradient(
                    drawX, drawY, 0,
                    drawX, drawY, size * 1.8 * pulse
                )
                innerGlow.addColorStop(0, `${color}${Math.floor(brightness * 90).toString(16).padStart(2, '0')}`)
                innerGlow.addColorStop(0.5, `${color}${Math.floor(brightness * 40).toString(16).padStart(2, '0')}`)
                innerGlow.addColorStop(1, 'transparent')
                ctx.beginPath()
                ctx.arc(drawX, drawY, size * 1.8 * pulse, 0, Math.PI * 2)
                ctx.fillStyle = innerGlow
                ctx.fill()

                // CORE (bright white center)
                const coreGlow = ctx.createRadialGradient(
                    drawX, drawY, 0,
                    drawX, drawY, size * 0.5 * pulse
                )
                coreGlow.addColorStop(0, `rgba(255, 255, 255, ${brightness})`)
                coreGlow.addColorStop(0.6, `rgba(255, 255, 255, ${brightness * 0.5})`)
                coreGlow.addColorStop(1, 'transparent')
                ctx.beginPath()
                ctx.arc(drawX, drawY, size * 0.5 * pulse, 0, Math.PI * 2)
                ctx.fillStyle = coreGlow
                ctx.fill()

                // CHROMATIC SPIKE for very bright stars
                if (brightness > 0.85) {
                    ctx.save()
                    ctx.translate(drawX, drawY)
                    ctx.rotate(time * 0.5)

                    // Four-point star spike
                    const spikeLength = size * 2 * pulse
                    ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.3})`
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    ctx.moveTo(-spikeLength, 0)
                    ctx.lineTo(spikeLength, 0)
                    ctx.moveTo(0, -spikeLength)
                    ctx.lineTo(0, spikeLength)
                    ctx.stroke()

                    ctx.restore()
                }
            })

            // ═══════════════════════════════════════════════════════════
            // LAYER 5: Center breathing ambient glow
            // ═══════════════════════════════════════════════════════════
            const breathe = 0.8 + Math.sin(time * 0.8) * 0.2
            const centerGlow = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.min(width, height) * 0.3 * breathe
            )
            centerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.03)')
            centerGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.01)')
            centerGlow.addColorStop(1, 'transparent')
            ctx.fillStyle = centerGlow
            ctx.fillRect(0, 0, width, height)

            time += 0.016
            animationRef.current = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [stars, mousePos])

    // Mouse interaction
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setMousePos({ x, y })

        // Find hovered star
        const hovered = starsWithPositions.current.find((star) => {
            if (!star.x || !star.y) return false
            const dist = Math.sqrt((star.x - x) ** 2 + (star.y - y) ** 2)
            return dist < (star.size || 20) * 1.5
        })
        setHoveredStar(hovered || null)
    }, [])

    const handleClick = useCallback(() => {
        if (hoveredStar && onStarClick) {
            onStarClick(hoveredStar)
        }
    }, [hoveredStar, onStarClick])

    // Format time ago
    const getTimeAgo = (date: string | null) => {
        if (!date) return 'Never'
        const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`
        if (days < 365) return `${Math.floor(days / 30)} months ago`
        return `${Math.floor(days / 365)} years ago`
    }

    // Get star status
    const getStarStatus = (date: string | null) => {
        if (!date) return { label: 'Dormant', color: 'text-zinc-500' }
        const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
        if (days <= 7) return { label: 'Active', color: 'text-emerald-400' }
        if (days <= 30) return { label: 'Recent', color: 'text-amber-400' }
        if (days <= 90) return { label: 'Cooling', color: 'text-orange-400' }
        return { label: 'Dim Ember', color: 'text-zinc-500' }
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[500px] cursor-crosshair overflow-hidden rounded-xl"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
            <canvas ref={canvasRef} className="absolute inset-0" />

            {/* Premium Hover Tooltip */}
            <AnimatePresence>
                {hoveredStar && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={SPRINGS.micro}
                        className="absolute z-20 pointer-events-none"
                        style={{
                            left: Math.min(mousePos.x + 20, (containerRef.current?.offsetWidth || 400) - 220),
                            top: mousePos.y - 10,
                        }}
                    >
                        <div className="relative">
                            {/* Animated gradient border */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-violet-500/50 rounded-xl blur-sm animate-pulse" />

                            {/* Tooltip content */}
                            <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl min-w-[200px]">
                                {/* Header */}
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-heading font-semibold text-white truncate max-w-[140px]">
                                        {hoveredStar.name}
                                    </p>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 ${getStarStatus(hoveredStar.lastCommitAt).color}`}>
                                        {getStarStatus(hoveredStar.lastCommitAt).label}
                                    </span>
                                </div>

                                {/* Language badge */}
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className="w-3 h-3 rounded-full ring-2 ring-white/20 ring-offset-1 ring-offset-zinc-900"
                                        style={{ backgroundColor: hoveredStar.color }}
                                    />
                                    <span className="text-xs text-zinc-400">
                                        {hoveredStar.language || 'Unknown'}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-1.5">
                                        <GitCommit size={12} className="text-violet-400" />
                                        <span className="text-xs font-mono text-white">
                                            {hoveredStar.commits.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-zinc-500" />
                                        <span className="text-xs text-zinc-500">
                                            {getTimeAgo(hoveredStar.lastCommitAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Click hint */}
                                <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-600">
                                    <ExternalLink size={10} />
                                    <span>Click to open</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend - Premium style */}
            <div className="absolute bottom-6 left-6 space-y-1.5">
                {[
                    { icon: '●', text: 'Larger = More commits', color: 'text-violet-400' },
                    { icon: '◐', text: 'Brighter = Recent activity', color: 'text-amber-400' },
                    { icon: '↗', text: 'Click star to open repo', color: 'text-zinc-500' },
                ].map((item) => (
                    <p key={item.text} className="text-xs text-zinc-600 flex items-center gap-2">
                        <span className={item.color}>{item.icon}</span>
                        {item.text}
                    </p>
                ))}
            </div>

            {/* Scan lines effect overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.015]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }}
            />
        </div>
    )
}
