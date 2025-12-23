import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { StorytellingFeatures } from '@/components/landing/StorytellingFeatures'
import { HowItWorks } from '@/components/landing/HowItWorks'

import { Pricing } from '@/components/landing/Pricing'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'

import { StarField } from '@/components/visuals/StarField'

export default function Home() {
    return (
        <main className="min-h-screen text-slate-300 selection:bg-cyan-500/30 relative">
            <StarField />

            {/* Stage Light: Top Center Gradient */}
            <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none z-[-1]" />

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
