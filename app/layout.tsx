import type { Metadata } from "next";
import "./globals.css";

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
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
