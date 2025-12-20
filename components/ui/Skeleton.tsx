'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
    className?: string
    style?: React.CSSProperties
}

/**
 * Base skeleton component with pulse animation
 */
export function Skeleton({ className, style }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-zinc-800/50',
                className
            )}
            style={style}
        />
    )
}

/**
 * Skeleton for stat cards in the dashboard
 */
export function StatCardSkeleton() {
    return (
        <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10">
            <div className="flex justify-between items-start mb-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-16 h-6 rounded-lg" />
            </div>
            <Skeleton className="w-24 h-8 mb-2" />
            <Skeleton className="w-16 h-4" />
        </div>
    )
}

/**
 * Skeleton for the activity chart
 */
export function ChartSkeleton() {
    return (
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="w-48 h-6 mb-2" />
                    <Skeleton className="w-32 h-4" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-12 h-8 rounded-lg" />
                    <Skeleton className="w-12 h-8 rounded-lg" />
                    <Skeleton className="w-12 h-8 rounded-lg" />
                </div>
            </div>
            <div className="h-[320px] flex items-end gap-1">
                {Array.from({ length: 30 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{ height: `${20 + (i % 10) * 6}%` }}
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * Skeleton for activity feed items
 */
export function ActivityFeedSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-start p-3">
                    <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                        <Skeleton className="w-full h-4 mb-2" />
                        <Skeleton className="w-24 h-3" />
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Skeleton for profile card
 */
export function ProfileCardSkeleton() {
    return (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10">
            <div className="flex flex-col items-center">
                <Skeleton className="w-20 h-20 rounded-full mb-4" />
                <Skeleton className="w-32 h-5 mb-2" />
                <Skeleton className="w-24 h-4 mb-4" />
                <div className="flex gap-6">
                    <div className="text-center">
                        <Skeleton className="w-8 h-5 mx-auto mb-1" />
                        <Skeleton className="w-12 h-3" />
                    </div>
                    <div className="text-center">
                        <Skeleton className="w-8 h-5 mx-auto mb-1" />
                        <Skeleton className="w-12 h-3" />
                    </div>
                    <div className="text-center">
                        <Skeleton className="w-8 h-5 mx-auto mb-1" />
                        <Skeleton className="w-12 h-3" />
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Full dashboard skeleton layout
 */
export function DashboardSkeleton() {
    return (
        <div className="container mx-auto max-w-7xl pt-8 pb-20 animate-in fade-in duration-500">
            {/* Header skeleton */}
            <div className="mb-10">
                <Skeleton className="w-16 h-6 mb-4 rounded-full" />
                <Skeleton className="w-96 h-12 mb-2" />
                <Skeleton className="w-64 h-5" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ChartSkeleton />
                </div>
                <div className="space-y-6">
                    <ProfileCardSkeleton />
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/10">
                        <Skeleton className="w-24 h-4 mb-6" />
                        <ActivityFeedSkeleton />
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Skeleton for insights panel
 */
export function InsightsSkeleton() {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-24 h-8 rounded-lg" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-start gap-3">
                            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                            <div className="flex-1">
                                <Skeleton className="w-full h-4 mb-2" />
                                <Skeleton className="w-3/4 h-4 mb-2" />
                                <Skeleton className="w-20 h-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
