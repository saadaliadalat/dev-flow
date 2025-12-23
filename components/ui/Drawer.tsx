'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface DrawerProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    position?: 'right' | 'left'
    width?: string
}

export function Drawer({
    isOpen,
    onClose,
    title,
    children,
    position = 'right',
    width = 'max-w-md'
}: DrawerProps) {
    // Lock scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: position === 'right' ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: position === 'right' ? '100%' : '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed top-0 bottom-0 ${position === 'right' ? 'right-0' : 'left-0'} z-50 w-full ${width} bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                            {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
