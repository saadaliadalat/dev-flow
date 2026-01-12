import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isRoot = req.nextUrl.pathname === '/'

    // 1. If user is Guest → Redirect protected routes (/dashboard/*) to /
    if (isOnDashboard && !isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // 2. If user is Logged In → Redirect / (Landing Page) to /dashboard
    if (isRoot && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/", "/dashboard/:path*"],
}
