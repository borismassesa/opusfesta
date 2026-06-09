'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { assetPath } from '@/lib/asset-path'
import { InvitationVisual, COUPLE_DEFAULT, type Treatment } from '@/components/guests/InvitationVisual'

// Shows the designer-uploaded card images for a product. Designs are finished
// artwork (PNG/JPG/WebP/SVG) authored at the 5:7 card ratio, so each fills a
// 5:7 frame via object-cover. A thumbnail strip switches the active design.
// When a product has no uploaded designs yet, it falls back to the built-in
// CSS `treatment` so legacy products still render.
export function DesignCarousel({
  designs,
  treatment,
  favourited = false,
  onFavourite,
}: {
  designs: string[]
  treatment: Treatment
  favourited?: boolean
  onFavourite?: () => void
}) {
  const images = designs.filter(Boolean)
  const [active, setActive] = useState(0)
  const activeIndex = Math.min(active, Math.max(0, images.length - 1))

  return (
    <div className="max-w-[520px]">
      {/* Main view — 5:7 portrait to match the card proportions. */}
      <div className="relative aspect-[5/7] bg-white rounded-md shadow-md overflow-hidden">
        {images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assetPath(images[activeIndex])}
            alt={`Card design ${activeIndex + 1}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <InvitationVisual treatment={treatment} couple={COUPLE_DEFAULT} />
        )}

        {onFavourite && (
          <button
            type="button"
            onClick={onFavourite}
            aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
            aria-pressed={favourited}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-sm hover:bg-white transition z-10"
          >
            <Heart className={cn('h-4 w-4', favourited ? 'fill-red-500 text-red-500' : 'text-[#1A1A1A]')} />
          </button>
        )}
      </div>

      {/* Thumbnail strip — only when there's more than one design to switch between. */}
      {images.length > 1 && (
        <div
          className="mt-4 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))` }}
        >
          {images.map((url, i) => {
            const isActive = i === activeIndex
            return (
              <button
                key={`${url}-${i}`}
                type="button"
                aria-label={`View design ${i + 1}`}
                aria-pressed={isActive}
                onClick={() => setActive(i)}
                className={cn(
                  'relative aspect-[5/7] rounded-sm overflow-hidden transition',
                  isActive ? 'ring-2 ring-gray-400 ring-offset-2' : 'ring-1 ring-gray-200 hover:ring-gray-400',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetPath(url)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
