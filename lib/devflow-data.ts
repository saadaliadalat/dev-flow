/**
 * DevFlow Archetype Definitions
 * Static data for the 8 developer archetypes
 */

import { ArchetypeKey, ArchetypeDefinition } from '@/types'

export const ARCHETYPES: Record<ArchetypeKey, ArchetypeDefinition> = {
    tutorial_addict: {
        key: 'tutorial_addict',
        name: 'Tutorial Addict',
        emoji: '📚',
        description: 'You consume. You learn. But you rarely build. Ideas stay in your head, not in production.',
        strengths: ['Quick learner', 'Broad knowledge', 'Curious mind'],
        weaknesses: ['Analysis paralysis', 'Never ships', 'Comfort zone trap'],
        color: '#F59E0B', // amber
        triggerConditions: 'High learning activity, low shipping ratio, < 3 PRs/month'
    },
    chaos_coder: {
        key: 'chaos_coder',
        name: 'Chaos Coder',
        emoji: '🌪️',
        description: 'Bursts of genius separated by silence. Unpredictable but powerful when you show up.',
        strengths: ['High output spikes', 'Creative solutions', 'Thrives under pressure'],
        weaknesses: ['Inconsistent', 'Burnout risk', 'Hard to plan around'],
        color: '#EF4444', // red
        triggerConditions: 'High variance in daily activity, 3+ inactive days followed by 50+ commits'
    },
    burnout_sprinter: {
        key: 'burnout_sprinter',
        name: 'Burnout Sprinter',
        emoji: '🔥',
        description: 'You push hard. Too hard. Your productivity is borrowed from your future self.',
        strengths: ['Intense focus', 'Ships fast', 'High ambition'],
        weaknesses: ['Unsustainable pace', 'Will crash', 'Ignores recovery'],
        color: '#DC2626', // deep red
        triggerConditions: '10+ hour days consistently, declining commit quality, no rest days'
    },
    silent_builder: {
        key: 'silent_builder',
        name: 'Silent Builder',
        emoji: '🏗️',
        description: 'You ship in silence. Consistent, reliable, but flying under the radar.',
        strengths: ['Ships consistently', 'Low ego', 'Reliable output'],
        weaknesses: ['Underappreciated', 'Low visibility', 'Easily overlooked'],
        color: '#6B7280', // gray
        triggerConditions: 'Consistent daily activity, low social engagement, private repos dominant'
    },
    momentum_machine: {
        key: 'momentum_machine',
        name: 'Momentum Machine',
        emoji: '🚀',
        description: 'You are the goal. 7+ day streaks. Balanced output. Unstoppable when rolling.',
        strengths: ['Unstoppable focus', 'Self-sustaining habits', 'Peak developer'],
        weaknesses: ['None detected', 'Keep going', 'Don\'t stop'],
        color: '#8B5CF6', // purple (premium)
        triggerConditions: '7+ day streak, balanced build/learn ratio, 5+ PRs merged'
    },
    consistent_operator: {
        key: 'consistent_operator',
        name: 'Consistent Operator',
        emoji: '⚙️',
        description: 'Clockwork consistency. You show up every day, same output, no surprises.',
        strengths: ['Reliable', 'Predictable', 'Steady growth'],
        weaknesses: ['Slow scaling', 'Risk averse', 'Plateau risk'],
        color: '#10B981', // emerald
        triggerConditions: 'Low variance, 5+ commits/day average, 80%+ weekday activity'
    },
    overnight_architect: {
        key: 'overnight_architect',
        name: 'Overnight Architect',
        emoji: '🌙',
        description: 'The midnight coder. Your best work happens when the world sleeps.',
        strengths: ['Deep work mastery', 'Focused sessions', 'Quality code'],
        weaknesses: ['Poor work-life balance', 'Health risks', 'Team sync issues'],
        color: '#3B82F6', // blue
        triggerConditions: '60%+ commits after 10 PM, high quality scores, long sessions'
    },
    weekend_warrior: {
        key: 'weekend_warrior',
        name: 'Weekend Warrior',
        emoji: '⚔️',
        description: 'Weekdays are for the job. Weekends are for your passion projects.',
        strengths: ['Side project master', 'Passion-driven', 'Balance attempts'],
        weaknesses: ['Day job suffers', 'Fragmented focus', 'Limited time'],
        color: '#F97316', // orange
        triggerConditions: '60%+ weekend activity, different repos on weekends, low weekday commits'
    }
}

