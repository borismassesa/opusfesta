'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangleIcon,
  BarChart3Icon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CompassIcon,
  GemIcon,
  HandshakeIcon,
  HistoryIcon,
  LandmarkIcon,
  ListChecksIcon,
  LockIcon,
  MessagesSquareIcon,
  PaletteIcon,
  RocketIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  WalletIcon
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { PrimaryOrionButton, SecondaryOrionButton } from '@/components/ui/orion-button'
import BentoGrid from '@/components/shadcn-studio/blocks/bento-grid-13/bento-grid-13'
import FAQ from '@/components/shadcn-studio/blocks/faq-component-12/faq-component-12'

const outcomes = [
  { label: 'Planning completion', value: '78%' },
  { label: 'Budget confidence', value: '69%' },
  { label: 'Vendor response rate', value: '84%' },
  { label: 'Timeline on-track', value: '81%' }
]

const tools = [
  {
    title: 'Dashboard',
    icon: BarChart3Icon,
    value: 'Your live planning command center.',
    points: ['Milestone alerts', 'Open decisions', 'Daily priorities'],
    cta: 'Open Dashboard'
  },
  {
    title: 'Checklist',
    icon: ListChecksIcon,
    value: 'Clear next actions, always.',
    points: ['Auto-prioritized tasks', 'Deadline sequencing', 'Dependency tracking'],
    cta: 'Open Checklist'
  },
  {
    title: 'Budget Advisor',
    icon: WalletIcon,
    value: 'Spend with confidence, not guesswork.',
    points: ['Live category totals', 'Deposit tracking', 'Budget runway view'],
    cta: 'Open Budget Advisor'
  },
  {
    title: 'Style Quiz',
    icon: PaletteIcon,
    value: 'Turn taste into practical direction.',
    points: ['Palette clarity', 'Style fit score', 'Vendor-fit signal'],
    cta: 'Open Style Quiz'
  },
  {
    title: 'Engagement Collection',
    icon: GemIcon,
    value: 'Organize inspiration into decisions.',
    points: ['Save and tag inspiration', 'Shortlist favorites', 'Share with partner'],
    cta: 'Open Collection'
  },
  {
    title: 'Planning Timeline',
    icon: CalendarDaysIcon,
    value: 'Keep every date realistic and aligned.',
    points: ['Lead-time validation', 'Critical path view', 'Shift-safe scheduling'],
    cta: 'Open Timeline'
  }
]

type BillingCycle = 'monthly' | 'annual'

type PlanningPricePlan = {
  index: string
  tier: string
  subtitle: string
  label: string
  monthlyPrice: number
  annualTotal?: number
  cta: string
  ctaIcon: string
  featureLead: string
  features: string[]
  featured?: boolean
}

const annualDiscountRate = 0.17

const planningPricePlans: PlanningPricePlan[] = [
  {
    index: '01',
    tier: 'Free',
    subtitle: 'For couples getting started',
    label: 'Basic',
    monthlyPrice: 0,
    cta: 'Get Started',
    ctaIcon: '↗',
    featureLead: 'Includes:',
    features: [
      'Checklist with daily planning limits',
      'Up to 50 guest records',
      'One shared planning workspace',
      'Core deadline reminders'
    ]
  },
  {
    index: '02',
    tier: 'Pro',
    subtitle: 'Higher limits and premium coordination',
    label: 'Pro',
    monthlyPrice: 20,
    annualTotal: 200,
    cta: 'Subscribe',
    ctaIcon: '⚡',
    featureLead: 'Everything in Free, plus:',
    features: [
      'Unlimited planning milestones',
      'Full budget advisor tracking',
      'Vendor follow-up automations',
      'Partner and planner collaboration',
      'Planning exports and summaries',
      'Private workspace links'
    ],
    featured: true
  },
  {
    index: '03',
    tier: 'Max',
    subtitle: 'Maximum control for power planners',
    label: 'Max',
    monthlyPrice: 40,
    annualTotal: 400,
    cta: 'Subscribe',
    ctaIcon: '✦',
    featureLead: 'Everything in Pro, plus:',
    features: [
      'Advanced timeline dependency mapping',
      'Smart risk and delay prediction',
      'Unlimited vendor negotiation threads',
      'Role-based access permissions',
      'Priority workflow templates',
      'All Pro features unlocked'
    ]
  },
  {
    index: '04',
    tier: 'Ultra',
    subtitle: 'Full suite for teams and agencies',
    label: 'Ultra',
    monthlyPrice: 100,
    annualTotal: 1000,
    cta: 'Subscribe',
    ctaIcon: '✧',
    featureLead: 'Everything in Max, plus:',
    features: [
      'Multi-couple workspace management',
      'Team workload and assignment views',
      'White-label planning reports',
      'Dedicated onboarding support',
      'Priority SLA response times',
      'All Max features unlocked'
    ]
  }
]

