import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { Yellowtail, Playfair_Display, Cormorant_Garamond, Dancing_Script, Montserrat, EB_Garamond } from 'next/font/google'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ToastProvider from '@/components/providers/ToastProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import './globals.css'

const yellowtail   = Yellowtail(       { weight: '400',         subsets: ['latin'], variable: '--font-yellowtail',  display: 'swap' })
const playfair     = Playfair_Display( { weight: ['400','700'], subsets: ['latin'], variable: '--font-playfair',   display: 'swap' })
const cormorant    = Cormorant_Garamond({ weight: ['400','700'], subsets: ['latin'], variable: '--font-cormorant',  display: 'swap', style: ['normal','italic'] })
const dancing      = Dancing_Script(   { weight: ['400','700'], subsets: ['latin'], variable: '--font-dancing',    display: 'swap' })
const montserrat   = Montserrat(       { weight: ['400','700'], subsets: ['latin'], variable: '--font-montserrat', display: 'swap' })
const garamond     = EB_Garamond(      { weight: ['400','700'], subsets: ['latin'], variable: '--font-garamond',   display: 'swap' })

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
  const fontVars = [
    yellowtail.variable,
    playfair.variable,
    cormorant.variable,
    dancing.variable,
    montserrat.variable,
    garamond.variable,
  ].join(' ')

  return (
    <ClerkProvider>
      <html lang="en" className={`bg-white ${fontVars}`}>
        <body className="bg-white">
          <CartProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </CartProvider>
          <ToastProvider />
        </body>
      </html>
    </ClerkProvider>
  )
}
