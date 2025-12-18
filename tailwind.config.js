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

                // Glass system
                glass: {
                    bg: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                    hover: 'var(--glass-hover-bg)',
                    stroke: 'var(--glass-hover-border)',
                },

                // Brand colors
                cyan: {
                    DEFAULT: 'var(--cyan-primary)',
                    light: 'var(--cyan-light)',
                    glow: 'var(--cyan-glow)',
                },
                purple: {
                    DEFAULT: 'var(--purple-secondary)',
                    light: 'var(--purple-light)',
                    glow: 'var(--purple-glow)',
                },

                // Status colors
                success: 'var(--green-success)',
                warning: 'var(--orange-warning)',
                danger: 'var(--red-danger)',

                // Text hierarchy
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    tertiary: 'var(--text-tertiary)',
                    muted: 'var(--text-muted)',
                }
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
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px var(--cyan-glow)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 30px var(--cyan-glow)' },
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