// Verdict templates keyed by scenario
export const VERDICT_TEMPLATES: Record<string, {
    text: string
    subtext?: string
    severity: 'praise' | 'warning' | 'neutral' | 'critical'
    emoji: string
}> = {
    // Praise
    shipped_real_progress: {
        text: "You shipped real progress today.",
        subtext: "Keep this energy. You're building something.",
        severity: 'praise',
        emoji: '🚀'
    },
    momentum_building: {
        text: "Momentum is building. Do not break it.",
        subtext: "You're on day {streak}. Make it {streak + 1}.",
        severity: 'praise',
        emoji: '🔥'
    },
    showed_up: {
        text: "You showed up when it mattered.",
        subtext: "Weekend push. That's dedication.",
        severity: 'praise',
        emoji: '💪'
    },
    streak_milestone: {
        text: "{streak} days. You're becoming unstoppable.",
        subtext: "This is who you are now.",
        severity: 'praise',
        emoji: '⚡'
    },
    shipped_ugly: {
        text: "You shipped something imperfect. That's growth.",
        subtext: "Done > Perfect. Always.",
        severity: 'praise',
        emoji: '🎯'
    },

    // Warning
    busy_not_productive: {
        text: "You were busy, not productive.",
        severity: 'warning',
        subtext: "Hours spent ≠ progress made. What did you actually ship?",
        emoji: '⚠️'
    },
    tutorial_loop: {
        text: "You're stuck in a tutorial loop.",
        subtext: "Stop learning. Start building. Now.",
        severity: 'warning',
        emoji: '📚'
    },
    slowing_down: {
        text: "Your momentum is fading.",
        subtext: "Last week: {lastWeek} commits. This week: {thisWeek}.",
        severity: 'warning',
        emoji: '📉'
    },
    inconsistent: {
        text: "Inconsistency is killing your growth.",
        subtext: "You coded 2 days. Took 5 off. That's not a habit.",
        severity: 'warning',
        emoji: '🎲'
    },

    // Neutral
    rest_day: {
        text: "Rest day. Recovery is progress too.",
        subtext: "Come back tomorrow with energy.",
        severity: 'neutral',
        emoji: '🧘'
    },
    getting_started: {
        text: "Day 1. Everyone starts here.",
        subtext: "Show up tomorrow. That's the only rule.",
        severity: 'neutral',
        emoji: '🌱'
    },
    average_day: {
        text: "Average day. Nothing more, nothing less.",
        subtext: "Average compounds. Keep showing up.",
        severity: 'neutral',
        emoji: '📊'
    },

    // Critical
    streak_dead: {
        text: "The streak is dead. Start again.",
        subtext: "You had {lostStreak} days. Now you have 0.",
        severity: 'critical',
        emoji: '💀'
    },
    burnout_warning: {
        text: "Slow down. Recovery is part of progress.",
        subtext: "Your output is declining. Take a break before you break.",
        severity: 'critical',
        emoji: '🛑'
    },
    prolonged_absence: {
        text: "You've been gone for {days} days.",
        subtext: "The longer you wait, the harder it gets to return.",
        severity: 'critical',
        emoji: '👻'
    }
}

// Level definitions
export const LEVEL_REQUIREMENTS: Array<{
    level: number
    title: string
    xp_required: number
    requirement_description: string
}> = [
        { level: 1, title: 'Apprentice', xp_required: 0, requirement_description: 'Complete onboarding' },
        { level: 2, title: 'Contributor', xp_required: 500, requirement_description: '7-day streak' },
        { level: 3, title: 'Builder', xp_required: 1500, requirement_description: 'Ship 5 PRs' },
        { level: 4, title: 'Operator', xp_required: 4000, requirement_description: '30-day consistency > 70%' },
        { level: 5, title: 'Architect', xp_required: 10000, requirement_description: 'Dev Flow Score > 80 for 2 weeks' },
        { level: 6, title: 'Machine', xp_required: 25000, requirement_description: 'All achievements in one category' }
    ]

// XP rewards
export const XP_REWARDS = {
    daily_active: 10,
    commit: 5,
    pr_opened: 20,
    pr_merged: 50,
    issue_closed: 25,
    code_review: 15,
    streak_7: 100,
    streak_14: 250,
    streak_30: 500,
    streak_100: 2000,
    challenge_completed: 200,
    archetype_earned: 100
}
