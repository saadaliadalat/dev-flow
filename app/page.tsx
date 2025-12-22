import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { StorytellingFeatures } from '@/components/landing/StorytellingFeatures'
import { HowItWorks } from '@/components/landing/HowItWorks'

import { Pricing } from '@/components/landing/Pricing'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'

import { StarFieldBackground } from '@/components/landing/StarFieldBackground'

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-deepest text-text-primary selection:bg-cyan-500/30 relative">
            <StarFieldBackground />
            <div className="relative z-10">
                <Navbar />
                <Hero />
                <StorytellingFeatures />
                <HowItWorks />
                <Pricing />
                <FinalCTA />
                <Footer />
            </div>
        </main>
    )
}
