'use client'

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'

import { cn } from '@/lib/utils'

interface TextRevealProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
}

const TextReveal = ({ children, className }: TextRevealProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: targetRef
  })

  const elements = Array.isArray(children) ? children : [children]

  const processedElements: ReactNode[] = []

  elements.forEach(element => {
    if (typeof element === 'string') {
      element.split(' ').forEach(word => {
        if (word) processedElements.push(word)
      })
    } else {
      processedElements.push(element)
    }
  })

  const words = processedElements

  return (
    <section id='quote' ref={targetRef} className={cn('relative z-0 h-[200vh]', className)}>
      <div className={'sticky top-0 mx-auto flex h-1/2 max-w-7xl items-center bg-transparent py-8 sm:py-16 lg:py-24'}>
        <div
          className={
            'text-foreground flex flex-wrap justify-center px-4 text-3xl font-medium sm:px-6 sm:text-4xl lg:px-8 lg:text-5xl lg:leading-[1.29167] xl:text-6xl xl:leading-[1.21667]'
          }
        >
          {words.map((word, i) => {
            const start = i / words.length
            const end = start + 1 / words.length

            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            )
          })}
        </div>
      </div>
    </section>
  )
}

interface WordProps {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}

const Word = ({ children, progress, range }: WordProps) => {
  const opacity = useTransform(progress, range, [0, 1])

  return (
    <span className='relative mx-1 flex items-center lg:mx-1.5'>
      <span className='absolute opacity-30'>{children}</span>
      <motion.span className='text-foreground' style={{ opacity: opacity }}>
        {children}
      </motion.span>
    </span>
  )
}

export { TextReveal, type TextRevealProps }
