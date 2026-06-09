'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { assetPath } from '@/lib/asset-path'
import { InvitationVisual, COUPLE_DEFAULT, type Treatment } from '@/components/guests/InvitationVisual'

// Product detail carousel. Two kinds of slide, each shown at its own ratio:
//   • hero    — the portrait card cover (3:4), also used on the catalog/landing
//   • designs — landscape "mockup" views authored at 800×600 (4:3)
// The main frame adapts to the active slide's orientation so neither is cropped
// or distorted (object-cover fills exactly because the artwork matches the
// frame ratio). Falls back to the built-in CSS `treatment` when nothing is set.
type Slide = { url: string; portrait: boolean }

export function DesignCarousel({
  hero,
  designs,
  treatment,
  favourited = false,
  onFavourite,
}: {
  hero?: string
  designs: string[]
  treatment: Treatment
  favourited?: boolean
  onFavourite?: () => void
}) {
  const slides: Slide[] = [
    ...(hero ? [{ url: hero, portrait: true }] : []),
    ...designs.filter(Boolean).map((url) => ({ url, portrait: false })),
  ]
  const [active, setActive] = useState(0)
  const activeIndex = Math.min(active, Math.max(0, slides.length - 1))
  const activeSlide = slides[activeIndex]
  const isPortrait = activeSlide?.portrait ?? false

  return (
    <div className={cn('mx-auto w-full transition-[max-width] duration-200', isPortrait ? 'max-w-[480px]' : 'max-w-[800px]')}>
      {/* Main view — portrait (3:4) for the hero, landscape 800×600 (4:3) for designs. */}
      <div
        className={cn(
          'relative w-full bg-white rounded-md shadow-md overflow-hidden',
          isPortrait ? 'aspect-[3/4]' : 'aspect-[4/3]',
        )}
      >
        {activeSlide ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assetPath(activeSlide.url)}
            alt={isPortrait ? 'Card design' : `Card view ${activeIndex + 1}`}
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

      {/* Thumbnail strip — uniform squares so portrait + landscape sit in one tidy row. */}
      {slides.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {slides.map((slide, i) => {
            const thumbActive = i === activeIndex
            return (
              <button
                key={`${slide.url}-${i}`}
                type="button"
                aria-label={slide.portrait ? 'View card design' : `View card view ${i + 1}`}
                aria-pressed={thumbActive}
                onClick={() => setActive(i)}
                className={cn(
                  'relative h-16 w-16 shrink-0 rounded-sm overflow-hidden transition',
                  thumbActive ? 'ring-2 ring-gray-400 ring-offset-2' : 'ring-1 ring-gray-200 hover:ring-gray-400',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetPath(slide.url)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
