import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, company, message } = body

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('contact_submissions')
            .insert({
                name,
                email,
                company,
                message
            })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Contact submission error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
