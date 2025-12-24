import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: 'DevFlow | Engineering Intelligence',
        template: '%s | DevFlow'
    },
    description: 'Visualise velocity, prevent burnout, and ship faster with AI-powered engineering analytics.',
    keywords: ["developer analytics", "github stats", "coding productivity", "developer tools", "burnout prevention"],
    authors: [{ name: "DevFlow Team" }],
    openGraph: {
        siteName: "DevFlow",
    },
    twitter: {
        card: "summary_large_image",
        title: "DevFlow - Spotify Wrapped for Developers",
        description: "Track your coding productivity, unlock achievements, and share your developer journey.",
    },
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { CommandMenu } from "@/components/ui/CommandMenu";

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
                {/* Global Noise Overlay */}
                <div
                    className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.03] mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                    }}
                />

                {/* Skip to content link for keyboard accessibility */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:font-medium"
                >
                    Skip to main content
                </a>
                <AuthProvider>
                    <ToastProvider>
                        <CommandMenu />
                        <main id="main-content">
                            {children}
                        </main>
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
