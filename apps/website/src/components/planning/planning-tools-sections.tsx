'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2Icon,
  SparklesIcon
} from 'lucide-react'
import { motion } from 'motion/react'

import { PrimaryOrionButton, SecondaryOrionButton } from '@/components/ui/orion-button'
import BentoGrid from '@/components/shadcn-studio/blocks/bento-grid-13/bento-grid-13'
import FAQ from '@/components/shadcn-studio/blocks/faq-component-12/faq-component-12'
import Process from '@/components/shadcn-studio/blocks/timeline-component-03/timeline-component-03'
import TeamCollaboration from '@/components/planning/team-collaboration'
import ConnectedWorkflow from '@/components/planning/connected-workflow'
import SmartGuidance from '@/components/planning/smart-guidance'
import BuiltForReliability from '@/components/planning/built-for-reliability'

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
    monthlyPrice: 25000,
    annualTotal: 249000,
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
    monthlyPrice: 50000,
    annualTotal: 499000,
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
    monthlyPrice: 120000,
    annualTotal: 1199000,
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

const planningFlowSteps = [
  {
    icon: 'LightbulbIcon',
    title: 'Set your priorities',
    description: 'Capture goals, budget range, and style direction.',
    progress: 33,
    progressLabel: '33%',
    duration: 'Step 1 of 3'
  },
  {
    icon: 'CodeIcon',
    title: 'Sync your decisions',
    description: 'Tasks, vendors, and milestones update together.',
    progress: 67,
    progressLabel: '67%',
    duration: 'Step 2 of 3'
  },
  {
    icon: 'RocketIcon',
    title: 'Execute with clarity',
    description: 'Focus on what matters now and what is at risk.',
    progress: 100,
    progressLabel: '100%',
    duration: 'Step 3 of 3'
  }
]

