'use client'

import { useEffect, useRef, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'motion/react'

import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  DollarSignIcon,
  GemIcon,
  HomeIcon,
  ListChecksIcon,
  PaletteIcon,
  WalletIcon
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedTooltip } from '@/components/ui/motion-tooltip'
import { BorderBeam } from '@/components/ui/border-beam'
import { PrimaryOrionButton, SecondaryOrionButton } from '@/components/ui/orion-button'
import { Rating } from '@/components/ui/rating'

import LeadQualifier from '@/components/shadcn-studio/blocks/hero-section-40/lead-qualifier'
import MeetingPrep from '@/components/shadcn-studio/blocks/hero-section-40/meeting-prep'
import FollowUps from '@/components/shadcn-studio/blocks/hero-section-40/follow-ups'
import DataSync from '@/components/shadcn-studio/blocks/hero-section-40/data-sync'
import Reporting from '@/components/shadcn-studio/blocks/hero-section-40/reporting'
import ContentDrafting from '@/components/shadcn-studio/blocks/hero-section-40/content-drafting'

const avatars = [
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-45.png',
    fallback: 'AH',
    name: 'Ali Hussein',
    designation: 'Developer'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-59.png',
    fallback: 'SJ',
    name: 'Sahaj Jain',
    designation: 'Software Engineer'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-34.png',
    fallback: 'CD',
    name: 'Chánh Đại',
    designation: 'Design Engineer'
  },
  {
    image: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-58.png',
    fallback: 'J',
    name: 'Julian',
    designation: 'Senior Developer'
  }
]

