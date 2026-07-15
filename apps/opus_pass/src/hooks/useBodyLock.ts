'use client'

import { useEffect } from 'react'

export function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    // `overflow:hidden` alone doesn't stop scroll-chaining on every browser
    // (wheel/touch scroll still reaches the page behind a fixed overlay).
    // Pinning the body at its current scroll offset is the reliable fix.
    const scrollY = window.scrollY
    const body = document.body
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.width = prev.width
      body.style.overflow = prev.overflow
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
