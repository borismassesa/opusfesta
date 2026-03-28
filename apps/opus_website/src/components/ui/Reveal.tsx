'use client'

import { motion } from 'motion/react'
import { ease, duration as dur, drift } from '@/lib/motion'

type Direction = 'up' | 'left' | 'right' | 'none'

interface RevealProps {
  children: React.ReactNode
  direction?: Direction
  distance?: number
  duration?: number
  delay?: number
  className?: string
  threshold?: number
  margin?: string
}

export default function Reveal({
  children,
  direction = 'up',
  distance,
  duration = dur.md,
  delay = 0,
  className,
  threshold = 0.15,
  margin = '-60px',
}: RevealProps) {
  const x = direction === 'left' ? -(distance ?? drift.md) : direction === 'right' ? (distance ?? drift.md) : 0
  const y = direction === 'up' ? (distance ?? drift.md) : 0

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: threshold, margin }}
      transition={{ duration, delay, ease }}
    >
      {children}
    </motion.div>
  )
}
