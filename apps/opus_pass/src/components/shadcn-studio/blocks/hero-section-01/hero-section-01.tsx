'use client'

import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Real couple photos reused for the "trusted by" avatar cluster.
const HERO_AVATARS = [
  '/assets/images/cutesy_couple.jpg',
  '/assets/images/authentic_couple.jpg',
  '/assets/images/couples_together.jpg',
  '/assets/images/beautiful_bride.jpg',
]

// Scattered Pinterest-style collage for the hero's right column. Positions and
// sizes are percentages of a square container so the whole arrangement scales.
const COLLAGE: { src: string; alt: string; className: string; priority?: boolean }[] = [
  {
    src: '/assets/images/flowers_pinky.jpg',
    alt: 'Wedding flowers',
    className: 'left-[6%] top-[1%] lg:-top-[23%] w-[34%] aspect-[5/4]',
  },
  {
    src: '/assets/images/bridering.jpg',
    alt: 'Wedding rings',
    className: 'right-[2%] top-[2%] lg:-top-[24%] w-[22%] aspect-square',
  },
  {
    src: '/assets/images/cutesy_couple.jpg',
    alt: 'A couple celebrating with their guests',
    className: 'left-1/2 top-[15%] lg:top-[1%] w-[47%] -translate-x-1/2 aspect-[4/5] z-20',
    priority: true,
  },
  {
    src: '/assets/images/hand_rings.jpg',
    alt: 'Hands with wedding rings',
    className: 'right-0 top-[32%] lg:top-[18%] w-[23%] aspect-[3/4]',
  },
  {
    src: '/assets/images/authentic_couple.jpg',
    alt: 'Couple portrait',
    className: 'left-[1%] bottom-[2%] lg:bottom-[16%] w-[33%] aspect-[3/4]',
  },
  {
    src: '/assets/images/coupleswithpiano.jpg',
    alt: 'Couple at the piano',
    className: 'right-[3%] bottom-[1%] lg:bottom-[15%] w-[32%] aspect-[5/4]',
  },
]

const HeroSection = () => {
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
            Your guest list,
            <br />
            replying in{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">real time</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 -z-0 h-3.5 -rotate-1 rounded-sm bg-[#C9A0DC]/55 sm:bottom-1.5 sm:h-4"
              />
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#1A1A1A]/65 sm:text-lg lg:mx-0">
            Send digital invitations by WhatsApp or SMS and watch the{' '}
            <span className="font-semibold text-[#1A1A1A]">&ldquo;Joyful yes&rdquo;</span> replies roll
            in — a free guest list and bilingual RSVP page in English &amp; Swahili.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button size="lg" asChild>
              <Link href="/sign-up?redirect_url=%2Fmy%2Fdashboard%3Fseed%3D1">
                Start your guest list
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#collection">See how it works</Link>
            </Button>
          </div>

          {/* Trust cluster */}
          <div className="mt-9 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-2.5">
              {HERO_AVATARS.map((src, i) => (
                <span
                  key={src}
                  className="relative inline-block h-9 w-9 overflow-hidden rounded-full ring-2 ring-white shadow-sm"
                  style={{ zIndex: HERO_AVATARS.length - i }}
                >
                  <Image src={src} alt="" fill sizes="36px" className="object-cover" />
                </span>
              ))}
            </div>
            <p className="text-left text-[13px] leading-tight text-[#1A1A1A]/65">
              <span className="font-bold text-[#1A1A1A]">Trusted by 500+</span>
              <br />
              Tanzanian couples
            </p>
          </div>
        </div>

        {/* ── Right: scattered photo collage ── */}
        <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
          {COLLAGE.map((card) => (
            <div
              key={card.src}
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
