'use client'

import { useEffect, useState } from 'react'

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(currentTab => {
        const currentIndex = tabs.findIndex(tab => tab.value === currentTab)
        const nextIndex = (currentIndex + 1) % tabs.length

        return tabs[nextIndex].value
      })
    }, 7000)

    return () => clearInterval(interval)
  }, [activeTab])

  return (
    <section className='relative flex flex-col overflow-hidden'>
      <div className='border-b px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto flex max-w-7xl flex-col gap-6 border-x px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
          <div className='flex flex-col items-center gap-4 text-center'>
            <Badge variant='outline' className='bg-muted relative gap-2.5 px-1.5 py-1 border-0 shadow-none'>
              <span className='bg-primary text-primary-foreground flex h-5.5 items-center rounded-full px-2 py-0.5'>
                🔥 New
              </span>
              <span className='text-muted-foreground text-sm font-normal text-wrap'>Planning tools</span>
              <BorderBeam colorFrom='var(--primary)' colorTo='var(--primary)' size={35} />
            </Badge>

            <h1 className='text-2xl font-semibold sm:text-3xl lg:text-5xl lg:leading-[1.29167]'>
              Plan your wedding with clarity.
              <br />
              All your tools in one place.
            </h1>

            <p className='text-muted-foreground max-w-3xl text-xl'>
              Track tasks and dates, build a budget, and get personalized recommendations based on your venue, style,
              and priorities.
            </p>

            <div className='flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8'>
              <PrimaryOrionButton size='lg' className='rounded-lg max-[425px]:has-[>svg]:px-4' asChild>
                <a href='#'>
                  <ArrowUpRightIcon />
                  Take the Style Quiz
                </a>
              </PrimaryOrionButton>
              <SecondaryOrionButton
                size='lg'
                className='rounded-lg bg-[#FFD41D] text-black hover:bg-[#e6bf19] max-[425px]:has-[>svg]:px-4'
                asChild
              >
                <a href='#'>
                  <DollarSignIcon />
                  Explore Budget Advisor
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
        <div className='border-b px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-7xl border-x'>
            {/* Tabs List */}
            <ScrollArea className='-mx-px'>
              <TabsList className='h-auto w-full rounded-none bg-transparent p-0 text-muted-foreground divide-x divide-border/60'>
                {tabs.map(({ icon: Icon, name, value }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className='focus-visible:outline-primary/20 data-[state=active]:!bg-background h-15 flex-1 cursor-pointer rounded-none px-4 py-2.5 text-base text-muted-foreground transition-colors focus-visible:ring-0 focus-visible:outline-[3px] focus-visible:-outline-offset-4 data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-[inset_0_0_0_2px_color-mix(in_oklab,var(--foreground)20%,transparent)] data-[state=active]:z-1'
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

        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='relative mx-auto h-151 max-w-7xl border-x'>
            {/* Background Dots */}
            <div className='pointer-events-none absolute inset-0 -z-2 draft-dots' />

            {/* Background Gradient Overlay */}
            <div className='bg-background/75 pointer-events-none absolute inset-0 -z-1 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_35%,black)] [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_35%,black)]' />

            <ScrollArea className='h-full [&>[data-slot="scroll-area-viewport"]]:h-full [&>[data-slot="scroll-area-viewport"]>div]:h-full'>
              {tabs.map(tab => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className='flex h-full items-center justify-center p-4 sm:p-6 lg:p-8'
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
  )
}

export default HeroSection
