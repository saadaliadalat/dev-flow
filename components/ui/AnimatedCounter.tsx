'use client'

import { motion, useSpring, useTransform, useMotionValue } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
    value: number
    duration?: number
    suffix?: string
    className?: string
}

export function AnimatedCounter({
    value,
    duration = 2,
    suffix = "",
    className
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0)

    const springValue = useSpring(0, {
        duration: duration * 1000,
        bounce: 0,
    })

    useEffect(() => {
        springValue.set(value)
    }, [value, springValue])

    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayValue(Math.round(latest))
        })
    }, [springValue])

    function format(num: number) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
    }

    return (
        <span className={cn("tabular-nums", className)}>
            {format(displayValue)}{suffix}
        </span>
    )
}
