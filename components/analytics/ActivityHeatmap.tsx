'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Tooltip } from '@/components/ui/Tooltip' // Assuming a tooltip component exists or we use native title for now

interface ActivityHeatmapProps {
    data: { date: string; count: number }[]
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    // Generate last 365 days or similar grid
    // For simplicity in this demo, we'll map the provided data to a grid visualization
    // In a real generic component, we'd generate a full calendar grid.
    // Here we'll simulate a contribution graph style.

    const getIntensityClass = (count: number) => {
        if (count === 0) return 'bg-[var(--bg-elevated)]'
        if (count < 3) return 'bg-purple-900/40'
        if (count < 6) return 'bg-purple-700/60'
        if (count < 10) return 'bg-purple-500/80'
        return 'bg-purple-400'
    }

    return (
        <div className="flex flex-wrap gap-1">
            {data.map((day, i) => (
                <Tooltip
                    key={day.date}
                    content={
                        <div className="text-center">
                            <div className="font-semibold text-white">{day.count} contributions</div>
                            <div className="text-[var(--text-tertiary)]">{day.date}</div>
                        </div>
                    }
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.002 }}
                        className={`w-3 h-3 rounded-sm ${getIntensityClass(day.count)} border border-white/5 cursor-crosshair`}
                    />
                </Tooltip>
            ))}
        </div>
    )
}
