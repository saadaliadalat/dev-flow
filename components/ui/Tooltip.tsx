'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface TooltipProps {
    children: React.ReactNode
    content: React.ReactNode
    side?: 'top' | 'bottom' | 'left' | 'right'
    delay?: number
}

// Simple context-less tooltip for now to avoid complexity without Radix
export function Tooltip({ children, content, side = 'top', delay = 200 }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [coords, setCoords] = useState({ x: 0, y: 0 })
    const triggerRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout>()

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect()
                let x = rect.left + rect.width / 2
                let y = rect.top

                if (side === 'top') {
                    y = rect.top - 8
                } else if (side === 'bottom') {
                    y = rect.bottom + 8
                } else if (side === 'left') {
                    x = rect.left - 8
                    y = rect.top + rect.height / 2
                } else if (side === 'right') {
                    x = rect.right + 8
                    y = rect.top + rect.height / 2
                }

                setCoords({ x, y })
                setIsVisible(true)
            }
        }, delay)
    }

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsVisible(false)
    }

    // Handle scroll to hide
    useEffect(() => {
        const handleScroll = () => {
            if (isVisible) setIsVisible(false)
        }
        window.addEventListener('scroll', handleScroll, true)
        return () => window.removeEventListener('scroll', handleScroll, true)
    }, [isVisible])

    return (
        <div
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="inline-block relative"
        >
            {children}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: side === 'top' ? 10 : -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            style={{
                                position: 'fixed',
                                top: coords.y,
                                left: coords.x,
                                transform: 'translate(-50%, -100%)', // Default for 'top'
                                zIndex: 9999,
                                pointerEvents: 'none',
                                ...(side === 'bottom' && { transform: 'translate(-50%, 0)' }),
                                ...(side === 'left' && { transform: 'translate(-100%, -50%)' }),
                                ...(side === 'right' && { transform: 'translate(0, -50%)' }),
                            }}
                        >
                            <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-xs text-white shadow-xl backdrop-blur-xl">
                                {content}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}
