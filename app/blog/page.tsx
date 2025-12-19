'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { Navbar } from '@/components/landing/Navbar'
import { containerVariants, itemVariants } from '@/lib/animations'
import { Calendar, User, ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'

// Mock Blog Posts
const posts = [
    {
        id: 1,
        title: "How to prevent developer burnout in 2024",
        excerpt: "Learn the signs of burnout and strategies to maintain a healthy work-life balance while coding.",
        category: "Wellness",
        author: "Sarah Team",
        date: "Dec 12, 2024",
        readTime: "5 min read",
        image: "bg-gradient-to-br from-orange-500/20 to-red-500/20"
    },
    {
        id: 2,
        title: "Mastering GitHub Actions for CI/CD",
        excerpt: "A comprehensive guide to setting up robust pipelines that save you hours every week.",
        category: "DevOps",
        author: "Alex Code",
        date: "Dec 10, 2024",
        readTime: "8 min read",
        image: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
    },
    {
        id: 3,
        title: "The Future of AI in Software Development",
        excerpt: "How tools like Gemini and GPT-4 are changing the way we write, review, and ship code.",
        category: "AI & Tech",
        author: "Tech Lead",
        date: "Dec 08, 2024",
        readTime: "6 min read",
        image: "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
    },
    {
        id: 4,
        title: "10 VS Code Extensions You Can't Live Without",
        excerpt: "Boost your productivity with these essential extensions for modern web development.",
        category: "Tools",
        author: "Dev Tips",
        date: "Dec 05, 2024",
        readTime: "4 min read",
        image: "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
    }
]

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-bg-deepest text-text-primary">
            <Navbar />

            <div className="pt-32 pb-20 container mx-auto px-6">

                {/* Header */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-display font-bold mb-6">
                        Insights & <span className="text-gradient">Engineering</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-text-tertiary text-lg mb-8">
                        Articles on productivity, mental health, and the future of software development.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div variants={itemVariants} className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-12 text-white placeholder:text-text-tertiary focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
                    </motion.div>
                </motion.div>

                {/* Featured Post (Hero) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-16"
                >
                    <GlassCard className="p-0 overflow-hidden grid md:grid-cols-2 group cursor-pointer" glow="cyan">
                        {/* Image Placeholder */}
                        <div className={`h-64 md:h-full min-h-[300px] ${posts[0].image} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-transparent group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                                    {posts[0].category}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="flex items-center gap-4 text-sm text-text-tertiary mb-4">
                                <span className="flex items-center gap-1"><Calendar size={14} /> {posts[0].date}</span>
                                <span>•</span>
                                <span>{posts[0].readTime}</span>
                            </div>
                            <h2 className="text-3xl font-bold font-display mb-4 group-hover:text-cyan-400 transition-colors">
                                {posts[0].title}
                            </h2>
                            <p className="text-text-secondary mb-6 leading-relaxed">
                                {posts[0].excerpt}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <User size={14} />
                                </div>
                                <span className="text-sm font-medium">{posts[0].author}</span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.slice(1).map((post, i) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                        >
                            <GlassCard className="h-full flex flex-col p-0 overflow-hidden group cursor-pointer" hover>
                                <div className={`h-48 ${post.image} relative`}>
                                    <div className="absolute top-4 left-4">
                                        <span className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-xs text-text-tertiary mb-3">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold font-display mb-3 group-hover:text-cyan-400 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-6 flex-1 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-medium text-text-muted">{post.author}</span>
                                        <span className="p-2 rounded-full bg-white/5 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                            <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    )
}
