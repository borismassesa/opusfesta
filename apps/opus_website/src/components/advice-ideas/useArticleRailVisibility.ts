'use client'

import { useEffect, useState } from 'react'

const ARTICLE_RAIL_START_ID = 'article-rail-start'
const ARTICLE_RAIL_END_ID = 'article-rail-end'

export default function useArticleRailVisibility() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const start = document.getElementById(ARTICLE_RAIL_START_ID)
    const end = document.getElementById(ARTICLE_RAIL_END_ID)
    if (!start || !end) return

    let frame = 0

    const update = () => {
      const anchor = window.innerHeight * 0.5
      const next =
        start.getBoundingClientRect().top <= anchor &&
        end.getBoundingClientRect().top > anchor

      setVisible((current) => (current === next ? current : next))
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(update)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [])

  return visible
}
