import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * 🤺 CHALLENGE API
 * 
 * Sends challenge invites to friends via email
 */

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { email, fromUser, fromRank, fromScore } = await req.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        // In production, integrate with email service (Resend, SendGrid, etc.)
        // For now, log the challenge
        console.log(`🤺 Challenge sent from ${fromUser} (Rank #${fromRank}, ${fromScore} XP) to ${email}`)

        // TODO: Send email via Resend/SendGrid
        // await resend.emails.send({
        //     from: 'DevFlow <challenges@devflow.app>',
        //     to: email,
        //     subject: `${fromUser} challenged you on DevFlow!`,
        //     html: `...`
        // })

        return NextResponse.json({
            success: true,
            message: 'Challenge sent!'
        })
    } catch (error) {
        console.error('Challenge error:', error)
        return NextResponse.json({ error: 'Failed to send challenge' }, { status: 500 })
    }
}
