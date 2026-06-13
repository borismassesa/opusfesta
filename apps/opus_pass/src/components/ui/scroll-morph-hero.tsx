'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { assetPath } from '@/lib/asset-path'
import type { InvitationsHeroContent } from '@/lib/cms/invitations-hero'

// --- Types ---
export type AnimationPhase = 'scatter' | 'line' | 'circle' | 'bottom-strip'

interface HeroCardProps {
  src: string
  index: number
  target: { x: number; y: number; rotation: number; scale: number; opacity: number }
}

// --- HeroCard Component ---
const IMG_WIDTH = 60
const IMG_HEIGHT = 85

function HeroCard({ src, index, target }: HeroCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{ type: 'spring', stiffness: 40, damping: 15 }}
      style={{
        position: 'absolute',
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
      }}
      className="group"
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-gray-200 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetPath(src)} alt={`Invitation design ${index + 1}`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
      </div>
    </motion.div>
  )
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20
// Phones render a reduced ring — 20 large cards crowd a narrow arc.
const MOBILE_IMAGES = 12

// Invitation card templates + real wedding moments, INTERLEAVED (a template
// roughly every 3rd slot) so any prefix — e.g. the 12-card mobile slice — gets an
// even spread of templates and photos instead of all templates bunching at one
// end of the arc.
const IMAGES = [
  '/assets/invitation-svgs/card-template.svg',
  '/assets/images/cutesy_couple.jpg',
  '/assets/images/authentic_couple.jpg',
  '/assets/invitation-svgs/card-template-4.svg',
  '/assets/images/beautiful_bride.jpg',
  '/assets/images/bride_umbrella.jpg',
  '/assets/invitation-svgs/floral-border.svg',
  '/assets/images/brideincar.jpg',
  '/assets/images/bridering.jpg',
  '/assets/invitation-svgs/navy-gold.svg',
  '/assets/images/bridewithumbrella.jpg',
  '/assets/images/churchcouples.jpg',
  '/assets/invitation-svgs/cultural-red.svg',
  '/assets/images/couples_together.jpg',
  '/assets/images/coupleswithpiano.jpg',
  '/assets/invitation-svgs/classic-serif.svg',
  '/assets/images/flowers_pinky.jpg',
  '/assets/images/hand_rings.jpg',
  '/assets/images/mauzo_crew.jpg',
  '/assets/images/ring_piano.jpg',
]

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t

