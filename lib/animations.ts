import { Variants } from "framer-motion"

// Container animations
export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

// Item entry animations
export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
        }
    }
}

// Fade in scale animation
export const fadeScaleVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
}

// Slide up fade
export const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
}

// Hover interactions
export const hoverVariants = {
    rest: {
        scale: 1,
        y: 0,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
        scale: 0.98,
        transition: { duration: 0.1, ease: "easeOut" }
    }
}

// Glow pulse animation
export const glowVariants = {
    initial: { opacity: 0.5, scale: 1 },
    animate: {
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.05, 1],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}
