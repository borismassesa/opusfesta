'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ease, duration as dur, drift, stagger } from '@/lib/motion'

interface StaggerRevealProps {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  threshold?: number
  margin?: string
  delayChildren?: number
}

export default function StaggerReveal({
  children,
  className,
  itemClassName,
  threshold = 0.15,
  margin = '-60px',
  delayChildren = 0,
}: StaggerRevealProps) {
  const reduceMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  const staggerDelay = isMobile ? stagger.mobile : stagger.desktop

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: staggerDelay, delayChildren },
    },
  }

  const item = {
    hidden: { opacity: 0, y: drift.sm },
    visible: { opacity: 1, y: 0, transition: { duration: dur.sm, ease } },
  }

  if (reduceMotion) {
    return (
      <div className={className}>
        {Array.isArray(children) && children.map((child, i) => (
          <div key={i} className={itemClassName}>{child}</div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold, margin }}
    >
      {Array.isArray(children) &&
        children.map((child, i) => (
          <motion.div key={i} variants={item} className={itemClassName}>
            {child}
          </motion.div>
        ))}
    </motion.div>
  )
}
