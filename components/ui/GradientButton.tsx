'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
        sm: "py-2 px-4 text-sm min-h-[36px]",
        md: "py-3 px-6 text-base min-h-[48px]",
        lg: "py-4 px-8 text-lg min-h-[56px]"
    }

    const variantClasses = {
        primary: "bg-gradient-to-r from-white via-zinc-200 to-white bg-[length:200%_100%] bg-[0%] hover:bg-[100%] text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] font-bold",
        secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-xl",
        ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5"
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none overflow-hidden",
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
