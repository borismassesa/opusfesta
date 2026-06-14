'use client'

import { useEffect, useRef, useState } from 'react'

export function useScrollCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  // True briefly after a scroll, so the nav arrows can reveal on scroll (in
  // addition to hover). Cleared ~1s after scrolling stops.
  const [scrolling, setScrolling] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let idleTimer: ReturnType<typeof setTimeout> | undefined
    const updateProgress = () => {
      const max = el.scrollWidth - el.clientWidth
      setProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0)
    }
    const onScroll = () => {
      updateProgress()
      setScrolling(true)
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setScrolling(false), 1000)
    }
    updateProgress()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(updateProgress)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
      if (idleTimer) clearTimeout(idleTimer)
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

  return { scrollRef, progress, scrolling, scrollNext, scrollPrev }
}
