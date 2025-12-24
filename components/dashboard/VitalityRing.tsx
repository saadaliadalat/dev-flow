'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

interface VitalityRingProps {
    streak: number
    maxStreak?: number
}

export function VitalityRing({ streak, maxStreak = 30 }: VitalityRingProps) {
    const percentage = Math.min((streak / maxStreak) * 100, 100)
    const radius = 30
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    // Color logic
    let color = 'text-amber-500' // 0-7 days
    if (streak > 21) color = 'text-violet-500' // 21+ days
    else if (streak > 7) color = 'text-emerald-500' // 8-20 days

    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            {/* Background Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                    className="text-zinc-800"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                />
                <motion.circle
                    className={color}
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>

            <div className="flex flex-col items-center z-10">
                <span className={`text-2xl font-mono font-bold ${color.replace('text-', 'text-')}`}>
                    {streak}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">DAU</span>
            </div>
        </div>
    )
}
