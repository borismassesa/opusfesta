'use client'

import { useEffect } from 'react'

export function AdviceIdeasPostViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return

    fetch('/api/advice-ideas/metrics/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slug }),
    }).catch(() => {})
  }, [slug])

  return null
}