const planningFaqs = [
  {
    question: 'Can I use only one tool, like Budget Advisor?',
    answer: 'Yes. Start with any tool and expand when ready. Your data stays connected across the suite.',
    linkText: 'Learn more'
  },
  {
    question: 'Can my planner and partner collaborate in one workspace?',
    answer: 'Yes. Invite both and assign visibility by role so each person sees exactly what they need.',
    linkText: 'Learn more'
  },
  {
    question: 'How are recommendations generated?',
    answer: 'They adapt to your active tasks, budget status, open decisions, and upcoming deadlines.',
    linkText: 'Learn more'
  },
  {
    question: 'Can I export or share my plan?',
    answer: 'Yes. Share live views with collaborators and export summaries for meetings and approvals.',
    linkText: 'Learn more'
  },
  {
    question: 'Will timeline changes update related tasks automatically?',
    answer: 'Yes. Timeline changes propagate to linked tasks and milestone reminders to avoid drift.',
    linkText: 'Learn more'
  },
  {
    question: 'Is the planning workspace mobile-friendly?',
    answer: 'Yes. The page is optimized for mobile, tablet, and desktop with adaptive layouts and controls.',
    linkText: 'Learn more'
  }
]

const sectionTitle = 'text-2xl font-semibold sm:text-3xl lg:text-4xl'
const sectionWrap = 'rounded-3xl border border-border/70 bg-background/65 p-5 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.4)] sm:p-7 lg:p-9'

type FeaturedLogo = {
  image: string
  alt: string
  className?: string
}

const featuredLogoSets: FeaturedLogo[][] = [
  [
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-logo.png', alt: 'Google', className: 'h-7' },
    {
      image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/microsoft-logo.png',
      alt: 'Microsoft',
      className: 'h-7'
    },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/amazon-logo.png', alt: 'Amazon', className: 'h-6.5' }
  ],
  [
    {
      image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/airbnb-logo.png',
      alt: 'Airbnb',
      className: 'h-8'
    },
    {
      image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/hubspot-logo.png',
      alt: 'HubSpot',
      className: 'h-6.5'
    },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/fedex-logo.png', alt: 'FedEx', className: 'h-6.5' }
  ],
  [
    {
      image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/bookmyshow-logo.png',
      alt: 'BookMyShow',
      className: 'h-6.5'
    },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/walmart-logo.png', alt: 'Walmart', className: 'h-6.5' },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/ola-logo.png', alt: 'Ola', className: 'h-7' }
  ],
  [
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/amazon-logo.png', alt: 'Amazon', className: 'h-6.5' },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-logo.png', alt: 'Google', className: 'h-7' },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/hubspot-logo.png', alt: 'HubSpot', className: 'h-6.5' }
  ],
  [
    {
      image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/microsoft-logo.png',
      alt: 'Microsoft',
      className: 'h-7'
    },
    {
      image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/bookmyshow-logo.png',
      alt: 'BookMyShow',
      className: 'h-6.5'
    },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/fedex-logo.png', alt: 'FedEx', className: 'h-6.5' }
  ],
  [
    {
      image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/walmart-logo.png',
      alt: 'Walmart',
      className: 'h-6.5'
    },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/airbnb-logo.png', alt: 'Airbnb', className: 'h-8' },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/ola-logo.png', alt: 'Ola', className: 'h-7' }
  ],
  [
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/hubspot-logo.png', alt: 'HubSpot', className: 'h-6.5' },
    {
      image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/microsoft-logo.png',
      alt: 'Microsoft',
      className: 'h-7'
    },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-logo.png', alt: 'Google', className: 'h-7' }
  ],
  [
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/fedex-logo.png', alt: 'FedEx', className: 'h-6.5' },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/amazon-logo.png', alt: 'Amazon', className: 'h-6.5' },
    { image: 'https://cdn.shadcnstudio.com/ss-assets/brand-logo/airbnb-logo.png', alt: 'Airbnb', className: 'h-8' }
  ]
]

