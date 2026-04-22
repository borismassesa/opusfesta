import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter, Playfair_Display } from 'next/font/google'
import { LanguageProvider } from '@/context/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OpusFesta — Tanzania\'s First Celebration Ecosystem',
  description:
    'OpusFesta is Tanzania\'s dedicated platform for planning, celebrating, and commemorating life\'s most important moments — connecting couples with the best wedding vendors, tools, and inspiration in one trusted place.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`bg-white ${inter.variable} ${playfair.variable}`}>
      <body className="bg-white font-sans antialiased">
        <LanguageProvider>
          <LanguageSwitcher />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
