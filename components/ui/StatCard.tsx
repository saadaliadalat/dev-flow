'use client'

import { LucideIcon } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down'
  color: string
  delay?: number
  prefix?: string
  suffix?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
  color,
  delay,
  prefix = '',
  suffix = '',
}: StatCardProps) {
  const [count, setCount] = useState(0)
  const targetValue = typeof value === 'number' ? value : parseInt(value) || 0

  // Animated counter
  useEffect(() => {
    if (typeof value !== 'number') {
      return
    }

    const duration = 1000
    const steps = 60
    const increment = targetValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetValue) {
        setCount(targetValue)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [targetValue, value])

  const displayValue = typeof value === 'number' ? count : value

  return (
    <GlassCard delay={delay} className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend === 'up' ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">
          {prefix}
          {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          {suffix}
        </p>
      </div>
    </GlassCard>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
