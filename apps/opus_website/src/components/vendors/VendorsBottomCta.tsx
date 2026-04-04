'use client'

import Link from 'next/link'
import { Palette, ListChecks, MessageCircleHeart } from 'lucide-react'
import { motion } from 'motion/react'
import { ease, duration as dur, drift } from '@/lib/motion'
import type { LucideIcon } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Step {
  Icon: LucideIcon
  bg: string
  iconColor: string
  title: string
  description: string
}

const steps: Step[] = [
  {
    Icon: Palette,
    bg: 'bg-pink-50',
    iconColor: 'text-pink-400',
    title: 'Start with style',
    description:
      'Take our quiz to tame the planning chaos and find venues, invitations and website designs in your style.',
  },
  {
    Icon: ListChecks,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-400',
    title: 'Dig into the details',
    description:
      'When hunting for the right vendors, short list the ones whose offerings make your heart swoon.',
  },
  {
    Icon: MessageCircleHeart,
    bg: 'bg-violet-50',
    iconColor: 'text-violet-400',
    title: 'Get in touch',
    description:
      "Go ahead, they won't bite. Reach out and ask the experts about their availability, pricing, and experience.",
  },
]

interface CtaCard {
  title: string
  description: string
  cta: string
  href: string
  bg: string
}

const cards: CtaCard[] = [
  {
    title: 'Find local wedding events',
    description:
      'Wedding planning at home is fun. Wedding planning in person? On another level.',
    cta: 'Plan in person',
    href: '/events',
    bg: 'bg-[#FDF6EC]',
  },
  {
    title: 'The highest-rated vendors of the year',
    description: 'Discover the Best of Weddings award winners near you.',
    cta: 'See the winners',
    href: '/vendors/best',
    bg: 'bg-[#FDF0F5]',
  },
  {
    title: 'Unforgettable Venues Collection',
    description:
      'A curated collection of wedding locations you never knew existed — that you can actually book.',
    cta: 'Explore venues',
    href: '/vendors/browse?category=venues',
    bg: 'bg-[#EEF2FA]',
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function VendorsBottomCta() {
  const fadeUp = (delay: number, dy = drift.sm) => ({
    initial: { opacity: 0, y: dy },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: dur.md, delay, ease },
  })

  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 pt-20 sm:pt-28 pb-12 sm:pb-16">
      {/* ── Heading ── */}
      <motion.h2
        className="text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem] font-bold text-center text-[var(--foreground)] tracking-tight leading-tight mb-14 sm:mb-20"
        {...fadeUp(0)}
      >
        Let&rsquo;s find your wedding team
      </motion.h2>

      {/* ── 3-step flow ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 lg:gap-14 mb-14 sm:mb-20">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="flex flex-col items-center text-center"
            {...fadeUp(0.08 + i * 0.08)}
          >
            <div
              className={`${step.bg} w-[72px] h-[72px] rounded-full flex items-center justify-center mb-5`}
            >
              <step.Icon
                className={step.iconColor}
                size={30}
                strokeWidth={1.6}
              />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-2">
              {step.title}
            </h3>
            <p className="text-[0.84rem] leading-relaxed text-[var(--foreground)]/60 max-w-[280px]">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── CTA cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            className={`${card.bg} rounded-xl sm:rounded-2xl px-7 py-9 sm:px-8 sm:py-10 flex flex-col items-center text-center`}
            {...fadeUp(0.08 + i * 0.1)}
          >
            <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] leading-snug mb-2.5">
              {card.title}
            </h3>
            <p className="text-[0.84rem] leading-relaxed text-[var(--foreground)]/60 mb-7 max-w-[260px]">
              {card.description}
            </p>
            <Link
              href={card.href}
              className="inline-block bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#1A1A1A] px-6 py-2.5 rounded-full font-semibold text-sm transition-colors"
            >
              {card.cta}
            </Link>
          </motion.div>
        ))}
      </div>

    </section>
  )
}
