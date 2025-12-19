import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { StorytellingFeatures } from '@/components/landing/StorytellingFeatures'
import { HowItWorks } from '@/components/landing/HowItWorks'

import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-deepest text-text-primary selection:bg-cyan-500/30">
            <Navbar />
            <Hero />
            <StorytellingFeatures />
            <HowItWorks />
            <Pricing />
            <Testimonials />
            <FinalCTA />
            <Footer />
        </main>
    )
}
