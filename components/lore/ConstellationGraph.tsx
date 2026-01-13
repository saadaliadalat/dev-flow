'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, GitCommit, GitFork, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

/**
 * 🌌 CONSTELLATION COMPONENT
 * 
 * Force-directed graph visualization of user's repositories.
 * Each star = repo, edges connect same-language repos.
 * 
 * Features:
 * - D3-style force simulation
 * - Zoom/pan controls
 * - Hover tooltips
 * - Pulsing active stars
 * - Language-colored connections
 */

interface ConstellationNode {
    id: string
    name: string
    fullName: string
    language: string
    commits: number
    stars: number
    forks: number
    mass: number
    brightness: number
    daysSinceCommit: number
    // Simulation properties
    x?: number
    y?: number
    vx?: number
    vy?: number
}

interface ConstellationEdge {
    source: string
    target: string
    language: string
    strength: number
}

interface ConstellationProps {
    nodes: ConstellationNode[]
    edges: ConstellationEdge[]
    width?: number
    height?: number
    className?: string
}

// Language color mapping
const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: '#3178C6',
    JavaScript: '#F7DF1E',
    Python: '#3776AB',
    Dart: '#0175C2',
    Rust: '#DEA584',
    Go: '#00ADD8',
    Java: '#ED8B00',
    'C++': '#00599C',
    C: '#555555',
    Ruby: '#CC342D',
    PHP: '#777BB4',
    Swift: '#FA7343',
    Kotlin: '#7F52FF',
    Unknown: '#6B7280',
}

// Force simulation
function useForceSimulation(
    nodes: ConstellationNode[],
    edges: ConstellationEdge[],
    width: number,
    height: number
) {
    const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map())

    useEffect(() => {
        if (nodes.length === 0) return

        // Initialize positions
        const nodeMap = new Map<string, ConstellationNode>()
        nodes.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / nodes.length
            const radius = Math.min(width, height) * 0.3
            node.x = width / 2 + Math.cos(angle) * radius
            node.y = height / 2 + Math.sin(angle) * radius
            node.vx = 0
            node.vy = 0
            nodeMap.set(node.id, node)
        })

        // Simulation parameters
        const alpha = 0.3
        const alphaDecay = 0.02
        const velocityDecay = 0.4
        let currentAlpha = alpha

        const tick = () => {
            if (currentAlpha < 0.001) return

            // Apply forces
            for (const node of nodes) {
                if (!node.x || !node.y) continue

                // Center gravity
                const dx = width / 2 - node.x
                const dy = height / 2 - node.y
                node.vx! += dx * 0.01 * currentAlpha
                node.vy! += dy * 0.01 * currentAlpha

                // Repulsion from other nodes
                for (const other of nodes) {
                    if (node.id === other.id || !other.x || !other.y) continue
                    const ddx = node.x - other.x
                    const ddy = node.y - other.y
                    const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1
                    const force = (node.mass * other.mass) / (dist * dist) * 50
                    node.vx! += (ddx / dist) * force * currentAlpha
                    node.vy! += (ddy / dist) * force * currentAlpha
                }
            }

            // Apply edge attractions
            for (const edge of edges) {
                const source = nodeMap.get(edge.source)
                const target = nodeMap.get(edge.target)
                if (!source?.x || !source?.y || !target?.x || !target?.y) continue

                const dx = target.x - source.x
                const dy = target.y - source.y
                const dist = Math.sqrt(dx * dx + dy * dy) || 1
                const force = (dist - 100) * edge.strength * 0.1 * currentAlpha

                source.vx! += (dx / dist) * force
                source.vy! += (dy / dist) * force
                target.vx! -= (dx / dist) * force
                target.vy! -= (dy / dist) * force
            }

            // Update positions
            for (const node of nodes) {
                if (!node.x || !node.y) continue
                node.vx! *= velocityDecay
                node.vy! *= velocityDecay
                node.x += node.vx!
                node.y += node.vy!

                // Boundary constraints
                node.x = Math.max(50, Math.min(width - 50, node.x))
                node.y = Math.max(50, Math.min(height - 50, node.y))
            }

            currentAlpha *= (1 - alphaDecay)

            // Update state
            const newPositions = new Map<string, { x: number; y: number }>()
            nodes.forEach(node => {
                newPositions.set(node.id, { x: node.x!, y: node.y! })
            })
            setPositions(newPositions)
        }

        // Run simulation
        const interval = setInterval(tick, 16)
        return () => clearInterval(interval)
    }, [nodes, edges, width, height])

    return positions
}

