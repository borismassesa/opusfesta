import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Sidebar } from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpusFesta Design System',
  description:
    'Foundations, components, patterns, and voice for every OpusFesta product. Built by design, engineering, and the whole team.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-ink min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto px-6 md:px-10 py-14 md:py-20">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
