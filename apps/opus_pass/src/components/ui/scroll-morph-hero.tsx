'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'

// Invitation suite categories revealed once the cards hand off.
const SUITE_CATEGORIES: { label: string; alt: string; image: string }[] = [
  { label: 'Save the Date', alt: 'Save the Date', image: '/assets/images/bridering.jpg' },
  { label: 'Wedding', alt: 'Wedding ceremony', image: '/assets/images/churchcouples.jpg' },
  { label: 'Send-Off', alt: 'Send-Off', image: '/assets/images/brideincar.jpg' },
  { label: 'Kitchen Party', alt: 'Kitchen Party — bridal shower florals', image: '/assets/images/flowers_pinky.jpg' },
  { label: 'Kadi za Michango & Vikao', alt: 'Kadi za Michango & Vikao', image: '/assets/images/mauzo_crew.jpg' },
]

// --- Types ---
export type AnimationPhase = 'scatter' | 'line' | 'circle' | 'bottom-strip'

interface FlipCardProps {
  src: string
  index: number
  target: { x: number; y: number; rotation: number; scale: number; opacity: number }
}

// --- FlipCard Component ---
const IMG_WIDTH = 60
const IMG_HEIGHT = 85

function FlipCard({ src, index, target }: FlipCardProps) {
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
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className="group cursor-pointer"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl bg-gray-200 shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Invitation design ${index + 1}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-[#C9A0DC]/40 bg-[#1A1A1A] p-4 shadow-lg"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center">
            <p className="mb-1 text-[8px] font-bold uppercase tracking-widest text-[#C9A0DC]">View</p>
            <p className="text-xs font-medium text-white">Design</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20

// Invitation card templates + real wedding moments.
const IMAGES = [
  '/assets/invitation-svgs/classic-serif.svg',
  '/assets/invitation-svgs/cultural-red.svg',
  '/assets/invitation-svgs/floral-border.svg',
  '/assets/invitation-svgs/navy-gold.svg',
  '/assets/invitation-svgs/card-template.svg',
  '/assets/invitation-svgs/card-template-4.svg',
  '/assets/images/cutesy_couple.jpg',
  '/assets/images/authentic_couple.jpg',
  '/assets/images/beautiful_bride.jpg',
  '/assets/images/bride_umbrella.jpg',
  '/assets/images/brideincar.jpg',
  '/assets/images/bridering.jpg',
  '/assets/images/bridewithumbrella.jpg',
  '/assets/images/churchcouples.jpg',
  '/assets/images/couples_together.jpg',
  '/assets/images/coupleswithpiano.jpg',
  '/assets/images/flowers_pinky.jpg',
  '/assets/images/hand_rings.jpg',
  '/assets/images/mauzo_crew.jpg',
  '/assets/images/ring_piano.jpg',
]

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t

export default function ScrollMorphHero() {
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
            className="text-2xl font-semibold tracking-tight text-gray-800 md:text-4xl"
          >
            Invitations for every celebration.
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
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/invitations/catalog"
              className="inline-flex items-center rounded-full bg-[#1A1A1A] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
            >
              Browse designs
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-full border border-[#1A1A1A]/20 bg-white px-7 py-3 text-sm font-bold text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]"
            >
              Get started free
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
                Invitations for Every Moment
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-700 md:text-base">
                Pick one design once, and every card across your day matches your suite. No mixing
                fonts, no clashing palettes, no last-minute hunt for matching paper.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-5 sm:gap-6 md:flex-nowrap md:gap-8">
              {SUITE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href="/invitations/catalog"
                  className="group flex w-[110px] shrink-0 flex-col items-center text-center sm:w-[130px] md:w-[calc((100%-128px)/5)]"
                >
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-full bg-white ring-1 ring-gray-200 transition-shadow group-hover:shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.image}
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
          {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }

            if (introPhase === 'scatter') {
              target = scatterPositions[i]
            } else if (introPhase === 'line') {
              const lineSpacing = 70
              const lineTotalWidth = TOTAL_IMAGES * lineSpacing
              const lineX = i * lineSpacing - lineTotalWidth / 2
              target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 }
            } else {
              const isMobile = containerSize.width < 768
              const minDimension = Math.min(containerSize.width, containerSize.height)

              const circleRadius = Math.min(minDimension * 0.38, 380)
              const circleAngle = (i / TOTAL_IMAGES) * 360
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
              const step = spreadAngle / (TOTAL_IMAGES - 1)

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

            return <FlipCard key={i} src={src} index={i} target={target} />
          })}
        </div>
        </div>
      </div>
    </div>
  )
}
