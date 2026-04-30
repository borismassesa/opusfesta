'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { useMotionSafe } from '@/hooks/useMotionSafe'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const safe = useMotionSafe()

  useEffect(() => {
    // Keep native scrolling on touch devices. Android complaints often present as
    // "bad rendering" when the real problem is custom scroll handling.
    if (!safe) return

    const coarsePointer = typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches
      : false
    const touchDevice = coarsePointer || navigator.maxTouchPoints > 0
    if (touchDevice) return

    let lenis: Lenis
    try {
      lenis = new Lenis({
        duration: 1.2,
        // Expo ease — matches our motion token
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      })
    } catch (err) {
      console.error('Lenis initialisation failed', err)
      return
    }

    let destroyed = false

    function raf(time: number) {
      if (destroyed) return
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      destroyed = true
      lenis.destroy()
    }
  }, [safe])

  return <>{children}</>
}
