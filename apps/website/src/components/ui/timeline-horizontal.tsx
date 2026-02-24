import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'
import { CheckIcon, CircleIcon, XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TimelineContextValue {
  activeIndex: number
  setActiveIndex: (index: number) => void
  itemDurations: number[]
  autoPlay: boolean
  animated: boolean
}

const TimelineContext = React.createContext<TimelineContextValue | undefined>(undefined)

const timelineHorizontalVariants = cva('flex max-xl:items-center max-sm:flex-col xl:flex-row', {
  variants: {
    positions: {
      top: 'xl:items-start',
      center: 'xl:items-center',
      bottom: 'xl:items-end'
    }
  },
  defaultVariants: {
    positions: 'top'
  }
})

interface TimelineHorizontalProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof timelineHorizontalVariants> {
  defaultActiveIndex?: number
  itemDurations?: number[]
  autoPlay?: boolean
  animated?: boolean
  onActiveIndexChange?: (index: number) => void
}

const TimelineHorizontal = React.forwardRef<HTMLUListElement, TimelineHorizontalProps>(
  (
    {
      children,
      className,
      positions,
      defaultActiveIndex = 0,
      itemDurations = [],
      autoPlay = false,
      animated = false,
      onActiveIndexChange,
      ...props
    },
    ref
  ) => {
    const [activeIndex, setActiveIndex] = React.useState(defaultActiveIndex)
    const childrenArray = React.Children.toArray(children)
    const totalItems = childrenArray.length

    React.useEffect(() => {
      if (!autoPlay || totalItems === 0) return

      const currentDuration = itemDurations[activeIndex] || 500
      const timer = setTimeout(() => {
        const nextIndex = (activeIndex + 1) % totalItems
        setActiveIndex(nextIndex)
        onActiveIndexChange?.(nextIndex)
      }, currentDuration)

      return () => clearTimeout(timer)
    }, [activeIndex, autoPlay, totalItems, itemDurations, onActiveIndexChange])

    const handleSetActiveIndex = React.useCallback(
      (index: number) => {
        setActiveIndex(index)
        onActiveIndexChange?.(index)
      },
      [onActiveIndexChange]
    )

    return (
      <TimelineContext.Provider
        value={{ activeIndex, setActiveIndex: handleSetActiveIndex, itemDurations, autoPlay, animated }}
      >
        <ul className={cn(timelineHorizontalVariants({ positions }), className)} ref={ref} {...props}>
          {childrenArray.map((child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                key: index,
                'data-index': index
              })
            }
            return child
          })}
        </ul>
      </TimelineContext.Provider>
    )
  }
)

TimelineHorizontal.displayName = 'TimelineHorizontal'

const timelineItemHorizontalVariants = cva('flex flex-row items-center', {
  variants: {
    status: {
      done: 'text-primary',
      default: 'text-muted-foreground'
    },
    contentPosition: {
      top: 'xl:flex-col-reverse',
      bottom: 'xl:flex-col'
    },
    headingPosition: {
      top: 'flex-col xl:flex-col',
      bottom: 'flex-row items-start'
    }
  },
  defaultVariants: {
    status: 'default',
    contentPosition: 'bottom',
    headingPosition: 'bottom'
  }
})

interface TimelineItemHorizontalProps
  extends React.HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof timelineItemHorizontalVariants> {}

const TimelineItemHorizontal = React.forwardRef<HTMLLIElement, TimelineItemHorizontalProps>(
  ({ className, status, contentPosition, headingPosition, ...props }, ref) => (
    <li
      className={cn(timelineItemHorizontalVariants({ status, contentPosition, headingPosition }), className)}
      ref={ref}
      {...props}
    />
  )
)

TimelineItemHorizontal.displayName = 'TimelineItemHorizontal'

const timelineDotHorizontalVariants = cva('flex items-center justify-center rounded-full border border-current', {
  variants: {
    status: {
      default: 'size-4 [&>*]:hidden',
      current:
        'size-4 [&>*:not(.lucide-circle)]:hidden [&>.lucide-circle]:fill-current [&>.lucide-circle]:text-current',
      done: 'bg-primary [&>.lucide-check]:text-background size-4 [&>*:not(.lucide-check)]:hidden',
      error: 'border-destructive bg-destructive [&>.lucide-x]:text-background size-4 [&>*:not(.lucide-x)]:hidden',
      custom: 'border-none [&>*:not(:nth-child(4))]:hidden [&>*:nth-child(4)]:block'
    }
  },
  defaultVariants: {
    status: 'default'
  }
})

type TimelineDotHorizontalProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof timelineDotHorizontalVariants> &
  (
    | {
        status?: 'custom'
        children: React.ReactNode
      }
    | {
        status?: Exclude<VariantProps<typeof timelineDotHorizontalVariants>['status'], 'custom'>
        children?: never
      }
  )

