'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const WORDS = [
  'Wedding',
  'Send-Off',
  'Kitchen Party',
  'Baby Shower',
  'Anniversary',
  'Engagement',
  'Birthday',
]

// Longest word — reserves the slot width so the rest of the line never moves.
const LONGEST = WORDS.reduce((a, b) => (b.length >= a.length ? b : a), '')

export function RotatingWord() {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="relative inline-block whitespace-nowrap text-left align-bottom text-[#8e57b3]">
      {/* Ghost reserves the width of the longest word so "Your" never shifts. */}
      <span className="invisible" aria-hidden>
        {LONGEST},
      </span>
      <span className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={WORDS[index]}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
          >
            {WORDS[index]},
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
