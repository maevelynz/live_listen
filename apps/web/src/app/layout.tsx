import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LiveListen - Synchronized Podcast Listening',
  description: 'Listen to podcasts together in real-time with chat and discussion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
