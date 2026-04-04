'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Footer from '@/components/footer'

export const BROWSE_FOOTER_VISIBILITY_EVENT = 'opus:browse-footer-visibility'
const BROWSE_PATH = '/vendors/browse'

export default function VendorsFooterGate() {
  const pathname = usePathname()
  const [showFooter, setShowFooter] = useState(pathname !== BROWSE_PATH)

  useEffect(() => {
    if (pathname !== BROWSE_PATH) {
      setShowFooter(true)
      return
    }

    setShowFooter(false)

    const handleVisibilityChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ showFooter?: boolean }>
      setShowFooter(customEvent.detail?.showFooter ?? false)
    }

    window.addEventListener(BROWSE_FOOTER_VISIBILITY_EVENT, handleVisibilityChange as EventListener)

    return () => {
      window.removeEventListener(BROWSE_FOOTER_VISIBILITY_EVENT, handleVisibilityChange as EventListener)
    }
  }, [pathname])

  if (!showFooter) return null

  return <Footer />
}
