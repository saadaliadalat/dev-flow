import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        // 1. Verify Signature
        const secret = process.env.LEMON_SQUEEZY_SIGNATURE_SECRET
        if (!secret) {
            return NextResponse.json({ error: 'Server config error' }, { status: 500 })
        }

        const rawBody = await req.text()
        const hmac = crypto.createHmac('sha256', secret)
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
        const signature = Buffer.from(req.headers.get('X-Signature') || '', 'utf8')

        if (!crypto.timingSafeEqual(digest, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const payload = JSON.parse(rawBody)
        const { meta, data } = payload
        const eventName = meta.event_name
        const customData = meta.custom_data || {}
        const userId = customData.user_id // Ensure you pass ?checkout[custom][user_id]=... in checkout URL

        console.log(`🔔 Webhook received: ${eventName}`, userId ? `User: ${userId}` : 'No User ID')

        // 2. Handle Events
        if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
            const attributes = data.attributes
            const status = attributes.status
            const endsAt = attributes.ends_at
            const variantId = attributes.variant_id
            const customerId = attributes.customer_id

            // If userId is missing in custom_data (e.g. renewal), find by customer_id if stored
            const { error } = await supabase
                .from('users')
                .update({
                    subscription_status: status,
                    variant_id: variantId.toString(),
                    subscription_ends_at: endsAt,
                    customer_id: customerId.toString(),
                    is_premium: status === 'active'
                })
                .eq(userId ? 'id' : 'customer_id', userId || customerId)

            if (error) console.error('DB Update Error:', error)

        } else if (eventName === 'subscription_cancelled') {
            const attributes = data.attributes
            // Usually status becomes 'cancelled' or 'expired'
            await supabase.from('users').update({
                subscription_status: attributes.status,
                is_premium: false
            }).eq(userId ? 'id' : 'customer_id', userId || data.attributes.customer_id)
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
