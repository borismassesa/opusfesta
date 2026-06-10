'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { cn } from '@/lib/utils'

// The customise editor is a full-screen, chromeless surface — no site nav/footer.
export default function InvitationsChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const chromeless = pathname?.endsWith('/customise') ?? false

  // The landing page opens with a full-screen scroll-morph hero. The navbar
  // stays hidden over it, then slides back in once you scroll into the content.
  const isLanding = pathname === '/invitations'
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    if (!isLanding) return
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.9)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isLanding])

  if (chromeless) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      {isLanding ? (
        <div
          className={cn(
            // `invisible` backstops the translate: old WebViews (< Chromium 104) ignore
            // the standalone `translate` property and the hidden bar would block taps.
            'fixed inset-x-0 top-0 z-50 transition-[transform,translate,visibility] duration-300 ease-out',
            pastHero ? 'visible translate-y-0' : 'invisible -translate-y-full',
          )}
        >
          <Navbar />
        </div>
      ) : (
        <Navbar />
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
