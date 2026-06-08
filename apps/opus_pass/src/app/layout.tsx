import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { Yellowtail, Playfair_Display, Cormorant_Garamond, Dancing_Script, Montserrat, EB_Garamond } from 'next/font/google'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import ToastProvider from '@/components/providers/ToastProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import JsonLd from '@/components/JsonLd'
import './globals.css'

// opus_pass is indexed on its own standalone subdomain, served at the root.
// Override per-env with NEXT_PUBLIC_APP_URL (e.g. https://opuspass.opusfesta.com).
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://opuspass.opusfesta.com'

const yellowtail   = Yellowtail(       { weight: '400',         subsets: ['latin'], variable: '--font-yellowtail',  display: 'swap' })
const playfair     = Playfair_Display( { weight: ['400','700'], subsets: ['latin'], variable: '--font-playfair',   display: 'swap' })
const cormorant    = Cormorant_Garamond({ weight: ['400','700'], subsets: ['latin'], variable: '--font-cormorant',  display: 'swap', style: ['normal','italic'] })
const dancing      = Dancing_Script(   { weight: ['400','700'], subsets: ['latin'], variable: '--font-dancing',    display: 'swap' })
const montserrat   = Montserrat(       { weight: ['400','700'], subsets: ['latin'], variable: '--font-montserrat', display: 'swap' })
const garamond     = EB_Garamond(      { weight: ['400','700'], subsets: ['latin'], variable: '--font-garamond',   display: 'swap' })

export const metadata: Metadata = {
  title: 'OpusPass — Your wedding, in one digital pass',
  description:
    'Digital invitations, live RSVP tracking, and a beautiful wedding website — all in one pass. Free to start. Built for couples in Tanzania.',
  metadataBase: new URL(BASE),
  openGraph: {
    siteName: 'OpusPass',
    locale: 'en_TZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
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

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OpusPass',
    url: BASE,
    description: 'Digital invitations, RSVP tracking, and wedding websites for couples in Tanzania.',
  }

  return (
    <ClerkProvider>
      <html lang="en" className={`bg-white ${fontVars}`}>
        <body className="bg-white">
          <JsonLd data={organizationSchema} />
          <CartProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </CartProvider>
          <ToastProvider />
        </body>
      </html>
    </ClerkProvider>
  )
}