const tabs = [
  {
    name: 'Dashboard',
    value: 'dashboard',
    icon: HomeIcon,
    content: <MeetingPrep />
  },
  {
    name: 'Checklist',
    value: 'checklist',
    icon: ListChecksIcon,
    content: <LeadQualifier />
  },
  {
    name: 'Budget Advisor',
    value: 'budget-advisor',
    icon: WalletIcon,
    content: <Reporting />
  },
  {
    name: 'Style Quiz',
    value: 'style-quiz',
    icon: PaletteIcon,
    content: <FollowUps />
  },
  {
    name: 'Engagement Collection',
    value: 'engagement-collection',
    icon: GemIcon,
    content: <DataSync />
  },
  {
    name: 'Planning Timeline',
    value: 'planning-timeline',
    icon: CalendarDaysIcon,
    content: <ContentDrafting />
  }
]

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || 'dashboard')
  const sectionRef = useRef<HTMLElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const openToolTab = (tabValue: string) => {
    setActiveTab(tabValue)
    workspaceRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const interval = setInterval(() => {
      setActiveTab(currentTab => {
        const currentIndex = tabs.findIndex(tab => tab.value === currentTab)
        const nextIndex = (currentIndex + 1) % tabs.length

        return tabs[nextIndex].value
      })
    }, 7000)

    return () => clearInterval(interval)
  }, [activeTab, prefersReducedMotion])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    if (prefersReducedMotion) {
      section.style.setProperty('--spot-x', '50%')
      section.style.setProperty('--spot-y', '18%')
      section.style.setProperty('--spot-opacity', '0.08')
      return
    }

    let rafId: number | null = null
    const pointer = { x: 50, y: 20, active: false }

    const renderSpotlight = () => {
      rafId = null
      section.style.setProperty('--spot-x', `${pointer.x}%`)
      section.style.setProperty('--spot-y', `${pointer.y}%`)
      section.style.setProperty('--spot-opacity', pointer.active ? '0.2' : '0.1')
    }

    const queueRender = () => {
      if (rafId !== null) {
        return
      }
      rafId = requestAnimationFrame(renderSpotlight)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = section.getBoundingClientRect()
      const nextX = ((event.clientX - bounds.left) / bounds.width) * 100
      const nextY = ((event.clientY - bounds.top) / bounds.height) * 100

      pointer.x = Math.max(0, Math.min(100, nextX))
      pointer.y = Math.max(0, Math.min(100, nextY))
      pointer.active = true
      queueRender()
    }

    const handlePointerLeave = () => {
      pointer.active = false
      pointer.x = 50
      pointer.y = 18
      queueRender()
    }

    renderSpotlight()
    section.addEventListener('pointermove', handlePointerMove)
    section.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      section.removeEventListener('pointermove', handlePointerMove)
      section.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [prefersReducedMotion])

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
      <section
        ref={sectionRef}
        className='planning-motion relative isolate flex flex-col overflow-hidden [--spot-opacity:0.1] [--spot-x:50%] [--spot-y:18%]'
      >
        <div className='pointer-events-none absolute inset-0 -z-20 overflow-hidden'>
          <div className='absolute inset-0 bg-[radial-gradient(130%_85%_at_10%_0%,color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_62%),radial-gradient(90%_70%_at_90%_20%,color-mix(in_oklab,var(--primary)_7%,transparent)_0%,transparent_64%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_98%,var(--primary)_2%)_0%,var(--background)_70%)]' />
          <div
            className='absolute inset-0 bg-[radial-gradient(460px_circle_at_var(--spot-x)_var(--spot-y),color-mix(in_oklab,var(--primary)_14%,transparent)_0%,transparent_62%)] transition-opacity duration-300 motion-reduce:transition-none'
            style={{ opacity: 'var(--spot-opacity)' }}
          />
          <div
            className={`absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] blur-3xl ${prefersReducedMotion ? '' : 'animate-pulse'}`}
          />
          <div
            className={`absolute top-24 right-[5%] h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] blur-3xl ${prefersReducedMotion ? '' : 'animate-pulse'}`}
            style={{ animationDelay: '1.3s', animationDuration: '9s' }}
          />
          <div
            className={`absolute bottom-[-7rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[color-mix(in_oklab,var(--primary)_9%,transparent)] blur-3xl ${prefersReducedMotion ? '' : 'animate-pulse'}`}
            style={{ animationDelay: '2.1s', animationDuration: '10s' }}
          />
          <div className='absolute inset-0 opacity-28 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(circle_at_center,black_42%,transparent_100%)]' />
        </div>

        <div className='px-3 sm:px-6 lg:px-8'>
          <div className='mx-auto flex max-w-7xl flex-col gap-5 py-7 sm:py-14 lg:py-22'>
            <div className='flex flex-col items-center gap-3.5 text-center sm:gap-4'>
            <Badge variant='outline' className='bg-muted relative gap-2.5 px-1.5 py-1 border-0 shadow-none'>
              <span className='bg-primary text-primary-foreground flex h-5.5 items-center rounded-full px-2 py-0.5'>
                🔥 New
              </span>
              <span className='text-muted-foreground text-sm font-normal text-wrap'>OpusFesta Planning Suite</span>
              {!prefersReducedMotion && <BorderBeam colorFrom='var(--primary)' colorTo='var(--primary)' size={35} />}
            </Badge>

            <h1 className='text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl lg:leading-[1.2]'>
              Plan with clarity.
              <br />
              Every tool in one place.
            </h1>

            <p className='text-muted-foreground max-w-3xl text-base sm:text-lg lg:text-xl'>
              OpusFesta brings your checklist, budget, style direction, vendor decisions, and timeline together so you
              can move faster and stay aligned from engagement to wedding day.
            </p>

            <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-5 lg:gap-7'>
              <PrimaryOrionButton size='lg' className='rounded-lg max-[425px]:has-[>svg]:px-4' asChild>
                <a href='/signup'>
                  <ArrowUpRightIcon />
                  Start Planning Free
                </a>
              </PrimaryOrionButton>
              <SecondaryOrionButton
                size='lg'
                className='rounded-lg bg-accent text-accent-foreground hover:bg-accent/85 max-[425px]:has-[>svg]:px-4'
                asChild
              >
                <a
                  href='#planning-workspace'
                  onClick={event => {
                    event.preventDefault()
                    openToolTab('budget-advisor')
                  }}
                >
                  <DollarSignIcon />
                  Preview Budget Advisor
                </a>
              </SecondaryOrionButton>
            </div>
          </div>

          <div className='flex w-full items-center justify-center gap-4 max-sm:flex-col sm:gap-7'>
            <div className='flex flex-1 items-center justify-end gap-3'>
              <div className='flex flex-row items-center justify-center'>
                <AnimatedTooltip
                  items={avatars}
                  className='[&>[data-slot="avatar"]]:border-background -me-3.5 last:-me-0 [&>[data-slot="avatar"]]:border-2 [&>[data-slot="avatar"]]:shadow-md [&>[data-slot="avatar"]]:ring-0'
                />
              </div>
              <div>
                <span className='text-lg font-medium'>12K+</span> <span className='text-muted-foreground'>Couples</span>
              </div>
            </div>

            <Separator orientation='vertical' className='data-[orientation=vertical]:h-4 max-sm:hidden' />

            <div className='flex flex-1 items-center gap-3'>
              <Rating readOnly value={4.5} precision={0.5} className='[&_svg]:text-primary' />
              <div>
                <span className='text-lg font-medium'>4.5</span> <span className='text-muted-foreground'>Ratings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full gap-0'>
        <div id='planning-workspace' ref={workspaceRef} className='px-3 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-7xl'>
            {/* Tabs List */}
            <ScrollArea className='-mx-px'>
              <TabsList className='h-auto w-full rounded-none bg-transparent p-0 text-muted-foreground divide-x divide-border/60'>
                {tabs.map(({ icon: Icon, name, value }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className='focus-visible:outline-primary/20 data-[state=active]:!bg-background h-14.5 flex-1 cursor-pointer rounded-none px-3 py-2.5 text-sm sm:text-[0.95rem] lg:h-15 lg:px-4 lg:text-base text-muted-foreground transition-colors motion-reduce:transition-none focus-visible:ring-0 focus-visible:outline-[3px] focus-visible:-outline-offset-4 data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-[inset_0_0_0_2px_color-mix(in_oklab,var(--foreground)20%,transparent)] data-[state=active]:z-1'
                  >
                    <Icon />
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation='horizontal' className='z-2' />
            </ScrollArea>
          </div>
        </div>

        <div className='px-3 sm:px-6 lg:px-8'>
          <div className='relative mx-auto h-[530px] max-w-7xl sm:h-[560px] md:h-[580px] lg:h-151'>
            {/* Background Dots */}
            <div className='pointer-events-none absolute inset-0 -z-2 draft-dots' />

            {/* Background Gradient Overlay */}
            <div className='bg-background/68 pointer-events-none absolute inset-0 -z-1 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_35%,black)] [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_35%,black)]' />

            <ScrollArea className='h-full [&>[data-slot="scroll-area-viewport"]]:h-full [&>[data-slot="scroll-area-viewport"]>div]:h-full'>
              {tabs.map(tab => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className='flex h-full items-start justify-start overflow-x-auto p-4 sm:p-6 lg:items-center lg:justify-center lg:p-8'
                >
                  {tab.content}
                </TabsContent>
              ))}

              <ScrollBar orientation='horizontal' />
            </ScrollArea>
          </div>
        </div>
      </Tabs>
    </section>
    </MotionConfig>
  )
}

export default HeroSection
