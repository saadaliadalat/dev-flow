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
                // Text hierarchy
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    tertiary: 'var(--text-tertiary)',
                    muted: 'var(--text-muted)',
                },

                // === SILVER & VOID SYSTEM ===
                background: 'var(--bg-deepest)',
                foreground: 'var(--text-primary)',

                // Remap EVERYTHING to Zinc/Black/Purple
                bg: {
                    deepest: '#000000',
                    'deep-space': '#000000',
                    deep: 'var(--bg-deep)',
                    mid: 'var(--bg-card)',
                    card: 'var(--bg-card)',
                    elevated: 'var(--bg-elevated)',
                    hover: 'var(--bg-hover)',
                },

                glass: {
                    bg: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                    hover: 'var(--bg-hover)',
                    stroke: 'var(--glass-border-hover)',
                },

                purple: {
                    DEFAULT: '#8b5cf6',
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                    glow: 'var(--accent-purple-glow)',
                },

                // FORCE MAP colors to Zinc to prevent accidents
                slate: require('tailwindcss/colors').zinc,
                gray: require('tailwindcss/colors').zinc,
                neutron: require('tailwindcss/colors').zinc,
                stone: require('tailwindcss/colors').zinc,

                // Remap Colorful accents to Purple or Zinc
                blue: {
                    ...require('tailwindcss/colors').zinc,
                    DEFAULT: '#8b5cf6', // Map default blue to purple
                    500: '#8b5cf6',
                },
                indigo: require('tailwindcss/colors').zinc,
                cyan: require('tailwindcss/colors').zinc,
                sky: require('tailwindcss/colors').zinc,
                teal: require('tailwindcss/colors').zinc,
                fuchsia: require('tailwindcss/colors').zinc,
                pink: require('tailwindcss/colors').zinc,

                // Keep Emerald/Amber for status indicators ONLY
                emerald: require('tailwindcss/colors').emerald,
                amber: require('tailwindcss/colors').amber,
                red: require('tailwindcss/colors').red,

                // Text hierarchy
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    tertiary: 'var(--text-tertiary)',
                    muted: 'var(--text-muted)',
                }
            },
            backgroundImage: {
                'gradient-primary': 'var(--gradient-primary)',
                'gradient-purple': 'var(--gradient-purple-deep)',
                'cosmic': 'var(--bg-cosmic)',
                'planet': 'var(--planet-gradient)',
            },
            fontFamily: {
                display: ['var(--font-display)', 'system-ui', 'sans-serif'],
                body: ['var(--font-body)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'scale-up': 'scaleUp 0.3s ease-out forwards',
                'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleUp: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px var(--purple-glow)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 30px var(--purple-glow)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
            backgroundImage: {
                'gradient-primary': 'var(--gradient-primary)',
                'gradient-secondary': 'var(--gradient-secondary)',
                'gradient-mesh': 'var(--gradient-mesh)',
            }
        },
    },
    plugins: [],
}
