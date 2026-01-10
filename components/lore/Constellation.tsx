'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, getStarSize, getStarBrightness, getLanguageColor, getSpiralPosition } from '@/lib/constellation'
import { SPRINGS } from '@/lib/motion'

interface ConstellationProps {
    stars: Star[]
    onStarClick?: (star: Star) => void
}

export function Constellation({ stars, onStarClick }: ConstellationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [hoveredStar, setHoveredStar] = useState<Star | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const animationRef = useRef<number>()
    const starsWithPositions = useRef<Star[]>([])

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

    // Canvas rendering loop
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

            // Background gradient (void)
            const bgGradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) / 2
            )
            bgGradient.addColorStop(0, '#0a0a0a')
            bgGradient.addColorStop(1, '#050505')
            ctx.fillStyle = bgGradient
            ctx.fillRect(0, 0, width, height)

            // Draw connection lines (faint constellation lines)
            ctx.strokeStyle = 'rgba(124, 58, 237, 0.08)'
            ctx.lineWidth = 1
            starsWithPositions.current.forEach((star, i) => {
                if (i > 0 && star.x && star.y) {
                    const prev = starsWithPositions.current[i - 1]
                    if (prev.x && prev.y) {
                        ctx.beginPath()
                        ctx.moveTo(prev.x, prev.y)
                        ctx.lineTo(star.x, star.y)
                        ctx.stroke()
                    }
                }
            })

            // Draw stars
            starsWithPositions.current.forEach((star) => {
                if (!star.x || !star.y) return

                const size = star.size || 8
                const brightness = star.brightness || 0.5
                const color = star.color || '#71717a'

                // Pulse effect for active stars
                const pulse = brightness > 0.8
                    ? 1 + Math.sin(time * 3) * 0.15
                    : 1

                // Glow
                const glowGradient = ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, size * 2 * pulse
                )
                glowGradient.addColorStop(0, `${color}${Math.floor(brightness * 80).toString(16).padStart(2, '0')}`)
                glowGradient.addColorStop(0.5, `${color}${Math.floor(brightness * 30).toString(16).padStart(2, '0')}`)
                glowGradient.addColorStop(1, 'transparent')

                ctx.beginPath()
                ctx.arc(star.x, star.y, size * 2 * pulse, 0, Math.PI * 2)
                ctx.fillStyle = glowGradient
                ctx.fill()

                // Core star
                ctx.beginPath()
                ctx.arc(star.x, star.y, size * 0.4 * pulse, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
                ctx.fill()
            })

            time += 0.016
            animationRef.current = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [stars])

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

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-[500px] cursor-crosshair overflow-hidden"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
            <canvas ref={canvasRef} className="absolute inset-0" />

            {/* Hover Tooltip */}
            <AnimatePresence>
                {hoveredStar && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={SPRINGS.micro}
                        className="absolute z-20 pointer-events-none"
                        style={{
                            left: mousePos.x + 20,
                            top: mousePos.y - 10,
                        }}
                    >
                        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl min-w-[180px]">
                            <p className="font-heading font-semibold text-white truncate">
                                {hoveredStar.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: hoveredStar.color }}
                                />
                                <span className="text-xs text-zinc-400">
                                    {hoveredStar.language || 'Unknown'}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1 font-mono">
                                {hoveredStar.commits.toLocaleString()} commits
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Center Legend */}
            <div className="absolute bottom-6 left-6 text-xs text-zinc-600 space-y-1">
                <p>● Larger = More commits</p>
                <p>● Brighter = Recent activity</p>
                <p>● Click star to open repo</p>
            </div>
        </div>
    )
}
