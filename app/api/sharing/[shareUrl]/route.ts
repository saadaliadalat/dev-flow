import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
    req: Request,
    { params }: { params: { shareUrl: string } }
) {
    try {
        const { shareUrl } = params

        // Fetch sharing card
        const { data: card, error } = await supabase
            .from('sharing_cards')
            .select('*')
            .eq('share_url', shareUrl)
            .single()

        if (error || !card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 })
        }

        // Increment view count
        await supabase
            .from('sharing_cards')
            .update({ view_count: card.view_count + 1 })
            .eq('id', card.id)

        return NextResponse.json({
            success: true,
            card
        })

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to fetch card',
            details: error.message
        }, { status: 500 })
    }
}
