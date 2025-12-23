import type { Metadata } from "next";
import { Inter, Outfit, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
});

const firaCode = Fira_Code({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "DevFlow - Spotify Wrapped for Developers",
    description: "Track your coding productivity, unlock achievements, and share your developer journey. AI-powered insights to prevent burnout.",
    keywords: ["developer analytics", "github stats", "coding productivity", "developer tools", "burnout prevention"],
    authors: [{ name: "DevFlow Team" }],
    openGraph: {
        title: "DevFlow - Spotify Wrapped for Developers",
        description: "Track your coding productivity, unlock achievements, and share your developer journey.",
        type: "website",
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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable} ${firaCode.variable}`}>
            <body
                className="antialiased bg-deep-space text-foreground overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100"
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
                        <main id="main-content">
                            {children}
                        </main>
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
