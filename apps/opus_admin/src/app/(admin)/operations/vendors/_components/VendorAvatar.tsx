'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

// Vendor avatar: shows the vendor's logo/cover when it loads cleanly,
// otherwise a single-letter monogram on a category-tinted tile. Rendered as a
// rounded square (not a circle) so wide horizontal logos aren't decapitated,
// and the image is `object-cover`d into a fixed square.
//
// Why the onError fallback matters: many vendor logos are broken/404 URLs.
// A bare <img> with a dead src renders its `alt` text wrapped inside the box
// ("Kili manja", "Opu sStudi") — which is what made the old circles look
// broken. On error we swap to the monogram so a missing logo reads as a clean
// initial, never garbled text.

// Soft brand-tinted tiles. When a category is supplied we colour the tile by
// category (so it matches the category chip); otherwise we pick from the name
// so a given vendor is always the same colour.
const TILE_PALETTE = [
  { bg: '#F0DFF6', fg: '#7E5896' }, // lavender
  { bg: '#E8FBDB', fg: '#3F8B5C' }, // sage
  { bg: '#FCE9C2', fg: '#B07F2C' }, // champagne
  { bg: '#DDE9EE', fg: '#3F6B82' }, // periwinkle
  { bg: '#F5DCE2', fg: '#A84F66' }, // rose
] as const

function pickTile(seed: string): (typeof TILE_PALETTE)[number] {
  const hash = [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return TILE_PALETTE[hash % TILE_PALETTE.length]
}

function monogram(name: string): string {
  const first = name.trim().match(/[A-Za-z0-9]/)
  return first ? first[0].toUpperCase() : '?'
}

export function VendorAvatar({
  logoUrl,
  businessName,
  category,
  size = 44,
  className,
}: {
  logoUrl: string | null
  businessName: string
  /** when set, the fallback tile is coloured by category (matches the chip) */
  category?: string | null
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const radius = Math.max(8, Math.round(size * 0.28))

  if (logoUrl && !failed) {
    return (
      <div
        className={cn('overflow-hidden bg-[#EEEDFE] shrink-0', className)}
        style={{ width: size, height: size, borderRadius: radius }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={`${businessName} logo`}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          style={{ width: size, height: size }}
        />
      </div>
    )
  }

  const tile = pickTile(category?.trim() || businessName || '?')
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center font-bold tracking-wide',
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: tile.bg,
        color: tile.fg,
        fontSize: Math.max(13, Math.round(size * 0.42)),
      }}
      aria-hidden
    >
      {monogram(businessName)}
    </div>
  )
}
