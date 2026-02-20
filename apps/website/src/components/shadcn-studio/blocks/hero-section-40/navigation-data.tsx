import {
  CalendarDaysIcon,
  GemIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  PaletteIcon,
  WalletIcon
} from 'lucide-react'

import type { Navigation } from '@/components/shadcn-studio/blocks/hero-section-40/hero-navigation'

const defaultNavigationData: Navigation[] = [
  {
    title: 'Home',
    href: '/'
  },
  {
    title: 'Planning Tools',
    href: '/planning-tools'
  },
  {
    title: 'Use cases',
    contentClassName: '!w-141 grid-cols-2',
    splitItems: true,
    items: [
      {
        type: 'section',
        title: 'For Couples',
        items: [
          {
            title: 'Planning Dashboard',
            href: '/planning#planning-workspace',
            description: 'See milestones, decisions, and next actions in one calm workspace.',
            icon: <LayoutDashboardIcon className='size-4' />
          },
          {
            title: 'Smart Checklist',
            href: '/planning#planning-workspace',
            description: 'Stay on schedule with dynamic tasks aligned to your wedding date.',
            icon: <ListChecksIcon className='size-4' />
          },
          {
            title: 'Budget Advisor',
            href: '/planning#planning-workspace',
            description: 'Track deposits, forecast spending, and avoid budget surprises.',
            icon: <WalletIcon className='size-4' />
          }
        ]
      },
      {
        type: 'section',
        title: 'For Planning Clarity',
        items: [
          {
            title: 'Style Quiz',
            href: '/planning#planning-workspace',
            description: 'Turn your taste into practical guidance for decor and vendors.',
            icon: <PaletteIcon className='size-4' />
          },
          {
            title: 'Engagement Collection',
            href: '/planning#planning-workspace',
            description: 'Save favorites, compare options, and share decisions quickly.',
            icon: <GemIcon className='size-4' />
          },
          {
            title: 'Planning Timeline',
            href: '/planning#planning-workspace',
            description: 'Coordinate deadlines and keep your day-of execution stress-free.',
            icon: <CalendarDaysIcon className='size-4' />
          }
        ]
      }
    ]
  },
  {
    title: 'Couples Stories',
    href: '/#testimonials'
  },
  {
    title: 'Pricing',
    href: '/#pricing'
  }
]

export { defaultNavigationData }
export type { Navigation }
