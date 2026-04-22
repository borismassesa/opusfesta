'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ease, duration as dur, drift } from '@/lib/motion'
import { useLang } from '@/context/LanguageContext'

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 300)
    document.fonts.ready
      .then(() => { clearTimeout(timeout); setMounted(true) })
      .catch(() => {})
    return () => clearTimeout(timeout)
  }, [])

  const a = (delay: number, dy = drift.md) => ({
    initial: { opacity: 0, y: dy },
    animate: mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: dy },
    transition: { duration: dur.lg, delay, ease },
  })

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24 pb-14 sm:pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Logo Area */}
          <motion.div className="flex flex-col items-center justify-center text-center" {...a(0.1, drift.sm)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="OpusFesta" className="w-36 sm:w-48 md:w-56 h-auto mx-auto" />
          </motion.div>

          {/* Text Area */}
          <div className="pl-0 md:pl-8 text-center md:text-left">
            <motion.p
              className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-4 sm:mb-5"
              {...a(0.14, drift.sm)}
            >
              {t.hero.badge}
            </motion.p>

            <motion.h2
              className="text-3xl sm:text-4xl lg:text-6xl font-serif text-gray-900 leading-[1.1] mb-5 sm:mb-6"
              {...a(0.2, drift.md)}
            >
              {t.hero.heading1}<br />
              <span className="whitespace-nowrap">{t.hero.heading2} <span className="italic text-brand-purple">{t.hero.heading3}</span></span>
            </motion.h2>

            <motion.p
              className="text-gray-500 leading-relaxed mb-6 sm:mb-8 text-[14px] sm:text-[15px] max-w-lg mx-auto md:mx-0"
              {...a(0.28, drift.sm)}
            >
              {t.hero.body}
            </motion.p>

            <motion.div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start" {...a(0.34, drift.sm)}>
              <span className="px-3 sm:px-4 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {t.hero.tag1}
              </span>
              <span className="px-3 sm:px-4 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {t.hero.tag2}
              </span>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Pillars */}
      <div className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { label: t.hero.pillar1Label, text: t.hero.pillar1Text },
              { label: t.hero.pillar2Label, text: t.hero.pillar2Text },
              { label: t.hero.pillar3Label, text: t.hero.pillar3Text },
            ].map((p) => (
              <div key={p.label} className="text-center sm:text-left">
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">{p.label}</p>
                <p className="text-[15px] text-gray-900 font-medium">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
