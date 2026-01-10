/**
 * 🧈 BUTTER PHYSICS
 * The physics engine for the 2026 Design System.
 * 
 * "It shouldn't feel like animation. It should feel like weight."
 */

export const SPRINGS = {
    // 🖱️ Micro-interactions (Hover, Scale, Click)
    // Taut, responsive, zero-overshoot
    micro: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },

    // 🌊 Fluid Layout (Card Entries, Tab Switching)
    // Smooth, buttery, slight weight
    fluid: { type: "spring", stiffness: 170, damping: 26, mass: 1 },

    // 🏗️ Structural (Modal Open, Page Transition)
    // Heavy, monumental, significant presence
    glat: { type: "spring", stiffness: 100, damping: 20, mass: 1.2 }
} as const

// Standard variants for easy use
export const VARIANTS = {
    fadeUp: {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: SPRINGS.fluid }
    },
    scaleIn: {
        hidden: { opacity: 0, scale: 0.96 },
        visible: { opacity: 1, scale: 1, transition: SPRINGS.fluid }
    }
}
