import type { CSSProperties } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { assetPath } from '@/lib/asset-path'
import {
  loadHomepageShowcaseContent,
  type HomepageShowcasePill,
} from '@/lib/cms/homepage-showcase'
import { getLocale } from '@/lib/cms/locale'

// Pinterest-style masonry: a row of columns, each offset vertically and holding
// cards of varying heights. The layout and aspect ratios are fixed here; each
// card's photo comes from CMS content (mapped by `i` into content.images), and
// the floating pills attach to a card by their `slot` (also that index).
type CardSlot = { i: number; aspect: string }

// Column stagger offsets shrink on phones: the cards there are ~120px wide, so
// the desktop offsets (mt-52 = 208px) would leave a dead gap taller than the
// cards themselves.
const COLUMNS: { className: string; cards: CardSlot[]; hasCaption?: boolean }[] = [
  { className: 'flex mt-20 sm:mt-52', cards: [{ i: 0, aspect: 'aspect-[3/4]' }] },
  {
    className: 'flex mt-2 sm:mt-4',
    cards: [
      { i: 1, aspect: 'aspect-[4/5]' },
      { i: 2, aspect: 'aspect-[4/5]' },
    ],
  },
  { className: 'flex mt-10 sm:mt-24', cards: [{ i: 3, aspect: 'aspect-[2/3]' }], hasCaption: true },
  {
    className: 'hidden sm:flex mt-0',
    cards: [
      { i: 4, aspect: 'aspect-[4/5]' },
      { i: 5, aspect: 'aspect-square' },
    ],
  },
  { className: 'hidden lg:flex mt-32', cards: [{ i: 6, aspect: 'aspect-[3/4]' }] },
]

// Pick readable text (near-black or white) for a given pill background colour.
function textOn(hex: string): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
  if (!m) return '#1A1A1A'
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  // Relative luminance (sRGB approximation).
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#1A1A1A' : '#FFFFFF'
}

function VisitPill({ pill, delay }: { pill: HomepageShowcasePill; delay: string }) {
  const fg = textOn(pill.color)
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute bottom-4 z-10',
        pill.side === 'right' ? 'right-0 translate-x-1/3' : 'left-0 -translate-x-1/3',
      )}
    >
      <span
        style={
          { '--pill-delay': delay, '--pill-dur': '8s', backgroundColor: pill.color, color: fg } as CSSProperties
        }
        className="animate-pill-pop inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.05] sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-sm"
      >
        <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
        {pill.label}
      </span>
    </span>
  )
}

function StatPill({ pill, delay }: { pill: HomepageShowcasePill; delay: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-6 left-0 z-20 hidden -translate-x-[80%] sm:block"
    >
      <span
        style={{ '--pill-delay': delay, '--pill-dur': '8s' } as CSSProperties}
        className="animate-pill-pop block w-[210px] rounded-3xl bg-white p-4 shadow-[0_22px_45px_-15px_rgba(0,0,0,0.4)] ring-1 ring-black/[0.05]"
      >
        <p className="text-lg font-extrabold tracking-tight text-[#1A1A1A]">{pill.label}</p>
        <div className="relative mt-3 h-10">
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#1A1A1A]/35" />
          <svg viewBox="0 0 200 56" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path
              d="M2,48 C38,44 52,30 88,28 C120,26 138,12 198,4"
              fill="none"
              stroke={pill.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute bottom-0 left-0 text-xs font-semibold text-[#1A1A1A]/55">
            {pill.sublabel}
          </span>
        </div>
      </span>
    </span>
  )
}

function TogglePill({ pill, delay }: { pill: HomepageShowcasePill; delay: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-6 z-20 hidden sm:block',
        pill.side === 'right' ? 'right-0 translate-x-[80%]' : 'left-0 -translate-x-[80%]',
      )}
    >
      <span
        style={{ '--pill-delay': delay, '--pill-dur': '8s' } as CSSProperties}
        className="animate-pill-pop inline-flex items-center gap-3 rounded-full bg-white py-2.5 pr-2.5 pl-5 shadow-[0_16px_35px_-10px_rgba(0,0,0,0.4)] ring-1 ring-black/[0.05]"
      >
        <span className="whitespace-nowrap text-base font-extrabold text-[#1A1A1A]">{pill.label}</span>
        <span
          className="inline-flex h-6 w-10 shrink-0 items-center rounded-full px-0.5"
          style={{ backgroundColor: pill.color }}
        >
          <span className="ml-auto h-5 w-5 rounded-full bg-white shadow" />
        </span>
      </span>
    </span>
  )
}

export async function Showcase() {
  const locale = await getLocale()
  const content = await loadHomepageShowcaseContent(locale)
  const imageAt = (i: number) => content.images[i] ?? { src: '', alt: '' }

  // Stagger the pop-in by list order so animation stays automatic regardless of
  // how many pills the admin adds or where they place them.
  const pillsWithDelay = content.pills.map((pill, idx) => ({
    pill,
    delay: `${(1.5 + idx * 1.1).toFixed(1)}s`,
  }))
  const pillsForSlot = (slot: number) => pillsWithDelay.filter((p) => p.pill.slot === slot)

  return (
    <section className="overflow-hidden bg-white py-10 [content-visibility:auto] [contain-intrinsic-size:auto_700px] sm:py-14">
      <div className="relative mx-auto w-full">
        {/* Row is wider than the viewport and centered, so the first/last columns
            bleed ~20% off each edge (clipped by the section's overflow-hidden). */}
        <div className="relative left-1/2 flex w-[108%] -translate-x-1/2 items-start gap-3 sm:gap-4">
          {COLUMNS.map((col, ci) => (
            <div key={ci} className={cn('w-full flex-1 flex-col gap-3 sm:gap-4', col.className)}>
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
                    {pillsForSlot(card.i).map(({ pill, delay }) =>
                      pill.kind === 'visit' ? (
                        <VisitPill key={pill.id} pill={pill} delay={delay} />
                      ) : pill.kind === 'stat' ? (
                        <StatPill key={pill.id} pill={pill} delay={delay} />
                      ) : (
                        <TogglePill key={pill.id} pill={pill} delay={delay} />
                      ),
                    )}
                  </div>
                )
              })}

              {col.hasCaption ? (
                // Hidden on phones: this column bleeds off the right edge there,
                // so the caption would render clipped and unreadable.
                <div
                  className="animate-pill-pop mt-1 hidden px-1 sm:block"
                  style={{ '--pill-dur': '7s' } as CSSProperties}
                >
                  <h3 className="text-sm font-bold leading-tight tracking-tight text-[#1A1A1A] sm:text-xl">
                    {content.caption.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 sm:mt-3 sm:gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full sm:h-12 sm:w-12">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={assetPath('/assets/logo/opusfesta-logo-mark.png')}
                        alt=""
                        className="h-full w-full scale-150 object-contain"
                      />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-xs font-bold text-[#1A1A1A] sm:text-sm">
                        {content.caption.by}
                      </span>
                      <span className="block text-xs text-[#1A1A1A]/65 sm:text-sm">{content.caption.brand}</span>
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
