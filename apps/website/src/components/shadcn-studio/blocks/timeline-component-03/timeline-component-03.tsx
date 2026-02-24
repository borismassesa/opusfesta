'use client'

import { useEffect, useRef, useState } from 'react'
import { BoxIcon, CodeIcon, LightbulbIcon, RocketIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface TimelineStep {
  icon: keyof typeof iconMap
  title: string
  description: string
  progress: number
  progressLabel: string
  duration: string
}

interface ProcessProps {
  steps: TimelineStep[]
  eyebrow?: string
  heading?: string
  description?: string
  showHeader?: boolean
}

const iconMap = {
  LightbulbIcon,
  CodeIcon,
  BoxIcon,
  RocketIcon
}

const CircularProgress = ({
  progress,
  isActive,
  isHovered
}: {
  progress: number
  isActive: boolean
  isHovered: boolean
}) => {
  const radius = 28
  const stroke = 3
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className='relative flex h-16 w-16 items-center justify-center'>
      {/* Background Track */}
      <svg height={radius * 2} width={radius * 2} className='absolute inset-0 -rotate-90 transform'>
        <circle
          stroke='currentColor'
          fill='transparent'
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className='text-primary/10'
        />
        {/* Animated Progress */}
        <motion.circle
          stroke='currentColor'
          fill='transparent'
          strokeWidth={stroke}
          strokeLinecap='round'
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className='text-primary'
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: isActive || isHovered ? strokeDashoffset : circumference
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
    </div>
  )
}

const FeatureCard = ({
  step,
  index,
  isActive,
  isHovered,
  onMouseEnter,
  onMouseLeave
}: {
  step: TimelineStep
  index: number
  isActive: boolean
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) => {
  const Icon = iconMap[step.icon]
  const isHighlighted = isActive || isHovered

  return (
    <motion.div
      className='group relative flex h-full flex-col'
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={false}
      animate={{
        y: isHighlighted ? -8 : 0,
        scale: isHighlighted ? 1.02 : 1
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Ambient Glow */}
      <AnimatePresence>
        {isHighlighted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className='absolute -inset-0.5 -z-10 rounded-3xl bg-linear-to-b from-primary/30 to-transparent blur-xl'
          />
        )}
      </AnimatePresence>

      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-3xl border transition-colors duration-500 ${isHighlighted ? 'border-primary/50 bg-card' : 'border-border/50 bg-card/50'
          }`}
      >
        {/* Interactive Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 ${isHighlighted ? 'opacity-100' : ''
            }`}
        />

        <div className='relative flex flex-1 flex-col p-6 sm:p-8'>
          {/* Header area: Icon + Progress */}
          <div className='mb-8 flex items-start justify-between'>
            <div className='relative'>
              <CircularProgress progress={100} isActive={isActive} isHovered={isHovered} />
              <div className='absolute inset-0 flex items-center justify-center'>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 ${isHighlighted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                >
                  <Icon className='size-5' />
                </div>
              </div>
            </div>
            <div className='text-right'>
              <p className={`text-sm font-medium transition-colors ${isHighlighted ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.duration}
              </p>
              <AnimatePresence>
                {isHighlighted && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className='text-xs font-semibold text-primary/80 mt-1'
                  >
                    Active Phase
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Content */}
          <div className='mt-auto'>
            <h3
              className={`mb-3 text-xl font-semibold transition-colors duration-300 ${isHighlighted ? 'text-foreground' : 'text-muted-foreground'
                }`}
            >
              {step.title}
            </h3>
            <p className='text-muted-foreground leading-relaxed'>
              {step.description}
            </p>
          </div>
        </div>

        {/* Bottom Progress Bar Indicator (Subtle accent) */}
        <div className='absolute bottom-0 left-0 h-1 w-full bg-muted/50'>
          <motion.div
            className='h-full bg-primary'
            initial={{ width: '0%' }}
            animate={{ width: isHighlighted ? '100%' : '0%' }}
            transition={{ duration: 2, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

const Process = ({
  steps,
  eyebrow = 'process',
  heading = 'Our Product Development Lifecycle',
  description = 'We follow a streamlined lifecycle that ensures reliability and excellence at every stage from requirements to launch. Our lifecycle is built around clarity, collaboration, and continuous improvement.',
  showHeader = true
}: ProcessProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length)
    }, 4000)
  }

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }

  useEffect(() => {
    if (hoveredIndex === null) {
      startAutoPlay()
    } else {
      stopAutoPlay()
    }
    return () => stopAutoPlay()
  }, [hoveredIndex, steps.length])

  return (
    <section className='py-12 sm:py-16 lg:py-24 relative overflow-hidden'>
      {/* Background Decor */}
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/5 via-background to-background' />

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10'>
        {showHeader && (
          <div className='mb-16 space-y-4 text-center'>
            <p className='text-primary text-sm font-semibold tracking-wider uppercase'>{eyebrow}</p>
            <h2 className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>{heading}</h2>
            <p className='text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl'>{description}</p>
          </div>
        )}

        <div className='grid gap-6 md:grid-cols-3 lg:gap-8'>
          {steps.map((step, index) => (
            <FeatureCard
              key={index}
              step={step}
              index={index}
              isActive={activeIndex === index && hoveredIndex === null}
              isHovered={hoveredIndex === index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Process
