import { Variants, Transition } from "framer-motion"

// === SPRING PHYSICS ===

export const springs = {
    ambient: { type: 'spring', stiffness: 50, damping: 20, mass: 1 },
    default: { type: 'spring', stiffness: 300, damping: 30, mass: 1 },
    snappy: { type: 'spring', stiffness: 400, damping: 25, mass: 0.8 },
    bouncy: { type: 'spring', stiffness: 500, damping: 15, mass: 0.5 },
} as const

// === EASING CURVES ===

export const easings = {
    outExpo: [0.16, 1, 0.3, 1] as const,
    outQuart: [0.25, 1, 0.5, 1] as const,
    inOutQuart: [0.76, 0, 0.24, 1] as const,
}

// === CONTAINER VARIANTS ===

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        }
    }
}

export const staggerFastVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        }
    }
}

// === ITEM VARIANTS ===

export const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        filter: 'blur(10px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.5,
            ease: easings.outQuart,
        }
    }
}

export const slideUpVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 40,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: easings.outQuart,
        }
    }
}

export const fadeScaleVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: easings.outQuart,
        }
    }
}

export const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5 }
    }
}

// === HOVER VARIANTS ===

export const hoverVariants: Variants = {
    rest: {
        scale: 1,
        y: 0,
        transition: springs.default,
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: springs.snappy,
    },
    tap: {
        scale: 0.98,
        transition: { duration: 0.1 },
    }
}

export const hoverLiftVariants: Variants = {
    rest: {
        y: 0,
        boxShadow: '0 0 0 rgba(124, 58, 237, 0)',
    },
    hover: {
        y: -8,
        boxShadow: '0 20px 40px -15px rgba(124, 58, 237, 0.3)',
        transition: springs.snappy,
    }
}

export const hoverGlowVariants: Variants = {
    rest: {
        boxShadow: '0 0 0 rgba(124, 58, 237, 0)',
    },
    hover: {
        boxShadow: '0 0 40px -10px rgba(124, 58, 237, 0.5)',
        transition: { duration: 0.3 },
    }
}

// === GLOW VARIANTS ===

export const glowVariants: Variants = {
    initial: { opacity: 0.5, scale: 1 },
    animate: {
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.02, 1],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

export const pulseGlowVariants: Variants = {
    initial: {
        boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
    },
    animate: {
        boxShadow: [
            '0 0 20px rgba(124, 58, 237, 0.3)',
            '0 0 40px rgba(124, 58, 237, 0.5)',
            '0 0 20px rgba(124, 58, 237, 0.3)',
        ],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

// === CARD VARIANTS ===

export const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: easings.outQuart,
        }
    }
}

export const cardHoverVariants: Variants = {
    rest: {
        scale: 1,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        transition: springs.default,
    },
    hover: {
        scale: 1.02,
        y: -8,
        transition: springs.snappy,
    }
}

// === UTILITY FUNCTIONS ===

export function staggerDelay(index: number, baseDelay = 0.05): number {
    return index * baseDelay
}

export function getViewportAnimation(margin = "-100px") {
    return {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, margin },
    }
}
