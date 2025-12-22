'use client'

import { motion } from 'framer-motion'

interface DevFlowLogoProps {
    className?: string
    animated?: boolean
}

export function DevFlowLogo({ className = "", animated = true }: DevFlowLogoProps) {
    return (
        <div className={`relative flex items-center justify-center w-8 h-8 ${className}`}>
            <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Outer Hexagon/Shape - Subtle Foundation */}
                <motion.path
                    d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
                    stroke="url(#logo-gradient-outer)"
                    strokeWidth="1.5"
                    strokeOpacity="0.3"
                    initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
                    animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Inner Flow Path - The "Flow" */}
                <motion.path
                    d="M11 11C11 11 12 16 16 16C20 16 21 21 21 21"
                    stroke="url(#logo-gradient-inner)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
                    animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />

                {/* Connection Dots */}
                <motion.circle
                    cx="11" cy="11" r="2"
                    fill="#a855f7"
                    initial={animated ? { scale: 0 } : undefined}
                    animate={animated ? { scale: 1 } : undefined}
                    transition={{ duration: 0.4, delay: 0.4, type: "spring" }}
                />

                <motion.circle
                    cx="21" cy="21" r="2"
                    fill="#22d3ee"
                    initial={animated ? { scale: 0 } : undefined}
                    animate={animated ? { scale: 1 } : undefined}
                    transition={{ duration: 0.4, delay: 1.4, type: "spring" }}
                />

                <defs>
                    <linearGradient id="logo-gradient-outer" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#a855f7" />
                        <stop offset="1" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id="logo-gradient-inner" x1="11" y1="11" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#a855f7" />
                        <stop offset="1" stopColor="#22d3ee" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Glow Effect */}
            <motion.div
                className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"
                animate={animated ? { opacity: [0.2, 0.4, 0.2] } : undefined}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    )
}
