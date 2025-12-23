'use client'

import React from 'react'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { ComingSoon } from '@/components/dashboard/ComingSoon'

export default function AchievementsPage() {
    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Achievements"
                description="Unlock badges as you master your workflow."
            />
            <ComingSoon featureName="Achievement System" />
        </div>
    )
}
