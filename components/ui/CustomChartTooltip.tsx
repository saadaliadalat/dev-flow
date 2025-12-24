'use client'

import React from 'react'

export const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-3 rounded-lg shadow-xl">
                <p className="text-zinc-400 text-xs mb-1 font-medium">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm font-bold text-white">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color || '#a855f7' }}
                        />
                        <span>{entry.value}</span>
                        {entry.name && <span className="text-zinc-500 font-normal ml-1 text-xs">{entry.name}</span>}
                    </div>
                ))}
            </div>
        )
    }
    return null
}
