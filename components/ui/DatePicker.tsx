'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface DatePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    className?: string
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-start text-left font-normal px-4 py-2.5 rounded-lg border bg-zinc-950 transition-colors",
                    "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50",
                    !date && "text-zinc-500",
                    date && "text-white"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 mt-2 p-3 bg-black border border-zinc-800 rounded-xl shadow-2xl"
                    >
                        <style>{`
                            .rdp { --rdp-cell-size: 32px; --rdp-accent-color: #9333ea; --rdp-background-color: transparent; margin: 0; }
                            .rdp-day_selected { background-color: #9333ea !important; color: white !important; font-weight: bold; }
                            .rdp-day_selected:hover { background-color: #7e22ce !important; }
                            .rdp-button:hover:not([disabled]) { background-color: #27272a; color: white; }
                            .rdp-day { color: #d4d4d8; font-size: 0.875rem; border-radius: 6px; }
                            .rdp-caption_label { color: #f4f4f5; font-weight: 600; font-size: 0.875rem; }
                            .rdp-nav_button { color: #a1a1aa; }
                            .rdp-nav_button:hover { color: white; background-color: #27272a; }
                            .rdp-head_cell { color: #a1a1aa; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; }
                        `}</style>
                        <DayPicker
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                                setDate(d)
                                setIsOpen(false)
                            }}
                            initialFocus
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