export default function ScrollMorphHero({ hero }: { hero: InvitationsHeroContent }) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>('scatter')
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // --- Container Size ---
  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(containerRef.current)
    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    })

    return () => observer.disconnect()
  }, [])

  // --- Native scroll-driven morph (pinned). The hero sticks to the viewport
  // while you scroll through the tall wrapper; the next section only appears
  // once the whole animation is done. No wheel hijacking = smooth + light. ---
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  // Morph circle -> arc over the first 55% of the scroll track.
  const morphProgress = useTransform(scrollYProgress, [0, 0.55], [0, 1])
  const smoothMorph = useSpring(morphProgress, { stiffness: 50, damping: 22 })

  // Shuffle the arc over the rest.
  const scrollRotate = useTransform(scrollYProgress, [0.55, 1], [0, 360])
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 50, damping: 22 })

  // --- Mouse Parallax ---
  const mouseX = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      const normalizedX = (relativeX / rect.width) * 2 - 1
      mouseX.set(normalizedX * 100)
    }
    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX])

  // --- Intro Sequence ---
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase('line'), 500)
    const timer2 = setTimeout(() => setIntroPhase('circle'), 2500)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  // --- Scatter Positions ---
  // Deterministic sine-hash (pure — Math.random isn't allowed during render).
  const scatterPositions = useMemo(() => {
    const rand = (n: number) => {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
      return x - Math.floor(x)
    }
    return IMAGES.map((_, i) => ({
      x: (rand(i + 1) - 0.5) * 1500,
      y: (rand(i + 100) - 0.5) * 1000,
      rotation: (rand(i + 200) - 0.5) * 180,
      scale: 0.6,
      opacity: 0,
    }))
  }, [])

  // Fade the arc cards fully out BEFORE the suite content appears (no overlap).
  const cardsFade = useTransform(scrollYProgress, [0.45, 0.6], [1, 0])

  // --- Render Loop ---
  const [morphValue, setMorphValue] = useState(0)
  const [rotateValue, setRotateValue] = useState(0)
  const [parallaxValue, setParallaxValue] = useState(0)
  const [cardsOpacity, setCardsOpacity] = useState(1)

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on('change', setMorphValue)
    const unsubscribeRotate = smoothScrollRotate.on('change', setRotateValue)
    const unsubscribeParallax = smoothMouseX.on('change', setParallaxValue)
    const unsubscribeCards = cardsFade.on('change', setCardsOpacity)
    return () => {
      unsubscribeMorph()
      unsubscribeRotate()
      unsubscribeParallax()
      unsubscribeCards()
    }
  }, [smoothMorph, smoothScrollRotate, smoothMouseX, cardsFade])

  // The suite content fades in only after the cards are gone, then stays.
  const contentOpacity = useTransform(scrollYProgress, [0.62, 0.82], [0, 1])
  const contentY = useTransform(scrollYProgress, [0.62, 0.82], [30, 0])

  // Phones render fewer ring cards; desktop keeps the full set. Width is 0 until
  // the ResizeObserver measures, so unmeasured falls back to the desktop count.
  const isMobile = containerSize.width > 0 && containerSize.width < 768
  const visibleCount = isMobile ? MOBILE_IMAGES : TOTAL_IMAGES

  return (
    <div ref={wrapperRef} className="relative h-[230vh] w-full">
      <div
        ref={containerRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-white"
      >
        <div className="perspective-1000 flex h-full w-full -translate-y-[4%] flex-col items-center justify-center">
        {/* Intro: title + CTA buttons (in front of the ring, fades out on scroll) */}
        <div className="pointer-events-none absolute top-1/2 z-20 flex -translate-y-1/2 flex-col items-center justify-center px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={
              introPhase === 'circle' && morphValue < 0.5
                ? { opacity: 1 - morphValue * 2, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, filter: 'blur(10px)' }
            }
            transition={{ duration: 1 }}
            className="max-w-[190px] text-xl font-semibold tracking-tight text-gray-800 sm:max-w-none sm:text-2xl md:text-4xl"
          >
            {hero.intro_headline}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={
              introPhase === 'circle' && morphValue < 0.5
                ? { opacity: 1 - morphValue * 2, y: 0 }
                : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.9, delay: 0.15 }}
            style={{ pointerEvents: introPhase === 'circle' && morphValue < 0.4 ? 'auto' : 'none' }}
            className="mt-5 flex flex-col items-center justify-center gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3"
          >
            {/* Stacked + compact on phones so the pair stays inside the ring's
                ~200px inner hole; side-by-side from sm: up */}
            <Link
              href={hero.primary_cta_href}
              className="inline-flex items-center rounded-full bg-[#1A1A1A] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-black sm:px-7 sm:py-3 sm:text-sm"
            >
              {hero.primary_cta_label}
            </Link>
            <Link
              href={hero.secondary_cta_href}
              className="inline-flex items-center rounded-full border border-[#1A1A1A]/20 bg-white px-5 py-2 text-xs font-bold text-[#1A1A1A] transition-colors hover:border-[#1A1A1A] sm:px-7 sm:py-3 sm:text-sm"
            >
              {hero.secondary_cta_label}
            </Link>
          </motion.div>
        </div>

        {/* Suite content — fades into full view as the arc cards disappear */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute inset-x-0 top-[55%] z-10 -translate-y-1/2 px-4 sm:px-6"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center sm:mb-10">
              <h2 className="mb-4 font-serif text-2xl font-medium text-gray-900 md:text-3xl lg:text-4xl">
                {hero.suite_heading}
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-700 md:text-base">
                {hero.suite_body}
              </p>
            </div>
            {/* Single horizontal row: 3 circles in view on phones (4 on sm, 6 on
                lg), the rest reached by horizontal scroll. gap-4 (1rem) is kept
                constant so the basis calc lands an exact N-in-view. */}
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {hero.suite_categories.map((cat) => (
                <Link
                  key={cat.id}
                  href="/invitations/catalog"
                  className="group flex shrink-0 snap-start basis-[calc((100%-2rem)/3)] flex-col items-center text-center sm:basis-[calc((100%-3rem)/4)] lg:basis-[calc((100%-5rem)/6)]"
                >
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-full bg-white ring-1 ring-gray-200 transition-shadow group-hover:shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetPath(cat.image)}
                      alt={cat.alt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium leading-tight text-gray-800 group-hover:underline md:text-sm">
                    {cat.label}
                    <ArrowRight
                      size={14}
                      className="shrink-0 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-12 border-t border-gray-200 sm:mt-16" />
          </div>
        </motion.div>

        {/* Main Container */}
        <div className="relative flex h-full w-full items-center justify-center">
          {IMAGES.slice(0, visibleCount).map((src, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }

            if (introPhase === 'scatter') {
              target = scatterPositions[i]
            } else if (introPhase === 'line') {
              const lineSpacing = 70
              const lineTotalWidth = visibleCount * lineSpacing
              const lineX = i * lineSpacing - lineTotalWidth / 2
              target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 }
            } else {
              const minDimension = Math.min(containerSize.width, containerSize.height)

              const circleRadius = Math.min(minDimension * 0.38, 380)
              const circleAngle = (i / visibleCount) * 360
              const circleRad = (circleAngle * Math.PI) / 180
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: circleAngle + 90,
              }

              const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5)
              const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1)

              const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25)
              const arcCenterY = arcApexY + arcRadius

              const spreadAngle = isMobile ? 100 : 130
              const startAngle = -90 - spreadAngle / 2
              const step = spreadAngle / (visibleCount - 1)

              const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1)
              const maxRotation = spreadAngle * 0.8
              const boundedRotation = -scrollProgress * maxRotation

              const currentArcAngle = startAngle + i * step + boundedRotation
              const arcRad = (currentArcAngle * Math.PI) / 180

              const arcPos = {
                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: isMobile ? 1.4 : 1.8,
              }

              target = {
                x: lerp(circlePos.x, arcPos.x, morphValue),
                y: lerp(circlePos.y, arcPos.y, morphValue),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                scale: lerp(1, arcPos.scale, morphValue),
                opacity: cardsOpacity,
              }
            }

            return <HeroCard key={i} src={src} index={i} target={target} />
          })}
        </div>
        </div>
      </div>
    </div>
  )
}
