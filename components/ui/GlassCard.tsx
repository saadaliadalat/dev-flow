import React, { useRef, useState, useEffect } from 'react'
import { motion, HTMLMotionProps, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { hoverVariants } from '@/lib/animations'

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
    hover?: boolean
    glow?: 'cyan' | 'purple' | 'none'
    className?: string
    tilt?: boolean
}

export function GlassCard({
    children,
    hover = true,
    glow = 'none',
    className,
    tilt = true, // Default to true for the user request
    ...props
}: GlassCardProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [randomDelay, setRandomDelay] = useState(0)

    // Glint Random Delay
    useEffect(() => {
        setRandomDelay(Math.random() * 5)
    }, [])

    // 3D Tilt Logic
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 })
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 })

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["2deg", "-2deg"])
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-2deg", "2deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || !tilt) return

        const rect = ref.current.getBoundingClientRect()

        const width = rect.width
        const height = rect.height

        const mouseXFromCenter = e.clientX - rect.left - width / 2
        const mouseYFromCenter = e.clientY - rect.top - height / 2

        x.set(mouseXFromCenter / width)
        y.set(mouseYFromCenter / height)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={ref}
            variants={hover ? hoverVariants : undefined}
            initial="rest"
            whileHover={hover ? "hover" : "rest"}
            whileTap={hover ? "tap" : "rest"}
            style={tilt ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "glass-card relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10 backdrop-blur-xl",
                hover && "hover:border-white/20 hover:bg-zinc-900/80 transition-all duration-500 cursor-pointer group",
                glow === 'cyan' && "hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.15)]",
                glow === 'purple' && "hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.2)]",
                className
            )}
            {...props}
        >
            {/* Glint Effect */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                style={{ overflow: 'hidden' }}
            >
                <div
                    className="absolute top-0 left-0 w-[50%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -skew-x-12 animate-glint"
                    style={{ animationDelay: `${randomDelay}s` }}
                />
            </div>

            {/* Gradient Mesh Overlay - Subtle */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
                {children}
            </div>
        </motion.div>
    )
}
