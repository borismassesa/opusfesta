'use client'

import { useState } from 'react'
import { initials } from '../_lib/format'
import { cn } from '@/lib/utils'

// Renders a circular avatar. Prefers an image when `src` is provided
// (typically Clerk's user.imageUrl, cached on workforce_employees.avatar_url).
// Falls back to the existing initials-on-coloured-circle look in three cases:
//   1. No src given (employee hasn't accepted their invite yet, or never
//      had a Clerk account)
//   2. The image fails to load (CDN hiccup, deleted Clerk asset)
//   3. The src is an empty string (defensive)
//
// Uses a plain <img> rather than next/image so we don't have to whitelist
// every possible Clerk image domain in next.config — Clerk serves avatars
// from img.clerk.com (and a couple of legacy hosts), and pinning them
// here would silently break when Clerk rotates CDN.

export default function Avatar({
  name,
  color,
  src,
  size = 'md',
  className,
}: {
  name: string
  color: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
  }

  const [errored, setErrored] = useState(false)
  const showImage = src && !errored

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold tracking-wide text-gray-800',
        sizes[size],
        className,
      )}
      style={showImage ? undefined : { backgroundColor: color }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        initials(name)
      )}
    </span>
  )
}
