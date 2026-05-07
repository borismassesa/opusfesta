import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpusFesta — Plan Your Perfect Wedding',
  description:
    'Everything you need to plan your wedding, all in one place. Discover venues, connect with vendors, manage your registry.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3006'),
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-white">
        <body className="bg-white">
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