const RotatingLogoCell = ({
  logos,
  initialIndex = 0,
  intervalMs = 2600
}: {
  logos: FeaturedLogo[]
  initialIndex?: number
  intervalMs?: number
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [index, setIndex] = useState(() => initialIndex % logos.length)

  useEffect(() => {
    if (prefersReducedMotion || logos.length < 2) {
      return
    }

    const id = window.setInterval(() => {
      setIndex(current => (current + 1) % logos.length)
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [intervalMs, logos.length, prefersReducedMotion])

  const activeLogo = logos[index]

  return (
    <div className='relative h-24 sm:h-28'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={`${activeLogo.alt}-${index}`}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8, filter: 'blur(5px)' }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: 'easeInOut' }}
          className='absolute inset-0 flex items-center justify-center px-5'
        >
          <img
            src={activeLogo.image}
            alt={activeLogo.alt}
            className={`w-auto max-w-[180px] object-contain opacity-95 ${activeLogo.className || 'h-7'}`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const PlanningToolsSections = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual')

  const formatPrice = (value: number) => {
    if (value === 0) return '0'
    if (Number.isInteger(value)) return `${value}`
    return value.toFixed(2)
  }

  return (
    <div className='px-3 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24'>
      <div className='mx-auto flex max-w-7xl flex-col gap-8 sm:gap-10 lg:gap-12'>
        <section className={sectionWrap}>
          <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
            <div>
              <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Planner Pulse</p>
              <h2 className={sectionTitle}>Know where your plan stands.</h2>
              <p className='text-muted-foreground mt-2 text-sm sm:text-base'>
                Real-time signals across tasks, budget, and timeline health.
              </p>
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {outcomes.map(item => (
              <div key={item.label} className='rounded-2xl border border-border/70 bg-card p-4 sm:p-5'>
                <p className='text-muted-foreground text-xs uppercase tracking-wide'>{item.label}</p>
                <p className='mt-2 text-3xl font-semibold'>{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className='py-1'>
          <div className='px-2 pt-2 pb-6 text-center sm:pb-8'>
            <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Trusted By</p>
            <h2 className='mt-2 text-2xl font-semibold sm:text-3xl lg:text-4xl'>Featured In</h2>
            <p className='text-muted-foreground mx-auto mt-2 max-w-2xl text-sm sm:text-base'>
              OpusFesta planning tools are highlighted across respected product and technology communities.
            </p>
          </div>

          <div className='grid grid-cols-2 border-y border-border/55 sm:grid-cols-4'>
            {featuredLogoSets.map((logoSet, index) => (
              <div
                key={`logo-cell-${index}`}
                className='border-border/45 border-r border-b bg-transparent [&:nth-child(2n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0 sm:[&:nth-last-child(-n+4)]:border-b-0'
              >
                <RotatingLogoCell logos={logoSet} initialIndex={index % logoSet.length} intervalMs={2600 + (index % 4) * 280} />
              </div>
            ))}
          </div>
        </section>

        <section className={sectionWrap}>
          <div className='mb-6'>
            <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Inside the Suite</p>
            <h2 className={sectionTitle}>Each tool solves one planning problem well.</h2>
            <p className='text-muted-foreground mt-2 text-sm sm:text-base'>
              Use one module or run all six in one connected workflow.
            </p>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {tools.map(tool => (
              <article key={tool.title} className='rounded-2xl border border-border/70 bg-card p-5'>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='rounded-lg border border-border/70 bg-background p-2'>
                    <tool.icon className='size-4.5 text-primary' />
                  </div>
                  <h3 className='font-semibold'>{tool.title}</h3>
                </div>
                <p className='text-muted-foreground text-sm'>{tool.value}</p>
                <ul className='text-muted-foreground mt-3 space-y-1 text-sm'>
                  {tool.points.map(point => (
                    <li key={point} className='flex items-center gap-2'>
                      <CheckCircle2Icon className='size-3.5 text-primary/70' />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <button className='text-primary mt-4 text-sm font-medium'>{tool.cta}</button>
              </article>
            ))}
          </div>
        </section>

        <BentoGrid />

        <section className='relative py-8 sm:py-10 lg:py-12'>
          <div className='relative z-10'>
            <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start'>
              <h2 className={`${sectionTitle} max-w-2xl`}>
                Choose the right plan for your planning workflow
              </h2>
              <p className='text-muted-foreground max-w-xl text-sm sm:text-base'>
                Select from flexible tiers designed for couples, planners, and teams running complex timelines,
                budgets, and decisions in one shared workspace.
              </p>
            </div>

            <div className='mt-10 flex justify-center'>
              <div className='inline-flex items-center gap-3 rounded-full border border-border/70 bg-card px-4 py-2'>
                <button
                  type='button'
                  onClick={() => setBillingCycle('monthly')}
                  className={`text-sm font-medium transition-colors ${
                    billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type='button'
                  onClick={() => setBillingCycle(prev => (prev === 'monthly' ? 'annual' : 'monthly'))}
                  className={`relative h-8 w-16 rounded-[10px] border transition-colors ${
                    billingCycle === 'annual'
                      ? 'border-primary/60 bg-primary/90'
                      : 'border-border/80 bg-muted'
                  }`}
                  aria-label='Toggle billing cycle'
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className={`absolute top-1 grid h-6 w-6 place-content-center rounded-md border border-black/10 bg-white text-[9px] shadow-[0_8px_16px_-10px_rgba(15,23,42,0.45)] ${
                      billingCycle === 'annual' ? 'left-[34px]' : 'left-1'
                    }`}
                  >
                    <span className='text-black/45'>◻︎</span>
                  </motion.span>
                </button>
                <button
                  type='button'
                  onClick={() => setBillingCycle('annual')}
                  className={`text-sm font-medium transition-colors ${
                    billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Annual
                </button>
                <span className='rounded-full border border-primary/30 bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary'>
                  Save 17%
                </span>
              </div>
            </div>

            <div className='mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
              {planningPricePlans.map(plan => {
                const monthlyValue =
                  billingCycle === 'annual' ? plan.monthlyPrice * (1 - annualDiscountRate) : plan.monthlyPrice
                const billedText =
                  plan.monthlyPrice === 0
                    ? 'Try for free'
                    : billingCycle === 'monthly'
                      ? 'Billed monthly'
                      : `Billed annually ($${plan.annualTotal})`

                return (
                  <article
                    key={plan.tier}
                    className={`relative rounded-2xl border border-border/70 bg-card p-6 ${
                      plan.featured
                        ? 'z-10 -translate-y-0.5 border-primary/35 shadow-[0_24px_56px_-40px_rgba(15,23,42,0.4)]'
                        : 'shadow-[0_16px_36px_-34px_rgba(15,23,42,0.28)]'
                    }`}
                  >
                    <div className='mb-4 flex items-center justify-between gap-3'>
                      <span className='inline-flex size-8 items-center justify-center rounded-full border border-border/70 text-xs font-semibold text-muted-foreground'>
                        {plan.index}
                      </span>
                      {plan.featured ? (
                        <span className='inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground'>
                          <SparklesIcon className='size-3' />
                          Most popular
                        </span>
                      ) : null}
                    </div>

                    <h3 className='text-3xl leading-none font-semibold tracking-tight'>{plan.tier}</h3>
                    <p className='text-muted-foreground mt-2 text-sm'>{plan.subtitle}</p>

                    <div className='mt-8'>
                      <p className='text-4xl leading-none font-semibold tracking-tight'>
                        {plan.monthlyPrice === 0 ? plan.label : `$${formatPrice(monthlyValue)}`}
                        {plan.monthlyPrice === 0 ? null : (
                          <span className='text-muted-foreground ml-1 text-lg font-medium'>/mo</span>
                        )}
                      </p>
                      <p className='text-muted-foreground mt-2 text-sm font-medium'>{billedText}</p>
                    </div>

                    <button
                      className={`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition ${
                        plan.featured
                          ? 'bg-primary text-primary-foreground shadow-[0_16px_30px_-22px_color-mix(in_oklab,var(--primary)_65%,black)] hover:bg-primary/90'
                          : 'bg-foreground text-background shadow-[0_14px_28px_-20px_rgba(0,0,0,0.45)] hover:opacity-95'
                      }`}
                    >
                      {plan.cta}
                      <span className='text-xs'>{plan.ctaIcon}</span>
                    </button>

                    <p className='text-muted-foreground mt-6 text-sm'>{plan.featureLead}</p>
                    <ul className='mt-3 space-y-2.5'>
                      {plan.features.map(feature => (
                        <li key={feature} className='flex items-start gap-2.5 text-sm'>
                          <CheckCircle2Icon className='mt-0.5 size-4 shrink-0 text-muted-foreground/75' />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className={sectionWrap}>
          <div className='mb-6'>
            <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>How It Works</p>
            <h2 className={sectionTitle}>From ideas to execution in three steps.</h2>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <div className='rounded-2xl border border-border/70 bg-card p-5'>
              <CompassIcon className='size-5 text-primary' />
              <h3 className='mt-3 font-semibold'>Set your priorities</h3>
              <p className='text-muted-foreground mt-1 text-sm'>Capture goals, budget range, and style direction.</p>
            </div>
            <div className='rounded-2xl border border-border/70 bg-card p-5'>
              <RocketIcon className='size-5 text-primary' />
              <h3 className='mt-3 font-semibold'>Sync your decisions</h3>
              <p className='text-muted-foreground mt-1 text-sm'>Tasks, vendors, and milestones update together.</p>
            </div>
            <div className='rounded-2xl border border-border/70 bg-card p-5'>
              <CheckCircle2Icon className='size-5 text-primary' />
              <h3 className='mt-3 font-semibold'>Execute with clarity</h3>
              <p className='text-muted-foreground mt-1 text-sm'>Focus on what matters now and what is at risk.</p>
            </div>
          </div>
        </section>

        <section className='grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className={sectionWrap}>
            <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Team Planning</p>
            <h2 className={sectionTitle}>Plan together without the chaos.</h2>
            <p className='text-muted-foreground mt-2 text-sm sm:text-base'>
              Invite your partner, planner, and trusted family with clear, role-based visibility.
            </p>
          </div>
          <div className={sectionWrap}>
            <div className='space-y-3'>
              <div className='rounded-xl border border-border/70 bg-card p-4'>
                <div className='mb-1 flex items-center gap-2 font-medium'>
                  <UsersIcon className='size-4.5 text-primary' /> Couple
                </div>
                <p className='text-muted-foreground text-sm'>Shared priorities and approvals.</p>
              </div>
              <div className='rounded-xl border border-border/70 bg-card p-4'>
                <div className='mb-1 flex items-center gap-2 font-medium'>
                  <HandshakeIcon className='size-4.5 text-primary' /> Planner
                </div>
                <p className='text-muted-foreground text-sm'>Milestones and vendor coordination.</p>
              </div>
              <div className='rounded-xl border border-border/70 bg-card p-4'>
                <div className='mb-1 flex items-center gap-2 font-medium'>
                  <MessagesSquareIcon className='size-4.5 text-primary' /> Family
                </div>
                <p className='text-muted-foreground text-sm'>Selective updates on critical tasks.</p>
              </div>
            </div>
          </div>
        </section>

        <section className='grid gap-4 lg:grid-cols-2'>
          <div className={sectionWrap}>
            <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Connected Workflow</p>
            <h2 className={sectionTitle}>Your planning data stays in sync.</h2>
            <div className='mt-4 space-y-3'>
              <div className='rounded-xl border border-border/70 bg-card p-4'>
                <div className='font-medium'>Calendar Sync</div>
                <p className='text-muted-foreground text-sm'>Deadlines and reminders stay aligned.</p>
              </div>
              <div className='rounded-xl border border-border/70 bg-card p-4'>
                <div className='font-medium'>Vendor Updates</div>
                <p className='text-muted-foreground text-sm'>Replies and contract changes reflect instantly.</p>
              </div>
              <div className='rounded-xl border border-border/70 bg-card p-4'>
                <div className='font-medium'>Budget Sync</div>
                <p className='text-muted-foreground text-sm'>Quotes and payments update totals automatically.</p>
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Smart Guidance</p>
            <h2 className={sectionTitle}>Recommendations that match your real plan.</h2>
            <div className='mt-4 space-y-3'>
              <div className='rounded-xl border border-border/70 bg-card p-4'>
                <div className='mb-1 flex items-center gap-2 font-medium'>
                  <SparklesIcon className='size-4 text-primary' /> What to do next
                </div>
                <p className='text-muted-foreground text-sm'>Priority-ranked actions for this week.</p>
              </div>
              <div className='rounded-xl border border-border/70 bg-card p-4'>
                <div className='mb-1 flex items-center gap-2 font-medium'>
                  <AlertTriangleIcon className='size-4 text-primary' /> What is at risk
                </div>
                <p className='text-muted-foreground text-sm'>Deadlines likely to slip without action.</p>
              </div>
              <div className='rounded-xl border border-border/70 bg-card p-4'>
                <div className='mb-1 flex items-center gap-2 font-medium'>
                  <LandmarkIcon className='size-4 text-primary' /> Where to rebalance
                </div>
                <p className='text-muted-foreground text-sm'>Budget categories needing adjustment.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={sectionWrap}>
          <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Real Planning Flow</p>
          <h2 className={sectionTitle}>A complete journey, not isolated tools.</h2>
          <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-2xl border border-border/70 bg-card p-4'>
              <div className='text-primary text-xs font-semibold uppercase tracking-wide'>Week 1</div>
              <p className='mt-1 font-medium'>Set budget and timeline baseline.</p>
            </div>
            <div className='rounded-2xl border border-border/70 bg-card p-4'>
              <div className='text-primary text-xs font-semibold uppercase tracking-wide'>Week 4</div>
              <p className='mt-1 font-medium'>Shortlist vendors and lock key dates.</p>
            </div>
            <div className='rounded-2xl border border-border/70 bg-card p-4'>
              <div className='text-primary text-xs font-semibold uppercase tracking-wide'>Week 8</div>
              <p className='mt-1 font-medium'>Finalize style direction and guest milestones.</p>
            </div>
            <div className='rounded-2xl border border-border/70 bg-card p-4'>
              <div className='text-primary text-xs font-semibold uppercase tracking-wide'>Final Week</div>
              <p className='mt-1 font-medium'>Run day-of checklist with confidence.</p>
            </div>
          </div>
        </section>

        <section className={sectionWrap}>
          <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Built for Reliability</p>
          <h2 className={sectionTitle}>Safe, trackable, and recoverable.</h2>
          <div className='mt-5 grid gap-3 md:grid-cols-3'>
            <div className='rounded-2xl border border-border/70 bg-card p-5'>
              <ShieldCheckIcon className='size-5 text-primary' />
              <h3 className='mt-3 font-semibold'>Auto-save</h3>
              <p className='text-muted-foreground mt-1 text-sm'>Changes are saved continuously.</p>
            </div>
            <div className='rounded-2xl border border-border/70 bg-card p-5'>
              <HistoryIcon className='size-5 text-primary' />
              <h3 className='mt-3 font-semibold'>History</h3>
              <p className='text-muted-foreground mt-1 text-sm'>Track decision updates over time.</p>
            </div>
            <div className='rounded-2xl border border-border/70 bg-card p-5'>
              <LockIcon className='size-5 text-primary' />
              <h3 className='mt-3 font-semibold'>Privacy</h3>
              <p className='text-muted-foreground mt-1 text-sm'>Role-based access and secure collaboration.</p>
            </div>
          </div>
        </section>

        <FAQ faqItems={planningFaqs} />

        <section className='rounded-3xl border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_94%,var(--primary)_6%)_0%,var(--background)_100%)] p-6 sm:p-9 lg:p-11'>
          <div className='mx-auto max-w-3xl text-center'>
            <h2 className='text-2xl font-semibold sm:text-3xl lg:text-4xl'>Start planning with clarity today.</h2>
            <p className='text-muted-foreground mt-2 text-sm sm:text-base'>
              One workspace for decisions, deadlines, and confidence.
            </p>
            <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
              <PrimaryOrionButton size='lg' asChild>
                <Link href='/signup'>Start Planning Free</Link>
              </PrimaryOrionButton>
              <SecondaryOrionButton size='lg' asChild>
                <Link href='/vendors'>Book a Live Demo</Link>
              </SecondaryOrionButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PlanningToolsSections
