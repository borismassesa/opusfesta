'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { motion } from 'motion/react'
import { ease, duration as dur, drift } from '@/lib/motion'

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Gate load animation behind client mount + fonts ready (300ms fallback)
  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 300)
    document.fonts.ready
      .then(() => { clearTimeout(timeout); setMounted(true) })
      .catch(() => { /* font load failure — timeout fallback handles mount */ })
    return () => clearTimeout(timeout)
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => { /* play blocked by browser policy */ })
    }
  }

  // Load animation props — always motion.div, CSS handles prefers-reduced-motion
  const anim = (delay: number, dy = drift.md) => ({
    initial: { opacity: 0, y: dy },
    animate: mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: dy },
    transition: { duration: dur.lg, delay, ease },
  })

  return (
    <section className="px-4 sm:px-6 pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 text-center max-w-6xl mx-auto">

      <h1 className="text-[1.85rem] min-[400px]:text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[72px] font-black uppercase tracking-tighter leading-[1.05] md:leading-[0.92] lg:leading-[0.9] max-w-5xl mx-auto text-[#1A1A1A]">
        <motion.span className="block" {...anim(0.08, drift.lg)}>
          Everything You Need<br className="sm:hidden" /> To Plan Your Wedding
        </motion.span>
        <motion.span className="block" {...anim(0.16, drift.lg)}>
          All In One Place.
        </motion.span>
      </h1>

      <motion.p
        className="mt-8 sm:mt-10 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-xl sm:max-w-2xl mx-auto font-medium leading-relaxed px-1 sm:px-0"
        {...anim(0.26, drift.sm)}
      >
        Make your wedding planning effortless. Discover venues, connect with vendors, and manage your registry. All from one easy-to-use platform.
      </motion.p>

      <motion.div
        className="flex flex-row items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10"
        {...anim(0.36, drift.sm)}
      >
        <button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-7 py-3.5 rounded-full font-bold text-[15px] transition-colors whitespace-nowrap">
          Start planning
        </button>
        <button className="text-[#1A1A1A] font-bold text-[15px] underline underline-offset-4 hover:text-gray-600 transition-colors whitespace-nowrap">
          Find vendors
        </button>
      </motion.div>

      <motion.div
        className="mt-10 sm:mt-14 md:mt-16 rounded-[20px] sm:rounded-[28px] md:rounded-[40px] overflow-hidden w-full mx-auto relative aspect-[4/5] sm:aspect-[4/3] md:aspect-video bg-gray-100 shadow-2xl"
        {...anim(0.48, drift.md)}
      >
        <video
          ref={videoRef}
          src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
          autoPlay
          loop
          muted
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors z-10"
        >
          {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </button>
      </motion.div>

    </section>
  )
}
