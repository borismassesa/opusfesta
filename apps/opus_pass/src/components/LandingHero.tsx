'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, StarHalf } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkles as SparkleField } from '@/components/ui/sparkles'

// Shared hero used by both the OpusPass home page and the /websites landing
// page so the two stay visually identical. The first 7 fields are required; the
// rest are optional — pages that omit them fall back to the defaults below, so
// /websites keeps the built-in trust badge & press strip while the homepage CMS
// can override them.
export type LandingHeroContent = {
  headline_line_1: string
  headline_line_2: string
  description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  trust_count?: string
  rating?: string
  avatars?: string[]
  featured_in?: string[]
}

// Default couple photos for the "trusted by" avatar cluster.
const HERO_AVATARS = [
  '/assets/images/cutesy_couple.jpg',
  '/assets/images/churchcouples.jpg',
  '/assets/images/coupleswithpiano.jpg',
  '/assets/images/authentic_couple.jpg',
  '/assets/images/mauzo_crew.jpg',
]

// Default "As featured in" press names.
const FEATURED_IN_DEFAULT = ['The Citizen', 'Clouds FM', 'Bongo5', 'JamiiForums']

// Cycling typographic treatments applied to the press names by index.
const FEATURED_STYLES = [
  'font-serif italic',
  'font-extrabold tracking-tight',
  'font-black',
  'font-bold tracking-tight',
]

export function LandingHero({ content: HERO }: { content: LandingHeroContent }) {
  // Underline only the last word of line 1 (echoes the reference's accented word).
  const line1 = HERO.headline_line_1.trim().replace(/,\s*$/, '')
  const line1LastSpace = line1.lastIndexOf(' ')
  const line1Head = line1LastSpace === -1 ? '' : line1.slice(0, line1LastSpace + 1)
  const line1LastWord = line1LastSpace === -1 ? line1 : line1.slice(line1LastSpace + 1)

  const avatars = HERO.avatars && HERO.avatars.length > 0 ? HERO.avatars : HERO_AVATARS
  const featured = HERO.featured_in && HERO.featured_in.length > 0 ? HERO.featured_in : FEATURED_IN_DEFAULT
  const trustCount = HERO.trust_count ?? '1000+'
  const ratingValue = HERO.rating ?? '4.5'
  const ratingNum = Number.parseFloat(ratingValue) || 4.5
  const fullStars = Math.floor(ratingNum)
  const hasHalf = ratingNum - fullStars >= 0.5

  return (
    <section className="px-2 sm:px-3 pt-10 sm:pt-14 md:pt-16">
      <div className="mx-auto max-w-5xl text-center">
        {/* Trust badge — avatar cluster + star rating */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex -space-x-2.5">
            {avatars.map((src, i) => (
              <span
                key={`${src}-${i}`}
                className="relative inline-block h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full ring-2 ring-white shadow-sm"
                style={{ zIndex: avatars.length - i }}
              >
                <Image src={src} alt="" fill sizes="40px" className="object-cover" />
              </span>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center gap-0.5 text-[#F59E0B]"
                role="img"
                aria-label={`Rated ${ratingValue} out of 5`}
              >
                {Array.from({ length: fullStars }).map((_, i) => (
                  <Star key={i} size={15} className="fill-current" strokeWidth={0} />
                ))}
                {hasHalf && <StarHalf size={15} className="fill-current" strokeWidth={0} />}
              </div>
              <span className="text-[13px] font-extrabold text-[#1A1A1A]">{ratingValue}</span>
            </div>
            <p className="mt-0.5 text-[12px] sm:text-[13px] leading-tight text-[#1A1A1A]/70">
              Trusted by <span className="font-extrabold text-[#1A1A1A]">{trustCount}</span> couples
            </p>
          </div>
        </div>

        {/* Headline — line 1's last word carries the underline accent, line 2 the ⚡ */}
        <h1 className="mt-7 sm:mt-8 text-[2.1rem] sm:text-[3rem] md:text-[3.6rem] lg:text-[4rem] font-black tracking-tight leading-[1.08] text-[#1A1A1A]">
          {line1Head}
          <span className="underline decoration-[#1A1A1A] decoration-[6px] underline-offset-[8px]">
            {line1LastWord}
          </span>
          <br />
          {HERO.headline_line_2}{' '}
          <span aria-hidden>⚡</span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto mt-6 sm:mt-7 max-w-2xl text-[16px] sm:text-[18px] md:text-[19px] leading-[1.7] text-[#1A1A1A]/70">
          {HERO.description}
        </p>

        {/* CTAs */}
        <div className="mt-9 sm:mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <Link
            href={HERO.primary_cta_href}
            className="inline-flex items-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-7 py-3 text-[13px] sm:text-[14px] font-extrabold uppercase tracking-[0.1em]"
          >
            {HERO.primary_cta_label}
          </Link>
          <Link
            href={HERO.secondary_cta_href}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-6 py-3 text-[13px] sm:text-[14px] font-semibold text-[#1A1A1A] hover:border-gray-300 hover:bg-gray-50"
          >
            {HERO.secondary_cta_label}
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {/* As featured in — left-aligned label beside the press wordmarks,
            rising over a sparkle horizon */}
        <div className="relative mt-12 sm:mt-14">
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-x-8">
            <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]/40">
              As featured in
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-10">
              {featured.map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className={cn(
                    'text-lg sm:text-xl text-[#1A1A1A]/40 transition-colors hover:text-[#1A1A1A]/70',
                    FEATURED_STYLES[i % FEATURED_STYLES.length],
                  )}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Sparkle horizon — violet particles rising in the "sky" above a
              softly glowing curved horizon. The white "ground" below the curve
              clips the lower sparkles so the horizon line stays clean. */}
          <div className="pointer-events-none relative -mt-2 h-64 w-full overflow-hidden [mask-image:radial-gradient(65%_65%,white,transparent)] sm:h-72">
            <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,var(--gradient-color),transparent_70%)] before:opacity-45" />
            <SparkleField
              density={700}
              color="#8350E8"
              size={2.4}
              minSize={0.8}
              opacity={1}
              minOpacity={0.6}
              className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
            />
            {/* White ground + the curved horizon line on its top edge */}
            <div className="absolute -left-1/2 top-1/2 z-10 aspect-[1/0.7] w-[200%] rounded-[100%] border-t border-[#1A1A1A]/12 bg-white" />
          </div>
        </div>
      </div>
    </section>
  )
}
