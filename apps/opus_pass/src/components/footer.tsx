'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import Reveal from '@/components/ui/Reveal'

type FooterLink = { label: string; href: string }
type FooterColumn = { title: string; links: FooterLink[] }

const columns: FooterColumn[] = [
  {
    title: 'Products',
    links: [
      { label: 'Invitations', href: '/invitations' },
      { label: "Guests & RSVP's", href: '/guests' },
      { label: 'Wedding Website', href: '/websites' },
    ],
  },
  {
    title: 'Templates',
    links: [
      { label: 'Save the Dates', href: '/invitations/catalog' },
      { label: 'Wedding Invitations', href: '/invitations/catalog' },
      { label: 'Kitchen Party', href: '/invitations/catalog' },
      { label: 'Send-Off Cards', href: '/invitations/catalog' },
      { label: 'Kadi za Michango', href: '/invitations/catalog' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Help Centre', href: '/help' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About OpusPass', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Status', href: '/status' },
    ],
  },
]

export default function Footer() {
  const watermarkRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: watermarkRef, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <footer className="bg-white pt-20 pb-12 px-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">

        {/* Links grid */}
        <Reveal direction="none" margin="-40px" className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-sm">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold mb-4 text-[#1A1A1A]">{col.title}</h4>
              <ul className="space-y-3 text-gray-500">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-[#1A1A1A] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        {/* Watermark — parallax bounded within footer */}
        <div ref={watermarkRef} className="relative mb-8 py-8 -mx-6 overflow-hidden flex justify-center">
          <motion.p
            style={{ y }}
            aria-hidden="true"
            className="pointer-events-none whitespace-nowrap select-none text-center text-[14vw] md:text-[11vw] lg:text-[9vw] xl:text-[8.2vw] 2xl:text-[7.4vw] font-serif font-bold leading-none text-gray-100"
          >
            OpusPass
          </motion.p>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-0 mt-8 pt-8 border-t border-gray-100 text-xs text-gray-400">
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-[#1A1A1A] transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-[#1A1A1A] transition-colors">Privacy Policy</Link>
            <Link href="/accessibility" className="hover:text-[#1A1A1A] transition-colors">Accessibility</Link>
          </div>
          <span>© 2026 OpusPass. All rights reserved.</span>
          <div className="flex gap-4">
            {/* WhatsApp */}
            <a href="#" aria-label="WhatsApp" className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.93 7.93 0 0 0-6.86 11.9L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85 1h.01a7.93 7.93 0 0 0 6.7-12.58zM12.05 18.55a6.58 6.58 0 0 1-3.36-.92l-.24-.14-2.49.65.67-2.42-.16-.25a6.58 6.58 0 1 1 12.21-3.48 6.58 6.58 0 0 1-6.63 6.56zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.45.1-.51.64-.62.78-.23.15-.43.05a5.4 5.4 0 0 1-1.59-.98 5.96 5.96 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4.09-.09.2-.23.3-.34.1-.12.13-.2.2-.34.07-.13.03-.25-.02-.35-.05-.1-.45-1.08-.62-1.48-.16-.38-.33-.33-.45-.34h-.38a.74.74 0 0 0-.54.25 2.25 2.25 0 0 0-.7 1.67c0 .99.72 1.94.82 2.07.1.13 1.42 2.17 3.43 3.04.48.21.85.33 1.14.43.48.15.91.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.13-.38-.23z"/></svg>
            </a>
            {/* Instagram */}
            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            {/* TikTok */}
            <a href="#" aria-label="TikTok" className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
            </a>
            {/* Facebook */}
            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
