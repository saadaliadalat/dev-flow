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
    description: "Track your coding productivity, unlock achievements, and share your developer journey",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable} ${firaCode.variable}`}>
            <body className="antialiased bg-background text-foreground overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
                {children}
            </body>
        </html>
    );
}
