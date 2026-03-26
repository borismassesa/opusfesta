'use client'

import React, { useRef } from 'react'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

import { cn } from '@/lib/utils'

const Card3DEffect = ({
  rotateDepth = 17.5,
  translateDepth = 20,
  className,
  children
}: {
  rotateDepth?: number
  translateDepth?: number
  className?: string
  children: React.ReactNode
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`-${rotateDepth}deg`, `${rotateDepth}deg`])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`${rotateDepth}deg`, `-${rotateDepth}deg`])

  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], [`-${translateDepth}px`, `${translateDepth}px`])
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], [`${translateDepth}px`, `-${translateDepth}px`])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width - 0.5
    const yPct = (e.clientY - rect.top) / rect.height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div className={cn('group/card perspective-distant transform-3d', className)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, translateX, translateY }}
        initial={{ scale: 1, z: 0 }}
        whileHover={{ scale: 1.005, z: 50, transition: { duration: 0.2 } }}
        className='relative rounded-2xl group-hover/card:shadow-xl'
      >
        {children}
      </motion.div>
    </div>
  )
}

export default Card3DEffect
