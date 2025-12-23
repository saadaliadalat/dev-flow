'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { Mail, MessageSquare, MapPin } from 'lucide-react'

export default function ContactPage() {
    const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormState('submitting')
        setTimeout(() => setFormState('success'), 1500)
    }

    return (
        <div className="container mx-auto px-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-5xl mx-auto"
            >
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
                        Get in <span className="text-gradient">Touch</span>
                    </h1>
                    <p className="text-xl text-text-tertiary">
                        Have a question or want to partner with us? We'd love to hear from you.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <GlassCard className="p-6 flex items-start gap-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <Mail className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Email Us</h3>
                                <p className="text-text-tertiary text-sm mb-2">For general inquiries and support.</p>
                                <a href="mailto:hello@devflow.com" className="text-white hover:text-purple-400 transition-colors">hello@devflow.com</a>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 flex items-start gap-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <MessageSquare className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Discord Community</h3>
                                <p className="text-text-tertiary text-sm mb-2">Join 5000+ developers.</p>
                                <a href="#" className="text-white hover:text-purple-400 transition-colors">discord.gg/devflow</a>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 flex items-start gap-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <MapPin className="text-zinc-400" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">HQ</h3>
                                <p className="text-text-tertiary text-sm">
                                    123 Innovation Dr.<br />
                                    San Francisco, CA 94103
                                </p>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div variants={itemVariants}>
                        <GlassCard className="p-8">
                            {formState === 'success' ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                    <p className="text-text-tertiary">We'll get back to you within 24 hours.</p>
                                    <GradientButton className="mt-6" onClick={() => setFormState('idle')} variant="secondary">
                                        Send Another
                                    </GradientButton>
                                </div>
                            ) : (
                                <form onSubmit={async (e) => {
                                    e.preventDefault()
                                    setFormState('submitting')
                                    const formData = new FormData(e.currentTarget)
                                    const data = {
                                        name: formData.get('name'),
                                        email: formData.get('email'),
                                        message: formData.get('message'),
                                        company: formData.get('company') // Optional field if added to UI
                                    }

                                    try {
                                        const res = await fetch('/api/contact', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(data)
                                        })
                                        if (res.ok) {
                                            setFormState('success')
                                        } else {
                                            alert('Something went wrong. Please try again.')
                                            setFormState('idle')
                                        }
                                    } catch (err) {
                                        console.error(err)
                                        alert('Error sending message.')
                                        setFormState('idle')
                                    }
                                }} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                            placeholder="jane@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            required
                                            rows={4}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                    <GradientButton
                                        type="submit"
                                        className="w-full"
                                        loading={formState === 'submitting'}
                                    >
                                        Send Message
                                    </GradientButton>
                                </form>
                            )}
                        </GlassCard>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
