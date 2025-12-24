'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import { Tooltip } from '@/components/ui/Tooltip'

interface ActivityHeatmapProps {
    data: { date: string; count: number }[]
}

const INTENSITY_LEVELS = [
    { threshold: 0, class: 'bg-zinc-900/40 border border-zinc-800/50', label: 'No Activity' },
    { threshold: 1, class: 'bg-purple-900/30 border border-purple-800/30', label: 'Low' },
    { threshold: 3, class: 'bg-purple-600/50 border border-purple-500/50 shadow-[0_0_5px_rgba(147,51,234,0.2)]', label: 'Medium' },
    { threshold: 6, class: 'bg-purple-500 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]', label: 'High' },
    { threshold: 10, class: 'bg-white border border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10', label: 'God Mode' },
]

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    // Generate the last 365 days grid
    const weeks = useMemo(() => {
        const today = new Date()
        const daysToRender = 365
        const startDate = subDays(today, daysToRender)

        // Create array of all days
        const allDays = eachDayOfInterval({
            start: startDate,
            end: today
        })

        // Group into weeks
        const weeksArray: Date[][] = []
        let currentWeek: Date[] = []

        allDays.forEach(day => {
            currentWeek.push(day)
            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek)
                currentWeek = []
            }
        })

        // Push remaining days
        if (currentWeek.length > 0) weeksArray.push(currentWeek)

        return weeksArray
    }, [])

    const getIntensity = (count: number) => {
        if (count === 0) return INTENSITY_LEVELS[0]
        if (count >= 10) return INTENSITY_LEVELS[4]
        if (count >= 6) return INTENSITY_LEVELS[3]
        if (count >= 3) return INTENSITY_LEVELS[2]
        return INTENSITY_LEVELS[1]
    }

    const getActivityForDay = (date: Date) => {
        const dayStr = format(date, 'yyyy-MM-dd')
        return data.find(d => d.date === dayStr)?.count || 0
    }

    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-max">
                <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => {
                                const count = getActivityForDay(day)
                                const style = getIntensity(count)

                                return (
                                    <Tooltip
                                        key={day.toISOString()}
                                        content={
                                            <div className="text-center">
                                                <p className="font-semibold text-white mb-0.5">
                                                    {count} contributions
                                                </p>
                                                <p className="text-zinc-400">
                                                    {format(day, 'MMM do, yyyy')}
                                                </p>
                                            </div>
                                        }
                                        delay={50}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                delay: (weekIndex * 0.02) + (dayIndex * 0.005),
                                                type: 'spring',
                                                stiffness: 260,
                                                damping: 20
                                            }}
                                            whileHover={{
                                                scale: 1.8,
                                                zIndex: 20,
                                                transition: { duration: 0.1 }
                                            }}
                                            className={`w-3 h-3 rounded-[2px] transition-colors ${style.class}`}
                                        />
                                    </Tooltip>
                                )
                            })}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-zinc-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {INTENSITY_LEVELS.map((level, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-[2px] ${level.class}`}
                                title={level.label}
                            />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    )
}
