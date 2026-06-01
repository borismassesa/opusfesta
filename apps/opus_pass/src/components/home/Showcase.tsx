import type { CSSProperties } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { loadHomepageShowcaseContent } from '@/lib/cms/homepage-showcase'

// Pinterest-style masonry: a row of columns, each offset vertically and holding
// cards of varying heights. The layout, aspect ratios and decorative pills are
// fixed here; each card's photo (and the caption text) come from CMS content,
// mapped by `i` into the flat content.images array.
type CardSlot = {
  i: number
  aspect: string
  visit?: string
  visitSide?: 'left' | 'right'
  stat?: string
  toggle?: string
}

const COLUMNS: { className: string; cards: CardSlot[]; hasCaption?: boolean }[] = [
  {
    className: 'flex mt-52',
    cards: [{ i: 0, aspect: 'aspect-[3/4]' }],
  },
  {
    className: 'flex mt-4',
    cards: [
      { i: 1, aspect: 'aspect-[4/5]', stat: '3s' },
      { i: 2, aspect: 'aspect-[4/5]', visit: '1.5s' },
    ],
  },
  {
    className: 'flex mt-24',
    cards: [{ i: 3, aspect: 'aspect-[2/3]' }],
    hasCaption: true,
  },
  {
    className: 'hidden sm:flex mt-0',
    cards: [
      { i: 4, aspect: 'aspect-[4/5]' },
      { i: 5, aspect: 'aspect-square', visit: '5s', visitSide: 'right' },
    ],
  },
  {
    className: 'hidden lg:flex mt-32',
    cards: [{ i: 6, aspect: 'aspect-[3/4]', toggle: '2.5s' }],
  },
]

export async function Showcase() {
  const content = await loadHomepageShowcaseContent()
  const imageAt = (i: number) => content.images[i] ?? { src: '', alt: '' }

  return (
    <section className="overflow-hidden bg-white py-10 [content-visibility:auto] [contain-intrinsic-size:auto_700px] sm:py-14">
      <div className="relative mx-auto w-full">
        {/* Row is wider than the viewport and centered, so the first/last columns
            bleed ~20% off each edge (clipped by the section's overflow-hidden). */}
        <div className="relative left-1/2 flex w-[108%] -translate-x-1/2 items-start gap-3 sm:gap-4">
          {COLUMNS.map((col, ci) => (
            <div
              key={ci}
              className={cn('w-full flex-1 flex-col gap-3 sm:gap-4', col.className)}
            >
              {col.cards.map((card) => {
                const img = imageAt(card.i)
                return (
                  <div key={card.i} className="relative w-full">
                    <div
                      className={cn(
                        'relative w-full overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/[0.04] sm:rounded-3xl',
                        card.aspect,
                      )}
                    >
                      {img.src ? (
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    {card.visit ? (
                      <span
                        aria-hidden
                        className={cn(
                          'pointer-events-none absolute bottom-4 z-10',
                          card.visitSide === 'right'
                            ? 'right-0 translate-x-1/3'
                            : 'left-0 -translate-x-1/3',
                        )}
                      >
                        <span
                          style={
                            { '--pill-delay': card.visit, '--pill-dur': '8s' } as CSSProperties
                          }
                          className="animate-pill-pop inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#1A1A1A] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.05]"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          Visit
                        </span>
                      </span>
                    ) : null}
                    {card.stat ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-6 left-0 z-20 hidden -translate-x-[80%] sm:block"
                      >
                        <span
                          style={
                            { '--pill-delay': card.stat, '--pill-dur': '8s' } as CSSProperties
                          }
                          className="animate-pill-pop block w-[210px] rounded-3xl bg-white p-4 shadow-[0_22px_45px_-15px_rgba(0,0,0,0.4)] ring-1 ring-black/[0.05]"
                        >
                          <p className="text-lg font-extrabold tracking-tight text-[#1A1A1A]">
                            Performance
                          </p>
                          <div className="relative mt-3 h-10">
                            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#1A1A1A]/35" />
                            <svg
                              viewBox="0 0 200 56"
                              preserveAspectRatio="none"
                              className="absolute inset-0 h-full w-full"
                            >
                              <path
                                d="M2,48 C38,44 52,30 88,28 C120,26 138,12 198,4"
                                fill="none"
                                stroke="#9FE870"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="absolute bottom-0 left-0 text-xs font-semibold text-[#1A1A1A]/55">
                              Sales
                            </span>
                          </div>
                        </span>
                      </span>
                    ) : null}
                    {card.toggle ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -top-5 left-2 z-20 hidden sm:block"
                      >
                        <span
                          style={
                            { '--pill-delay': card.toggle, '--pill-dur': '8s' } as CSSProperties
                          }
                          className="animate-pill-pop inline-flex items-center gap-3 rounded-full bg-white py-2.5 pr-2.5 pl-5 shadow-[0_16px_35px_-10px_rgba(0,0,0,0.4)] ring-1 ring-black/[0.05]"
                        >
                          <span className="whitespace-nowrap text-base font-extrabold text-[#1A1A1A]">
                            Live RSVPs
                          </span>
                          <span className="inline-flex h-6 w-10 shrink-0 items-center rounded-full bg-[#9FE870] px-0.5">
                            <span className="ml-auto h-5 w-5 rounded-full bg-white shadow" />
                          </span>
                        </span>
                      </span>
                    ) : null}
                  </div>
                )
              })}

              {col.hasCaption ? (
                <div
                  className="animate-pill-pop mt-1 px-1"
                  style={{ '--pill-dur': '7s' } as CSSProperties}
                >
                  <h3 className="text-lg font-bold leading-tight tracking-tight text-[#1A1A1A] sm:text-xl">
                    {content.caption.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9FE870] text-sm font-extrabold text-[#1A1A1A]">
                      O.
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-bold text-[#1A1A1A]">
                        {content.caption.by}
                      </span>
                      <span className="block text-sm text-[#1A1A1A]/65">{content.caption.brand}</span>
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
