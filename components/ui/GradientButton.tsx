'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface GradientButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    icon?: React.ReactNode
    loading?: boolean
}

export function GradientButton({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    className,
    ...props
}: GradientButtonProps) {

    const sizeClasses = {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[15px]", // "Perfect" medium size
        lg: "h-14 px-8 text-lg"
    }

    const variantClasses = {
        primary: "bg-white text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.6)] hover:bg-zinc-100 border border-transparent font-bold",
        secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-xl",
        ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5"
    }

    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
                "relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none overflow-hidden",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            {/* Loading Spinner */}
            {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            {/* Icon (if provided and not loading) */}
            {!loading && icon && (
                <span className="mr-2.5">{icon}</span>
            )}

            {/* Text */}
            <span className="relative z-10">{children}</span>

            {/* Shine Effect for Primary */}
            {variant === 'primary' && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
            )}
        </motion.button>
    )
}
