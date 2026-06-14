'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

// The customise editor is a full-screen, chromeless surface — no site nav/footer.
export default function InvitationsChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const chromeless = pathname?.endsWith('/customise') ?? false

  if (chromeless) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
