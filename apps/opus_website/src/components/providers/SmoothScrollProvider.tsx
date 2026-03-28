'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { useMotionSafe } from '@/hooks/useMotionSafe'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const safe = useMotionSafe()

  useEffect(() => {
    // Only initialise Lenis when animations are safe (respects prefers-reduced-motion + Save-Data)
    if (!safe) return

    let lenis: Lenis
    try {
      lenis = new Lenis({
        duration: 1.2,
        // Expo ease — matches our motion token
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 0,
        // Block Lenis from processing touch events entirely.
        // Lenis registers non-passive touch listeners on window which
        // prevents the browser from synthesising click events from taps.
        virtualScroll: ({ event }) => {
          if (event.type.includes('touch')) return false
          return true
        },
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
