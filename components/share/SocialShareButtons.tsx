'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Twitter, Linkedin, Link2, Check, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialShareButtonsProps {
    url: string
    title: string
    description?: string
    className?: string
    compact?: boolean
}

export function SocialShareButtons({
    url,
    title,
    description = '',
    className,
    compact = false
}: SocialShareButtonsProps) {
    const [copied, setCopied] = useState(false)

    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description)

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleShare = (platform: keyof typeof shareLinks) => {
        window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    }

    if (compact) {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                <motion.button
                    onClick={() => handleShare('twitter')}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Share on X (Twitter)"
                >
                    <Twitter size={16} />
                </motion.button>
                <motion.button
                    onClick={() => handleShare('linkedin')}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Share on LinkedIn"
                >
                    <Linkedin size={16} />
                </motion.button>
                <motion.button
                    onClick={copyToClipboard}
                    className={cn(
                        "p-2 rounded-lg border transition-all",
                        copied
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Copy link"
                >
                    {copied ? <Check size={16} /> : <Link2 size={16} />}
                </motion.button>
            </div>
        )
    }

    return (
        <div className={cn("space-y-2", className)}>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Share</p>
            <div className="flex gap-2">
                <motion.button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Twitter size={16} />
                    <span className="text-sm">Twitter</span>
                </motion.button>
                <motion.button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Linkedin size={16} />
                    <span className="text-sm">LinkedIn</span>
                </motion.button>
                <motion.button
                    onClick={copyToClipboard}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                        copied
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {copied ? <Check size={16} /> : <Link2 size={16} />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </motion.button>
            </div>
        </div>
    )
}

// Floating share button for mobile
export function FloatingShareButton({
    url,
    title
}: {
    url: string
    title: string
}) {
    const [isOpen, setIsOpen] = useState(false)

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url })
            } catch (err) {
                // User cancelled or error
                setIsOpen(true)
            }
        } else {
            setIsOpen(true)
        }
    }

    return (
        <>
            <motion.button
                onClick={handleNativeShare}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-purple-500 text-white shadow-lg shadow-purple-500/30 z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Share2 size={24} />
            </motion.button>

            {/* Popup Fallback */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-24 right-6 p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl z-50"
                >
                    <SocialShareButtons url={url} title={title} compact />
                </motion.div>
            )}
        </>
    )
}
