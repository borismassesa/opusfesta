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
    document.fonts.ready.then(() => {
      clearTimeout(timeout)
      setMounted(true)
    })
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    videoRef.current?.play().catch((e) => console.error('Video play failed', e))
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  // Load animation props — always motion.div, CSS handles prefers-reduced-motion
  const anim = (delay: number, dy = drift.md) => ({
    initial: { opacity: 0, y: dy },
    animate: mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: dy },
    transition: { duration: dur.lg, delay, ease },
  })

  return (
    <section className="px-6 pt-20 pb-20 text-center max-w-6xl mx-auto">

      <h1 className="text-4xl md:text-5xl lg:text-[72px] font-black uppercase tracking-tighter leading-[0.9] max-w-5xl mx-auto text-[#1A1A1A]">
        <motion.span className="block" {...anim(0.08, drift.lg)}>
          Everything you need to plan your wedding
        </motion.span>
        <motion.span className="block" {...anim(0.16, drift.lg)}>
          all in one place.
        </motion.span>
      </h1>

      <motion.p
        className="mt-8 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed"
        {...anim(0.26, drift.sm)}
      >
        Make your wedding planning effortless. Discover venues, connect with vendors, and manage your
        registry — all from one easy-to-use platform.
      </motion.p>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-8 mt-10"
        {...anim(0.36, drift.sm)}
      >
        <button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-8 py-3.5 rounded-full font-bold text-[15px] transition-colors">
          Start planning
        </button>
        <button className="text-[#1A1A1A] font-bold text-[15px] underline underline-offset-4 hover:text-gray-600 transition-colors">
          Find vendors
        </button>
      </motion.div>

      <motion.div
        className="mt-16 rounded-[24px] md:rounded-[40px] overflow-hidden w-full mx-auto relative aspect-[4/3] md:aspect-video bg-gray-100 shadow-2xl"
        {...anim(0.48, drift.md)}
      >
        <video
          ref={videoRef}
          src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={(e) => { e.currentTarget.play().catch(console.error) }}
          className="w-full h-full object-cover"
        />
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors z-10"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
      </motion.div>

    </section>
  )
}