const TimelineDotHorizontal = React.forwardRef<HTMLDivElement, TimelineDotHorizontalProps>(
  ({ className, status, children, ...props }, ref) => {
    const context = React.useContext(TimelineContext)
    const dotRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => dotRef.current!)

    React.useEffect(() => {
      if (!dotRef.current || !context) return

      const itemElement = dotRef.current.closest('[data-index]')
      if (!itemElement) return

      const itemIndex = parseInt(itemElement.getAttribute('data-index') || '0', 10)
      const isActive = context.activeIndex >= itemIndex

      dotRef.current.setAttribute('data-active', String(isActive))
      const icon = dotRef.current.querySelector('svg:last-child')
      if (icon) {
        icon.setAttribute('data-active', String(isActive))
      }
    }, [context?.activeIndex, context])

    return (
      <div
        role='status'
        className={cn(
          'timeline-dot-horizontal',
          timelineDotHorizontalVariants({ status }),
          context?.animated ? 'transition-colors duration-300' : null,
          className
        )}
        ref={dotRef}
        {...props}
      >
        <CircleIcon className='size-2.5' />
        <CheckIcon className='size-3' />
        <XIcon className='size-3' />
        {children}
      </div>
    )
  }
)

TimelineDotHorizontal.displayName = 'TimelineDotHorizontal'

const timelineContentHorizontalVariants = cva('text-card-foreground ml-4 xl:ml-0', {
  variants: {
    align: {
      start: 'text-left',
      center: 'text-center',
      end: 'text-right'
    },
    position: {
      top: 'xl:mb-4',
      bottom: 'xl:mt-4'
    }
  },
  defaultVariants: {
    align: 'start',
    position: 'bottom'
  }
})

interface TimelineContentHorizontalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineContentHorizontalVariants> {}

const TimelineContentHorizontal = React.forwardRef<HTMLDivElement, TimelineContentHorizontalProps>(
  ({ className, align, position, ...props }, ref) => (
    <div className={cn(timelineContentHorizontalVariants({ align, position }), className)} ref={ref} {...props} />
  )
)

TimelineContentHorizontal.displayName = 'TimelineContentHorizontal'

const timelineHeadingHorizontalVariants = cva('flex-1 text-wrap', {
  variants: {
    align: {
      start: 'text-left',
      center: 'text-center',
      end: 'text-right'
    },
    variant: {
      primary: 'text-foreground text-base font-medium',
      secondary: 'text-muted-foreground text-sm font-light'
    }
  },
  defaultVariants: {
    align: 'start',
    variant: 'primary'
  }
})

interface TimelineHeadingHorizontalProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof timelineHeadingHorizontalVariants> {}

const TimelineHeadingHorizontal = React.forwardRef<HTMLParagraphElement, TimelineHeadingHorizontalProps>(
  ({ className, align, variant, ...props }, ref) => (
    <p
      role='heading'
      aria-level={variant === 'primary' ? 2 : 3}
      className={cn(timelineHeadingHorizontalVariants({ align, variant }), className)}
      ref={ref}
      {...props}
    />
  )
)

TimelineHeadingHorizontal.displayName = 'TimelineHeadingHorizontal'

interface TimelineLineHorizontalProps extends React.HTMLAttributes<HTMLDivElement> {
  done?: boolean
}

const TimelineLineHorizontal = React.forwardRef<HTMLDivElement, TimelineLineHorizontalProps>(
  ({ className, done = false, ...props }, ref) => {
    const context = React.useContext(TimelineContext)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [progress, setProgress] = React.useState(0)

    const itemElement = containerRef.current?.closest('[data-index]')
    const itemIndex = itemElement ? parseInt(itemElement.getAttribute('data-index') || '0', 10) : 0

    const isActive = context ? context.activeIndex === itemIndex : false
    const isPast = context ? context.activeIndex > itemIndex : false

    React.useEffect(() => {
      if (!context?.animated || !context?.autoPlay) {
        if (isPast) {
          setProgress(100)
        } else if (isActive) {
          setProgress(done ? 100 : 0)
        } else {
          setProgress(0)
        }
        return
      }

      if (isPast) {
        setProgress(100)
        return
      }

      if (!isActive) {
        setProgress(0)
        return
      }

      const duration = context.itemDurations[itemIndex] || 3000
      const startTime = Date.now()
      let animationFrame = 0

      const animate = () => {
        const elapsed = Date.now() - startTime
        const newProgress = Math.min((elapsed / duration) * 100, 100)
        setProgress(newProgress)
        if (newProgress < 100) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame)
        }
      }
    }, [isActive, isPast, itemIndex, context, done])

    return (
      <div
        ref={node => {
          containerRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        role='separator'
        aria-orientation='horizontal'
        className={cn(
          'relative flex w-0.5 justify-center overflow-hidden rounded-full xl:h-0.5 xl:min-h-0 xl:w-full xl:min-w-20',
          'bg-muted',
          className
        )}
        {...props}
      >
        <div
          className='bg-primary absolute left-0 top-0 h-full w-full origin-top rounded-full xl:origin-left'
          style={
            {
              transform: `scaleY(${progress / 100})`,
              ['--scale-x' as string]: progress / 100
            } as React.CSSProperties
          }
        />
        <style jsx>{`
          @media (min-width: 1280px) {
            div > div {
              transform: scaleX(var(--scale-x)) !important;
            }
          }
        `}</style>
      </div>
    )
  }
)

TimelineLineHorizontal.displayName = 'TimelineLineHorizontal'

export {
  TimelineHorizontal,
  TimelineDotHorizontal,
  TimelineItemHorizontal,
  TimelineContentHorizontal,
  TimelineHeadingHorizontal,
  TimelineLineHorizontal
}
