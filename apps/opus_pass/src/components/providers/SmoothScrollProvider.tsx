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
        // Without this, Lenis hijacks every wheel event on the page —
        // including ones over a modal/dropdown's own overflow-y-auto panel —
        // and calls preventDefault on them, silently killing native scroll
        // inside anything nested in this provider. Elements that manage
        // their own scroll (dialogs, dropdowns, side panels) opt out with
        // data-lenis-prevent.
        prevent: (node) => node.closest('[data-lenis-prevent]') !== null,
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
