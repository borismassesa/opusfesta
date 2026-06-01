'use client'

import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GuestsHeroContent } from '@/lib/cms/guests-hero'

// Scattered Pinterest-style collage for the hero's right column. Positions and
// sizes are percentages of a square container so the whole arrangement scales.
// Image src/alt come from CMS content (by index); the layout stays fixed here.
const COLLAGE_LAYOUT: { className: string; priority?: boolean }[] = [
  { className: 'left-[6%] top-[1%] lg:-top-[23%] w-[34%] aspect-[5/4]' },
  { className: 'right-[2%] top-[2%] lg:-top-[24%] w-[22%] aspect-square' },
  { className: 'left-1/2 top-[15%] lg:top-[1%] w-[47%] -translate-x-1/2 aspect-[4/5] z-20', priority: true },
  { className: 'right-0 top-[32%] lg:top-[18%] w-[23%] aspect-[3/4]' },
  { className: 'left-[1%] bottom-[2%] lg:bottom-[16%] w-[33%] aspect-[3/4]' },
  { className: 'right-[3%] bottom-[1%] lg:bottom-[15%] w-[32%] aspect-[5/4]' },
]

const HeroSection = ({ content }: { content: GuestsHeroContent }) => {
  const collage = COLLAGE_LAYOUT.map((layout, i) => ({
    ...layout,
    src: content.collage[i]?.src ?? '',
    alt: content.collage[i]?.alt ?? '',
  })).filter((c) => c.src)

  return (
    <section className="relative">
      {/* Soft brand wash + blurred blobs (clipped here so the section itself can
          overflow vertically — letting the top cards tuck up behind the navbar). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F6EEFB] via-white to-white" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#C9A0DC]/30 blur-3xl" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-[#9FE870]/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:pt-20 lg:pb-24">
        {/* ── Left: copy ── */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-balance text-[#1A1A1A] sm:text-5xl lg:text-6xl">
            {content.headline_lead}{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">{content.headline_highlight}</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 -z-0 h-3.5 -rotate-1 rounded-sm bg-[#C9A0DC]/55 sm:bottom-1.5 sm:h-4"
              />
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#1A1A1A]/65 sm:text-lg lg:mx-0">
            {content.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button size="lg" asChild>
              <Link href={content.primary_cta_href}>{content.primary_cta_label}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={content.secondary_cta_href}>{content.secondary_cta_label}</Link>
            </Button>
          </div>

          {/* Trust cluster */}
          {content.avatars.length > 0 && (
            <div className="mt-9 flex items-center justify-center gap-3 lg:justify-start">
              <div className="flex -space-x-2.5">
                {content.avatars.map((src, i) => (
                  <span
                    key={`${src}-${i}`}
                    className="relative inline-block h-9 w-9 overflow-hidden rounded-full ring-2 ring-white shadow-sm"
                    style={{ zIndex: content.avatars.length - i }}
                  >
                    <Image src={src} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-left text-[13px] leading-tight text-[#1A1A1A]/65">
                <span className="font-bold text-[#1A1A1A]">{content.trust_lead}</span>
                <br />
                {content.trust_rest}
              </p>
            </div>
          )}
        </div>

        {/* ── Right: scattered photo collage ── */}
        <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
          {collage.map((card, i) => (
            <div
              key={`${card.src}-${i}`}
              className={cn(
                'absolute overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_-20px_rgba(0,0,0,0.4)] ring-1 ring-black/[0.05] sm:rounded-3xl',
                card.className,
              )}
            >
              <Image
                src={card.src}
                alt={card.alt}
                fill
                priority={card.priority}
                sizes="(min-width: 1024px) 18vw, (min-width: 640px) 22vw, 40vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