export function Constellation({ nodes, edges, width = 800, height = 600, className }: ConstellationProps) {
    const [hoveredNode, setHoveredNode] = useState<ConstellationNode | null>(null)
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const svgRef = useRef<SVGSVGElement>(null)

    const positions = useForceSimulation(nodes, edges, width, height)

    // Get star size based on mass
    const getStarSize = (mass: number) => Math.max(4, Math.min(20, 4 + Math.log(mass + 1) * 3))

    return (
        <div className={`relative bg-[#0a0a0f] rounded-2xl overflow-hidden ${className}`}>
            {/* Controls */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button
                    onClick={() => setZoom(z => Math.min(2, z + 0.2))}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                    <ZoomIn size={16} />
                </button>
                <button
                    onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                    <ZoomOut size={16} />
                </button>
                <button
                    onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* SVG Canvas */}
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="w-full h-full"
                style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
            >
                <defs>
                    {/* Glow filters for each language */}
                    {Object.entries(LANGUAGE_COLORS).map(([lang, color]) => (
                        <filter key={lang} id={`glow-${lang.replace(/[^a-zA-Z]/g, '')}`}>
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    ))}

                    {/* Star gradient */}
                    <radialGradient id="starGradient">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Background stars (decorative) */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <circle
                        key={`bg-${i}`}
                        cx={Math.random() * width}
                        cy={Math.random() * height}
                        r={Math.random() * 1.5}
                        fill="white"
                        opacity={Math.random() * 0.3}
                    />
                ))}

                {/* Edges */}
                {edges.map((edge, i) => {
                    const source = positions.get(edge.source)
                    const target = positions.get(edge.target)
                    if (!source || !target) return null

                    const color = LANGUAGE_COLORS[edge.language] || LANGUAGE_COLORS.Unknown

                    return (
                        <line
                            key={`edge-${i}`}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={color}
                            strokeWidth={1}
                            strokeOpacity={0.2}
                        />
                    )
                })}

                {/* Nodes (Stars) */}
                {nodes.map((node) => {
                    const pos = positions.get(node.id)
                    if (!pos) return null

                    const size = getStarSize(node.mass)
                    const color = LANGUAGE_COLORS[node.language] || LANGUAGE_COLORS.Unknown
                    const isActive = node.brightness > 0.5
                    const filterId = `glow-${node.language.replace(/[^a-zA-Z]/g, '')}`

                    return (
                        <g
                            key={node.id}
                            transform={`translate(${pos.x}, ${pos.y})`}
                            onMouseEnter={() => setHoveredNode(node)}
                            onMouseLeave={() => setHoveredNode(null)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Pulse animation for active stars */}
                            {isActive && (
                                <circle
                                    r={size * 2}
                                    fill={color}
                                    opacity={0.1}
                                    className="animate-pulse"
                                />
                            )}

                            {/* Main star */}
                            <circle
                                r={size}
                                fill={color}
                                opacity={0.3 + node.brightness * 0.7}
                                filter={isActive ? `url(#${filterId})` : undefined}
                            />

                            {/* Inner bright core */}
                            <circle
                                r={size * 0.5}
                                fill="white"
                                opacity={node.brightness}
                            />
                        </g>
                    )
                })}
            </svg>

            {/* Tooltip */}
            <AnimatePresence>
                {hoveredNode && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 left-4 p-4 rounded-xl bg-zinc-900/95 border border-white/10 backdrop-blur-sm max-w-xs"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: LANGUAGE_COLORS[hoveredNode.language] || LANGUAGE_COLORS.Unknown }}
                            />
                            <span className="font-bold text-white">{hoveredNode.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="flex items-center gap-1 text-zinc-400">
                                <Star size={12} className="text-amber-400" />
                                <span>{hoveredNode.stars}</span>
                            </div>
                            <div className="flex items-center gap-1 text-zinc-400">
                                <GitCommit size={12} className="text-violet-400" />
                                <span>{hoveredNode.commits}</span>
                            </div>
                            <div className="flex items-center gap-1 text-zinc-400">
                                <GitFork size={12} className="text-cyan-400" />
                                <span>{hoveredNode.forks}</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2">
                            {hoveredNode.daysSinceCommit === 0
                                ? 'Active today'
                                : `${hoveredNode.daysSinceCommit}d since last push`}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[200px]">
                {Object.entries(LANGUAGE_COLORS).slice(0, 6).map(([lang, color]) => (
                    <div key={lang} className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span>{lang}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
