import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { SessionProvider } from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'DevFlow - Developer Productivity Analytics',
  description:
    'Transform your GitHub data into actionable insights. Track productivity, analyze patterns, and level up your development workflow.',
  keywords: ['GitHub Analytics', 'Developer Productivity', 'Code Analytics', 'DevFlow'],
  authors: [{ name: 'DevFlow Team' }],
  openGraph: {
    title: 'DevFlow - Developer Productivity Analytics',
    description: 'Transform your GitHub data into actionable insights',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
