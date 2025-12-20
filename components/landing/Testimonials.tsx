'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
    {
        name: "Alex Chen",
        role: "Senior Engineer",
        company: "Stripe",
        image: "https://i.pravatar.cc/150?u=alex",
        quote: "DevFlow helped me realize I was burning out before it was too late. The AI insights are spot-on."
    },
    {
        name: "Sarah Park",
        role: "Indie Hacker",
        company: "Self-employed",
        image: "https://i.pravatar.cc/150?u=sarah",
        quote: "Finally, a beautiful way to showcase my coding journey. The year-in-review cards went viral on Twitter!"
    },
    {
        name: "Michael Torres",
        role: "CTO",
        company: "Vercel",
        image: "https://i.pravatar.cc/150?u=michael",
        quote: "The gamification aspect completely changed how my team approaches documentation. Incredible tool."
    },
    {
        name: "Jessica Wu",
        role: "Frontend Lead",
        company: "Shopify",
        image: "https://i.pravatar.cc/150?u=jessica",
        quote: "I've tried every analytics tool. Nothing looks or feels as premium as Flow State. It's addicting."
    },
    {
        name: "David Kim",
        role: "Full Stack Dev",
        company: "Netflix",
        image: "https://i.pravatar.cc/150?u=david",
        quote: "The GitHub integration is seamless. It just works. The velocity tracking is actually useful."
    }
]

export function Testimonials() {
    return (
        <section className="py-24 bg-black overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6 mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Loved by <span className="text-purple-400">High Performers</span>
                </h2>
                <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />
                    ))}
                    <span className="ml-2 text-zinc-400 text-sm">5.0 Star Rating from 2,000+ devs</span>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
                <div className="flex animate-marquee gap-6 pr-6">
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <TestimonialCard key={i} {...t} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function TestimonialCard({ name, role, company, image, quote }: any) {
    return (
        <div className="w-[350px] flex-shrink-0 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden relative">
                    <img src={image} alt={name} className="object-cover w-full h-full" />
                </div>
                <div>
                    <div className="text-white font-medium text-sm">{name}</div>
                    <div className="text-zinc-500 text-xs">{role} @ {company}</div>
                </div>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
                "{quote}"
            </p>
        </div>
    )
}
