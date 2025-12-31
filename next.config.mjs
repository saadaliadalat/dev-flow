/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['avatars.githubusercontent.com', 'github.com'],
        formats: ['image/avif', 'image/webp'],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
        optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'framer-motion'],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
}

export default nextConfig
