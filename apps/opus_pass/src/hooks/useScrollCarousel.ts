'use client'

import { useEffect, useRef, useState } from 'react'

export function useScrollCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  const scrollNext = () => {
    const el = scrollRef.current
    if (!el) return
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    el.scrollBy({ left: el.clientWidth + gap, behavior: 'smooth' })
  }

  const scrollPrev = () => {
    const el = scrollRef.current
    if (!el) return
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    el.scrollBy({ left: -(el.clientWidth + gap), behavior: 'smooth' })
  }

  return { scrollRef, progress, scrollNext, scrollPrev }
}
