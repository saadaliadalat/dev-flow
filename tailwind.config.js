/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // 🌌 THE DEEP SPACE SYSTEM (2026)
                void: '#050505',     // Main Background (Deepest)
                surface: '#0A0A0A',  // Cards / Elevated
                glass: 'rgba(20, 20, 23, 0.6)',

                // ⚡ NEON NERVOUS SYSTEM
                violet: {
                    DEFAULT: '#7C3AED',
                    glow: '#8B5CF6',
                    dim: 'rgba(124, 58, 237, 0.1)'
                },
                plasma: {
                    DEFAULT: '#3B82F6',
                    glow: '#60A5FA'
                },
                amber: {
                    DEFAULT: '#F59E0B',
                    glow: '#FBBF24'
                },
                signal: {
                    DEFAULT: '#10B981',
                    glow: '#34D399'
                },

                // Legacy/Compat mappings
                background: '#050505',
                foreground: '#ffffff',
                text: {
                    primary: '#ffffff',
                    secondary: '#a1a1aa',
                    tertiary: '#52525b',
                },
            },
            fontFamily: {
                heading: ['var(--font-satoshi)', 'sans-serif'],
                body: ['var(--font-inter)', 'sans-serif'],
                mono: ['var(--font-jetbrains)', 'monospace'],
                // Keep Geist as fallback/util
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            transitionTimingFunction: {
                'butter': 'cubic-bezier(0.16, 1, 0.3, 1)', // Jony Ive's spring approximation
                'snap': 'cubic-bezier(0.22, 1, 0.36, 1)',
            },
            backgroundImage: {
                'god-rays': 'linear-gradient(180deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%)',
                'void-noise': "url('/noise.png')",
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulseGlow 4s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
