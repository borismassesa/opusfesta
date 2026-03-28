'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Star, ArrowLeft, ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'

const testimonials = [
  {
    name: 'Sarah Mwangi',
    role: 'Couple',
    company: 'Sarah & James',
    city: 'Dar es Salaam',
    stars: 5,
    quote: 'OpusFesta made planning our wedding a breeze! The checklist kept us sane and the website builder was so fun to use.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bg: 'dark',
  },
  {
    name: 'Michael Osei',
    role: 'Vendor',
    company: 'Osei Photography',
    city: 'Zanzibar',
    stars: 4,
    quote: 'Finding couples was never this easy. OpusFesta brought us consistent bookings and our profile gets seen by the right people.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    bg: 'accent',
  },
  {
    name: 'Emma Lindqvist',
    role: 'Couple',
    company: 'Emma & David',
    city: 'Arusha',
    stars: 5,
    quote: 'The universal registry is a game changer. We added gifts from 5 different stores and a honeymoon fund without any extra fees.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    bg: 'dark',
  },
  {
    name: 'Fatuma Hassan',
    role: 'Couple',
    company: 'Fatuma & Kevin',
    city: 'Mwanza',
    stars: 5,
    quote: 'I was overwhelmed before OpusFesta. The budget planner alone saved us from going over by TZS 5 million. Absolute lifesaver.',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
    bg: 'accent',
  },
  {
    name: 'Aisha Kamau',
    role: 'Vendor',
    company: 'Bloom & Petal Florists',
    city: 'Nairobi',
    stars: 4,
    quote: 'As a florist, managing enquiries used to be chaos. OpusFesta streamlined everything — bookings, messages, payments, all in one place.',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80',
    bg: 'dark',
  },
  {
    name: 'Daniel Nkrumah',
    role: 'Couple',
    company: 'Daniel & Grace',
    city: 'Dodoma',
    stars: 5,
    quote: 'We found our caterer and florist through OpusFesta in Dar es Salaam. Both verified, responsive and fairly priced.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bg: 'accent',
  },
  {
    name: 'Lucia Ferreira',
    role: 'Vendor',
    company: 'Golden Hour Venues',
    city: 'Moshi',
    stars: 4,
    quote: 'Our venue bookings increased by 60% since joining OpusFesta. The verified badge alone gives couples so much confidence to reach out.',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
    bg: 'dark',
  },
  {
    name: 'Omar Al-Rashid',
    role: 'Couple',
    company: 'Omar & Priya',
    city: 'Dar es Salaam',
    stars: 5,
    quote: "Comparing vendor packages side-by-side saved us so much time. The pricing transparency was something we'd never found before.",
    image: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&w=200&q=80',
    bg: 'accent',
  },
]

const GAP = 16

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  const [lastDir, setLastDir] = useState<'prev' | 'next'>('next')
  const containerRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setCardWidth(el.clientWidth * 0.72)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const prev = () => {
    if (index === 0) return
    setLastDir('prev')
    setIndex((i) => i - 1)
  }

  const next = () => {
    if (index === testimonials.length - 1) return
    setLastDir('next')
    setIndex((i) => i + 1)
  }

  const atStart = index === 0
  const atEnd = index === testimonials.length - 1

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row gap-12 md:gap-8 items-center">

        {/* Left */}
        <Reveal direction="up" className="md:w-[38%] shrink-0">
          <h2 className="text-4xl md:text-6xl lg:text-[80px] font-black tracking-tighter uppercase leading-[0.85] mb-8 md:mb-12 text-[#1A1A1A]">
            WHAT THEY SAY
            <br />
            ABOUT US
          </h2>
          <div className="flex gap-3">
            {/* Left arrow — green when we can go back, gray when at start */}
            <button
              onClick={prev}
              disabled={atStart}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                !atStart && lastDir === 'prev'
                  ? 'bg-[var(--accent)] border-2 border-[var(--on-accent)] text-[var(--on-accent)]'
                  : !atStart
                  ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
            {/* Right arrow — green when we can go forward, gray when at end */}
            <button
              onClick={next}
              disabled={atEnd}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                !atEnd && lastDir === 'next'
                  ? 'bg-[var(--accent)] border-2 border-[var(--on-accent)] text-[var(--on-accent)]'
                  : !atEnd
                  ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ArrowRight size={22} strokeWidth={2} />
            </button>
          </div>
        </Reveal>

        {/* Carousel */}
        <div ref={containerRef} className="md:w-[62%] overflow-hidden">
          <motion.div
            className="flex"
            style={{ gap: GAP }}
            animate={{ x: cardWidth ? -(index * (cardWidth + GAP)) : 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            {testimonials.map((t, i) => {
              const isAccent = t.bg === 'accent'
              return (
                <div
                  key={i}
                  style={{ minWidth: cardWidth || '72%', maxWidth: cardWidth || '72%' }}
                  className={`rounded-[32px] p-6 md:p-8 flex flex-col shrink-0 h-auto md:h-[420px] ${
                    isAccent ? 'bg-[var(--accent)]' : 'bg-[#1A1A1A]'
                  }`}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={18}
                        fill={s < t.stars ? '#F5A623' : 'transparent'}
                        className={s < t.stars ? 'text-[#F5A623]' : isAccent ? 'text-[var(--on-accent)]/20' : 'text-white/20'}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className={`text-base md:text-xl font-semibold leading-snug flex-1 ${isAccent ? 'text-[var(--on-accent)]' : 'text-white'}`}>
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Footer */}
                  <div className={`flex items-center gap-4 pt-6 mt-6 border-t ${isAccent ? 'border-[var(--on-accent)]/15' : 'border-white/10'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isAccent ? 'text-[var(--on-accent)]' : 'text-white'}`}>{t.company}</p>
                      <p className={`text-xs mt-0.5 truncate ${isAccent ? 'text-[var(--on-accent)]/50' : 'text-white/40'}`}>{t.city}</p>
                    </div>
                    <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
                      isAccent ? 'bg-[var(--on-accent)] text-[var(--accent)]' : 'bg-[var(--accent)] text-[var(--on-accent)]'
                    }`}>
                      {t.role}
                    </span>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>

      </div>
    </section>
  )
}
