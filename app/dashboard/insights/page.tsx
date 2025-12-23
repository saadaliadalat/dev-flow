'use client'

import React from 'react'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { ComingSoon } from '@/components/dashboard/ComingSoon'

export default function InsightsPage() {
    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="AI Insights"
                description="Deep dive into your coding patterns and velocity."
            />
            <ComingSoon featureName="Advanced Analytics" />
        </div>
    )
}