const sectionTitle = 'text-2xl font-semibold sm:text-3xl lg:text-4xl'
const PlanningToolsSections = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual')

  const formatPrice = (value: number) => {
    if (value === 0) return '0'
    return Math.round(value).toLocaleString()
  }

  return (
    <div className='relative isolate -mt-16 pt-16 px-3 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24'>
      {/* Ambient page-level wash — picks up where the hero fades out */}
      <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
        {/* Base tint matching the hero's color-mix so there's no hard color break */}
        <div className='absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_99.5%,var(--primary)_0.5%)_0%,var(--background)_50%)]' />
        {/* Soft radial primary glow anchored top-center */}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-5%,color-mix(in_oklab,var(--primary)_2%,transparent)_0%,transparent_70%)]' />
      </div>

      <div className='mx-auto flex max-w-7xl flex-col gap-8 sm:gap-10 lg:gap-12'>
        {/* 1. How it works — give the user a mental model before showing features */}
        <Process
          steps={planningFlowSteps}
          eyebrow='How It Works'
          heading='From ideas to execution in three steps.'
          description='Capture priorities, keep decisions synchronized, and execute with confidence from one connected planning workflow.'
        />

        {/* 3. Feature showcase — now show what each tool looks like */}
        <section>
          <div className='mb-2 text-center'>
            <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Planning Suite</p>
            <h2 className={sectionTitle}>Everything you need, working together.</h2>
            <p className='text-muted-foreground mx-auto mt-2 max-w-2xl text-sm sm:text-base'>
              Budget tracking, checklists, vendor coordination, style direction, and timeline management — all connected in one workspace.
            </p>
          </div>
          <BentoGrid />
        </section>

        {/* 4. Team collaboration — show collaborative value */}
        <section className='mt-8 sm:mt-12 lg:mt-16'>
          <div className='mb-8 text-center'>
            <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Team Planning</p>
            <h2 className={sectionTitle}>Plan together without the chaos.</h2>
            <p className='text-muted-foreground mx-auto mt-2 max-w-2xl text-sm sm:text-base'>
              Invite your partner, planner, and trusted family with clear, role-based visibility. Watch how information strictly routes to the right people.
            </p>
          </div>

          <TeamCollaboration />
        </section>

        {/* 5. Deep feature details — connected workflow and smart guidance */}
        <section className='mt-8 sm:mt-12 lg:mt-16 space-y-8 sm:space-y-12 lg:space-y-16'>
          <ConnectedWorkflow />
          <SmartGuidance />
        </section>

        {/* 6. Trust signals — reassure before the pricing decision */}
        <section className='py-8 sm:py-12 lg:py-16'>
          <div className='mb-8 text-center'>
            <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Built for Reliability</p>
            <h2 className={sectionTitle}>Safe, trackable, and recoverable.</h2>
            <p className='text-muted-foreground mx-auto mt-2 max-w-2xl text-sm sm:text-base'>
              Your planning data is always saved, versioned, and protected with role-based access controls.
            </p>
          </div>

          <BuiltForReliability />
        </section>

        {/* 7. Pricing — value is fully established, ready to convert */}
        <section className='relative py-8 sm:py-10 lg:py-12'>
          <div className='relative z-10'>
            <div className='text-center'>
              <p className='text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase'>Pricing</p>
              <h2 className={sectionTitle}>Choose the right plan for your planning workflow.</h2>
              <p className='text-muted-foreground mx-auto mt-2 max-w-2xl text-sm sm:text-base'>
                Select from flexible tiers designed for couples, planners, and teams running complex timelines,
                budgets, and decisions in one shared workspace.
              </p>
            </div>

            <div className='mt-10 flex justify-center'>
              <div className='inline-flex items-center gap-3 rounded-full border border-border/70 bg-card px-4 py-2'>
                <button
                  type='button'
                  onClick={() => setBillingCycle('monthly')}
                  className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                >
                  Monthly
                </button>
                <button
                  type='button'
                  role='switch'
                  aria-checked={billingCycle === 'annual'}
                  onClick={() => setBillingCycle(prev => (prev === 'monthly' ? 'annual' : 'monthly'))}
                  className={`relative h-8 w-16 rounded-[10px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${billingCycle === 'annual'
                    ? 'border-primary/60 bg-primary/90'
                    : 'border-border/80 bg-muted'
                    }`}
                  aria-label='Toggle annual billing'
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className={`absolute top-1 grid h-6 w-6 place-content-center rounded-md border border-black/10 bg-white text-[9px] shadow-[0_8px_16px_-10px_rgba(15,23,42,0.45)] ${billingCycle === 'annual' ? 'left-[34px]' : 'left-1'
                      }`}
                  >
                    <span className='text-black/45'>◻︎</span>
                  </motion.span>
                </button>
                <button
                  type='button'
                  onClick={() => setBillingCycle('annual')}
                  className={`text-sm font-medium transition-colors ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'
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
                      : `Billed annually (TSh ${plan.annualTotal?.toLocaleString()})`

                return (
                  <article
                    key={plan.tier}
                    className={`relative rounded-2xl border border-border/70 bg-card p-6 ${plan.featured
                      ? 'z-10 -translate-y-0.5 border-primary/35 shadow-[0_24px_56px_-40px_rgba(15,23,42,0.4)]'
                      : 'shadow-[0_16px_36px_-34px_rgba(15,23,42,0.28)]'
                      }`}
                  >
                    <div className='mb-4 flex items-center justify-between gap-3'>
                      <span className='inline-flex size-8 items-center justify-center rounded-full border border-border/70 text-xs font-semibold text-muted-foreground'>
                        {plan.index}
                      </span>
                      {plan.featured ? (
                        <span role='status' className='inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground'>
                          <SparklesIcon className='size-3' aria-hidden='true' />
                          Most popular
                        </span>
                      ) : null}
                    </div>

                    <h3 className='text-3xl leading-none font-semibold tracking-tight'>{plan.tier}</h3>
                    <p className='text-muted-foreground mt-2 text-sm'>{plan.subtitle}</p>

                    <div className='mt-8'>
                      <p className='text-4xl leading-none font-semibold tracking-tight'>
                        {plan.monthlyPrice === 0 ? plan.label : `TSh ${formatPrice(monthlyValue)}`}
                        {plan.monthlyPrice === 0 ? null : (
                          <span className='text-muted-foreground ml-1 text-lg font-medium'>/mo</span>
                        )}
                      </p>
                      <p className='text-muted-foreground mt-2 text-sm font-medium'>{billedText}</p>
                    </div>

                    <a
                      href='/signup'
                      aria-label={`${plan.cta} — ${plan.tier} plan`}
                      className={`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition ${plan.featured
                        ? 'bg-primary text-primary-foreground shadow-[0_16px_30px_-22px_color-mix(in_oklab,var(--primary)_65%,black)] hover:bg-primary/90'
                        : 'bg-foreground text-background shadow-[0_14px_28px_-20px_rgba(0,0,0,0.45)] hover:opacity-95'
                        }`}
                    >
                      {plan.cta}
                      <span className='text-xs'>{plan.ctaIcon}</span>
                    </a>

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

        {/* 8. FAQ — handle remaining objections */}
        <FAQ faqItems={planningFaqs} />

        {/* 9. Final CTA */}
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
              <SecondaryOrionButton size='lg' className='rounded-lg bg-accent text-accent-foreground hover:bg-accent/85' asChild>
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
