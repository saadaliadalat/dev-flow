import { createClient } from '@supabase/supabase-js'
import { auth } from './auth'

// Server-side Supabase client with service role
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export { supabaseAdmin }

// Check if current user is admin
export async function isAdmin(): Promise<boolean> {
    try {
        const session = await auth()
        if (!session?.user) return false

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('is_admin')
            .eq('github_id', (session.user as any).githubId)
            .single()

        return user?.is_admin === true
    } catch {
        return false
    }
}

// Get current admin user details
export async function getAdminUser() {
    try {
        const session = await auth()
        if (!session?.user) return null

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('github_id', (session.user as any).githubId)
            .single()

        if (!user?.is_admin) return null
        return user
    } catch {
        return null
    }
}

// Log admin action
export async function logAdminAction(
    adminId: string,
    adminUsername: string,
    action: string,
    targetType?: string,
    targetId?: string,
    targetName?: string,
    details?: Record<string, any>
) {
    try {
        await supabaseAdmin.from('admin_logs').insert({
            admin_id: adminId,
            admin_username: adminUsername,
            action,
            target_type: targetType,
            target_id: targetId,
            target_name: targetName,
            details: details || {}
        })
    } catch (error) {
        console.error('Failed to log admin action:', error)
    }
}

// Admin response helper
export function adminUnauthorized() {
    return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
    )
}

// Get dashboard stats
export async function getAdminStats() {
    const { data, error } = await supabaseAdmin.rpc('get_admin_stats')
    if (error) {
        console.error('Error fetching admin stats:', error)
        // Fallback to manual queries
        const [users, activeUsers, signupsToday] = await Promise.all([
            supabaseAdmin.from('users').select('id', { count: 'exact' }).is('deleted_at', null),
            supabaseAdmin.from('users').select('id', { count: 'exact' }).gt('last_synced', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
            supabaseAdmin.from('users').select('id', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0])
        ])

        return {
            total_users: users.count || 0,
            active_users: activeUsers.count || 0,
            suspended_users: 0,
            total_commits: 0,
            total_prs: 0,
            signups_today: signupsToday.count || 0,
            signups_week: 0,
            signups_month: 0
        }
    }
    return data
}

// Get users with pagination
export async function getUsers(options: {
    page?: number,
    limit?: number,
    search?: string,
    status?: 'all' | 'active' | 'suspended',
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
}) {
    const {
        page = 1,
        limit = 10,
        search = '',
        status = 'all',
        sortBy = 'created_at',
        sortOrder = 'desc'
    } = options

    let query = supabaseAdmin
        .from('users')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)

    // Search filter
    if (search) {
        query = query.or(`username.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Status filter
    if (status === 'active') {
        query = query.eq('is_suspended', false)
    } else if (status === 'suspended') {
        query = query.eq('is_suspended', true)
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching users:', error)
        throw error
    }

    return {
        users: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
    }
}

// Get single user details
export async function getUserById(userId: string) {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching user:', error)
        return null
    }

    return data
}

// Get user activity (daily stats)
export async function getUserActivity(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
        .from('daily_stats')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

    if (error) {
        console.error('Error fetching user activity:', error)
        return []
    }

    return data || []
}

// Suspend user
export async function suspendUser(userId: string, reason?: string) {
    const { error } = await supabaseAdmin
        .from('users')
        .update({
            is_suspended: true,
            suspended_at: new Date().toISOString(),
            suspended_reason: reason
        })
        .eq('id', userId)

    if (error) throw error
    return true
}

// Unsuspend user
export async function unsuspendUser(userId: string) {
    const { error } = await supabaseAdmin
        .from('users')
        .update({
            is_suspended: false,
            suspended_at: null,
            suspended_reason: null
        })
        .eq('id', userId)

    if (error) throw error
    return true
}

// Delete user permanently
export async function deleteUser(userId: string) {
    // Soft delete - set deleted_at
    const { error } = await supabaseAdmin
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId)

    if (error) throw error
    return true
}

// Hard delete user (permanent)
export async function hardDeleteUser(userId: string) {
    const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId)

    if (error) throw error
    return true
}

// Get feature flags
export async function getFeatureFlags() {
    const { data, error } = await supabaseAdmin
        .from('feature_flags')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching feature flags:', error)
        return []
    }

    return data || []
}

// Update feature flag
export async function updateFeatureFlag(flagId: string, isEnabled: boolean, updatedBy?: string) {
    const { error } = await supabaseAdmin
        .from('feature_flags')
        .update({
            is_enabled: isEnabled,
            updated_by: updatedBy
        })
        .eq('id', flagId)

    if (error) throw error
    return true
}

// Get announcements
export async function getAnnouncements(activeOnly: boolean = false) {
    let query = supabaseAdmin
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

    if (activeOnly) {
        query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching announcements:', error)
        return []
    }

    return data || []
}

// Create announcement
export async function createAnnouncement(announcement: {
    title: string,
    message: string,
    type?: string,
    show_on_dashboard?: boolean,
    show_on_landing?: boolean,
    starts_at?: string,
    ends_at?: string,
    created_by?: string
}) {
    const { data, error } = await supabaseAdmin
        .from('announcements')
        .insert(announcement)
        .select()
        .single()

    if (error) throw error
    return data
}

// Update announcement
export async function updateAnnouncement(id: string, updates: Partial<{
    title: string,
    message: string,
    type: string,
    is_active: boolean,
    show_on_dashboard: boolean,
    show_on_landing: boolean,
    starts_at: string,
    ends_at: string
}>) {
    const { error } = await supabaseAdmin
        .from('announcements')
        .update(updates)
        .eq('id', id)

    if (error) throw error
    return true
}

// Delete announcement
export async function deleteAnnouncement(id: string) {
    const { error } = await supabaseAdmin
        .from('announcements')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}

// Get admin logs
export async function getAdminLogs(options: {
    page?: number,
    limit?: number,
    action?: string,
    adminId?: string
} = {}) {
    const { page = 1, limit = 50, action, adminId } = options

    let query = supabaseAdmin
        .from('admin_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (action) {
        query = query.eq('action', action)
    }

    if (adminId) {
        query = query.eq('admin_id', adminId)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching admin logs:', error)
        return { logs: [], total: 0 }
    }

    return {
        logs: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
    }
}

// Get signup trends
export async function getSignupTrends(days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .is('deleted_at', null)
        .order('created_at')

    if (error) {
        console.error('Error fetching signup trends:', error)
        return []
    }

    // Group by date
    const trends: Record<string, number> = {}
    data?.forEach(user => {
        const date = new Date(user.created_at).toISOString().split('T')[0]
        trends[date] = (trends[date] || 0) + 1
    })

    // Fill in missing dates
    const result: Array<{ date: string, signups: number }> = []
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        result.push({
            date: dateStr,
            signups: trends[dateStr] || 0
        })
    }

    return result
}

// Get activity trends
export async function getActivityTrends(days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
        .from('daily_stats')
        .select('date, total_commits')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date')

    if (error) {
        console.error('Error fetching activity trends:', error)
        return []
    }

    // Group by date and sum
    const trends: Record<string, number> = {}
    data?.forEach(stat => {
        trends[stat.date] = (trends[stat.date] || 0) + stat.total_commits
    })

    // Fill in missing dates
    const result: Array<{ date: string, commits: number }> = []
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        result.push({
            date: dateStr,
            commits: trends[dateStr] || 0
        })
    }

    return result
}
