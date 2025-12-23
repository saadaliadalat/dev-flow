import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ className, variant = 'primary', children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "relative px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                    "bg-white/5 border border-white/10 text-white",
                    "shadow-[inset_0_0_12px_rgba(255,255,255,0.05)]",
                    "hover:bg-white/10 hover:border-white/20 hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]",
                    "active:scale-[0.98]",
                    "group overflow-hidden",
                    className
                )}
                {...props}
            >
                <div className="relative z-10 flex items-center justify-center gap-2">
                    {children}
                </div>

                {/* Subtle sheen animation */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
            </button>
        )
    }
)
GlassButton.displayName = "GlassButton"
