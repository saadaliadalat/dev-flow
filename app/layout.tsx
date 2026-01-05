import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
// import { Analytics } from '@vercel/analytics/next' // TODO: npm install @vercel/analytics
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL('https://dev-flow-ashen.vercel.app'),
    title: {
        default: 'DevFlow | Engineering Intelligence',
        template: '%s | DevFlow'
    },
    description: 'Visualise velocity, prevent burnout, and ship faster with AI-powered engineering analytics.',
    keywords: ["developer analytics", "github stats", "coding productivity", "developer tools", "burnout prevention"],
    authors: [{ name: "DevFlow Team" }],
    openGraph: {
        siteName: "DevFlow",
        images: [
            {
                url: '/og.png',
                width: 1200,
                height: 630,
                alt: 'DevFlow - Engineering Intelligence for High-Velocity Teams',
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "DevFlow - Spotify Wrapped for Developers",
        description: "Track your coding productivity, unlock achievements, and share your developer journey.",
        images: ['/og.png'],
    },
    icons: {
        icon: "/icon.svg",
    },
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { CommandMenu } from "@/components/ui/CommandMenu";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <body
                className="antialiased bg-deep-space text-foreground overflow-x-hidden"
                style={{ fontFeatureSettings: '"cv11", "ss01"' }}
            >
                {/* Skip to content link for keyboard accessibility */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:font-medium"
                >
                    Skip to main content
                </a>
                <AuthProvider>
                    <ToastProvider>
                        <ErrorBoundary>
                            <CommandMenu />
                            <main id="main-content">
                                {children}
                            </main>
                        </ErrorBoundary>
                    </ToastProvider>
                </AuthProvider>
                {/* <Analytics /> */}
            </body>
        </html>
    );
}
