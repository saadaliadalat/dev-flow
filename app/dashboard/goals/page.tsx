'use client'

import React from 'react'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { ComingSoon } from '@/components/dashboard/ComingSoon'

export default function GoalsPage() {
    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Goals & Targets"
                description="Set and track your daily engineering objectives."
            />
            <ComingSoon featureName="Goal Tracking" />
        </div>
    )
}
