import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import ToastProvider from '@/components/providers/ToastProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpusFesta for Vendors',
  description: 'Manage your OpusFesta storefront, leads, and bookings.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-white">
        <body className="bg-white">
          {children}
          <ToastProvider />
        </body>
      </html>
    </ClerkProvider>
  )
}
