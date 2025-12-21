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
                // Primary Backgrounds
                bg: {
                    deepest: '#050505',
                    deep: '#0a0a0a',
                    mid: '#18181B',
                    elevated: '#27272A',
                    surface: '#303030',
                },
                // Purple Accent System
                purple: {
                    DEFAULT: '#7C3AED',
                    50: '#F5F3FF',
                    100: '#EDE9FE',
                    200: '#DDD6FE',
                    300: '#C4B5FD',
                    400: '#A78BFA',
                    500: '#8B5CF6',
                    600: '#7C3AED',
                    700: '#6D28D9',
                    800: '#5B21B6',
                    900: '#4C1D95',
                    950: '#2E1065',
                    glow: 'rgba(124, 58, 237, 0.4)',
                    subtle: 'rgba(124, 58, 237, 0.1)',
                },
                // Silver System
                silver: {
                    DEFAULT: '#D4D4D8',
                    light: '#E4E4E7',
                    dark: '#A1A1AA',
                },
                // Glass System
                glass: {
                    bg: 'rgba(10, 10, 10, 0.8)',
                    border: 'rgba(255, 255, 255, 0.06)',
                    'hover-bg': 'rgba(255, 255, 255, 0.03)',
                    'hover-border': 'rgba(255, 255, 255, 0.12)',
                },
                // Text Hierarchy
                text: {
                    primary: '#FFFFFF',
                    secondary: '#D4D4D8',
                    tertiary: '#A1A1AA',
                    muted: '#71717A',
                    faint: '#52525B',
                },
            },
            fontFamily: {
                display: ['var(--font-display)', 'system-ui', 'sans-serif'],
                body: ['var(--font-body)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
                'scale-up': 'scaleUp 0.4s ease-out forwards',
                'pulse-glow': 'pulseGlow 3s infinite ease-in-out',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'spin-slow': 'spin 20s linear infinite',
                'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
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
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(124, 58, 237, 0.5)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            backgroundImage: {
                'gradient-purple': 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                'gradient-purple-glow': 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)',
                'gradient-silver': 'linear-gradient(135deg, #D4D4D8 0%, #A1A1AA 100%)',
                'gradient-dark': 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)',
                'gradient-radial-purple': 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
            },
            boxShadow: {
                'purple': '0 0 40px -10px rgba(124, 58, 237, 0.5)',
                'purple-lg': '0 0 60px -15px rgba(124, 58, 237, 0.4)',
                'glow': '0 0 40px -10px rgba(255, 255, 255, 0.3)',
            },
            transitionTimingFunction: {
                'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
                'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
                'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
        },
    },
    plugins: [],
}
