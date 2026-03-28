'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { useMotionSafe } from '@/hooks/useMotionSafe'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const safe = useMotionSafe()

  useEffect(() => {
    // Only initialise Lenis when animations are safe (respects prefers-reduced-motion + Save-Data)
    if (!safe) return

    const lenis = new Lenis({
      duration: 1.2,
      // Expo ease — matches our motion token
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      // Disable touch handling — prevents iOS Safari momentum scroll conflict
      touchMultiplier: 0,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [safe])

  return <>{children}</>
}
