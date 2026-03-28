'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true if animations are safe to run.
 * Returns false when:
 *  - prefers-reduced-motion is set (accessibility)
 *  - Save-Data header is on (bandwidth constraint, common on mobile data in Tanzania)
 */
export function useMotionSafe(): boolean {
  const [safe, setSafe] = useState(false)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
    setSafe(!prefersReduced && !saveData)
  }, [])

  return safe
}
