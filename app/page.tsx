import dynamic from 'next/dynamic'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { TrustedBy } from '@/components/landing/TrustedBy'
import { ValueProp } from '@/components/landing/ValueProp'
import { Pricing } from '@/components/landing/Pricing'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'

// Dynamic imports for heavy components - improves LCP & reduces initial bundle
const StarField = dynamic(
    () => import('@/components/visuals/StarField').then(m => m.StarField),
    { ssr: false, loading: () => <div className="absolute inset-0 bg-black" /> }
)

const StorytellingFeatures = dynamic(
    () => import('@/components/landing/StorytellingFeatures').then(m => m.StorytellingFeatures),
    { loading: () => <div className="min-h-[600px]" /> }
)

export default function Home() {
    return (
        <main className="min-h-screen text-slate-300 selection:bg-purple-500/30 relative bg-black">
            <StarField />

            {/* Stage Light: Top Center Gradient - Updated to Purple */}
            <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none z-[-1]" />

            <div className="relative z-10">
                <Navbar />
                <Hero />
                <TrustedBy />
                <ValueProp />
                <StorytellingFeatures />
                <HowItWorks />
                <Pricing />
                <FinalCTA />
                <Footer />
            </div>
        </main>
    )
}
