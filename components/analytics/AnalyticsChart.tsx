'use client'

import React from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { CustomChartTooltip } from '@/components/ui/CustomChartTooltip'

interface AnalyticsChartProps {
    data: any[]
    dataKey: string
    xAxisKey: string
    color?: string
    height?: number
    showGrid?: boolean
    showAxis?: boolean
}

export function AnalyticsChart({
    data,
    dataKey,
    xAxisKey,
    color = '#8B5CF6', // Default to purple (Void accent)
    height = 300,
    showGrid = true,
    showAxis = true
}: AnalyticsChartProps) {
    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {showGrid && (
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                        />
                    )}
                    <XAxis
                        dataKey={xAxisKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        dy={10}
                        hide={!showAxis}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        width={30}
                        hide={!showAxis}
                    />
                    <Tooltip
                        content={<CustomChartTooltip />}
                        cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-${dataKey})`}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
