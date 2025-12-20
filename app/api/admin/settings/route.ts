import { NextResponse } from 'next/server'
import {
    isAdmin,
    getAdminUser,
    getFeatureFlags,
    updateFeatureFlag,
    adminUnauthorized,
    logAdminAction,
    supabaseAdmin
} from '@/lib/admin'

export async function GET() {
    try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const [flags, settings] = await Promise.all([
            getFeatureFlags(),
            supabaseAdmin.from('admin_settings').select('*').order('category')
        ])

        return NextResponse.json({
            featureFlags: flags,
            settings: settings.data || []
        })
    } catch (error) {
        console.error('Admin settings error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
            return adminUnauthorized()
        }

        const admin = await getAdminUser()
        const body = await request.json()
        const { type, id, key, value } = body

        if (type === 'feature_flag') {
            await updateFeatureFlag(id, value, admin?.id)

            const flag = (await getFeatureFlags()).find(f => f.id === id)
            await logAdminAction(
                admin?.id || '',
                admin?.username || '',
                'feature_flag.update',
                'feature_flag',
                id,
                flag?.name || key,
                { enabled: value }
            )
        } else if (type === 'setting') {
            await supabaseAdmin
                .from('admin_settings')
                .update({
                    value: JSON.stringify(value),
                    updated_by: admin?.id
                })
                .eq('key', key)

            await logAdminAction(
                admin?.id || '',
                admin?.username || '',
                'setting.update',
                'setting',
                undefined,
                key,
                { value }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin update settings error:', error)
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        )
    }
}
