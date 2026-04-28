'use client'

import { LayoutGroup, motion } from 'motion/react'
import { TextRotate } from '@/components/ui/text-rotate'

// Rotating words tuned for an editorial wedding-planning audience.
// Short so the layout doesn't jump between very long and very short words.
const rotatingWords = [
  'unforgettable',
  'cinematic',
  'effortless',
  'intentional',
  'coastal',
  'timeless',
  'romantic ♥',
  'personal',
  'warm',
]

export default function AdviceHero() {
  return (
    <section className="relative flex w-full flex-col items-center justify-center overflow-hidden border-b border-neutral-200 bg-neutral-50 py-14 md:py-20">

      {/* Centerpiece — typography matches the homepage hero */}
      <div className="pointer-events-auto z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4">
        <motion.h1
          className="flex w-full flex-col items-center justify-center whitespace-pre text-center text-2xl font-black uppercase leading-[1.25] tracking-tighter text-[#1A1A1A] sm:text-4xl md:text-5xl md:leading-[1.15] lg:text-6xl lg:leading-[1.1]"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
        >
          <span>Plan a wedding</span>
          <LayoutGroup>
            <motion.span layout className="flex whitespace-pre">
              <motion.span
                layout
                className="flex whitespace-pre"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              >
                that feels{' '}
              </motion.span>
              <TextRotate
                texts={rotatingWords}
                mainClassName="overflow-hidden pr-2 text-[var(--accent-hover)] py-0 pb-1 md:pb-2"
                staggerDuration={0.03}
                staggerFrom="last"
                rotationInterval={4000}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            </motion.span>
          </LayoutGroup>
        </motion.h1>

        <motion.p
          className="mx-auto mt-8 max-w-xl px-1 text-center text-base font-medium leading-relaxed text-gray-600 sm:mt-10 sm:max-w-2xl sm:px-0 sm:text-lg md:text-xl lg:text-2xl"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.5 }}
        >
          Real celebrations, honest planning advice, and the ideas worth
          borrowing. Gathered for couples building a wedding that feels
          unmistakably their own.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:mt-10 sm:gap-x-6"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.7 }}
        >
          <a
            href="#editor-picks"
            className="whitespace-nowrap rounded-full bg-(--accent) px-6 py-3.5 text-[15px] font-bold text-(--on-accent) transition-colors hover:bg-(--accent-hover) sm:px-7"
          >
            Start reading
          </a>
          <a
            href="#latest-stories"
            className="whitespace-nowrap text-[15px] font-bold text-[#1A1A1A] underline underline-offset-4 transition-colors hover:text-gray-600"
          >
            Latest stories
          </a>
        </motion.div>
      </div>
    </section>
  )
}
