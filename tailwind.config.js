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
                background: 'var(--bg-deepest)',
                foreground: 'var(--text-primary)',

                // Deep Space Backgrounds
                bg: {
                    deepest: 'var(--bg-deepest)',
                    deep: 'var(--bg-deep)',
                    mid: 'var(--bg-mid)',
                    elevated: 'var(--bg-elevated)',
                },

                // Glass system
                glass: {
                    bg: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                    hover: 'var(--glass-hover-bg)',
                    stroke: 'var(--glass-hover-border)',
                },

                // Quantum Brand Colors - Remapped to Obsidian/Zinc System
                purple: {
                    ...require('tailwindcss/colors').zinc,
                    DEFAULT: 'var(--purple-primary)',
                    light: 'var(--purple-light)',
                    dark: 'var(--purple-dark)',
                    glow: 'var(--purple-glow)',
                },
                // Force other cosmic colors to Monochrome/Zinc
                fuchsia: require('tailwindcss/colors').zinc,
                pink: require('tailwindcss/colors').zinc,
                violet: require('tailwindcss/colors').zinc,
                indigo: require('tailwindcss/colors').zinc,
                blue: require('tailwindcss/colors').zinc,
                cyan: require('tailwindcss/colors').zinc,
                sky: require('tailwindcss/colors').zinc,
                teal: require('tailwindcss/colors').zinc,
                emerald: require('tailwindcss/colors').emerald, // Keep emerald for success

                silver: {
                    DEFAULT: 'var(--silver-primary)',
                    light: 'var(--silver-light)',
                    dark: 'var(--silver-dark)',
                },
                zinc: {
                    DEFAULT: 'var(--zinc)',
                    ...require('tailwindcss/colors').zinc,
                },
                cosmic: {
                    pink: 'var(--cosmic-pink)',
                    blue: 'var(--cosmic-blue)',
                    cyan: 'var(--cosmic-cyan)',
                },

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
