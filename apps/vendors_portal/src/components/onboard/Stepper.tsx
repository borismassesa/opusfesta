'use client'

import Link from 'next/link'
import { Fragment } from 'react'
import { Check } from 'lucide-react'
import Logo from '../ui/Logo'
import { useOnboardingDraft, type OnboardingDraft } from '@/lib/onboarding/draft'
import { cn } from '@/lib/utils'

export type StepKey = 'profile' | 'details' | 'pricing' | 'review'

type Step = {
  key: StepKey
  label: string
  href: string
  isComplete: (draft: OnboardingDraft) => boolean
}

const profileComplete = (d: OnboardingDraft) =>
  Boolean(
    d.firstName.trim() &&
      d.lastName.trim() &&
      d.street.trim() &&
      d.city.trim() &&
      d.region &&
      d.phone.trim().length >= 9 &&
      d.email.trim() &&
      d.whatsapp.trim() &&
      d.serviceMarkets.length >= 0,
  )

const detailsComplete = (d: OnboardingDraft) =>
  Boolean(
    d.bio.trim().length >= 80 &&
      d.yearsInBusiness.trim() &&
      d.languages.length > 0 &&
      d.style &&
      d.personality,
  )

const pricingComplete = (d: OnboardingDraft) =>
  d.packages.length > 0 &&
  d.packages.every((p) => p.name.trim() && p.price.trim()) &&
  Boolean(d.cancellationLevel) &&
  Boolean(d.reschedulePolicy) &&
  Boolean(d.payoutMethod) &&
  d.payoutNumber.trim() !== '' &&
  d.payoutAccountName.trim() !== ''

const reviewComplete = (d: OnboardingDraft) => Boolean(d.submittedAt)

export function Stepper({
  current,
  profileLabel,
}: {
  current: StepKey | null
  profileLabel: string
}) {
  const { draft, hydrated } = useOnboardingDraft()

  const steps: Step[] = [
    {
      key: 'profile',
      label: `${profileLabel} profile`,
      href: '/onboard/profile/name',
      isComplete: profileComplete,
    },
    { key: 'details', label: 'Details', href: '/onboard/details/about', isComplete: detailsComplete },
    { key: 'pricing', label: 'Pricing', href: '/onboard/pricing', isComplete: pricingComplete },
    { key: 'review', label: 'Review', href: '/onboard/review', isComplete: reviewComplete },
  ]

  const completed = steps.map((s) => (hydrated ? s.isComplete(draft) : false))
  const completedCount = completed.filter(Boolean).length
  const progressPct =
    completedCount === 0 && current
      ? // Show partial fill on whichever step is active
        Math.max(8, ((steps.findIndex((s) => s.key === current) + 0.5) / steps.length) * 100)
      : (completedCount / steps.length) * 100

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="relative px-6 lg:px-12 py-4 flex items-center justify-center overflow-x-auto">
        <Link
          href="/"
          aria-label="OpusFesta home"
          className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 shrink-0"
        >
          <Logo className="h-7 w-auto text-gray-900" />
        </Link>

        <ol
          className="flex items-center gap-1 lg:gap-2 text-sm"
          aria-label="Onboarding progress"
        >
          {steps.map((step, i) => {
            const isActive = step.key === current
            const isComplete = completed[i] && !isActive
            // Show partial connector to active step from the previous completed one
            const connectorActive = completed[i - 1] || (isActive && completed[i - 1])

            return (
              <Fragment key={step.key}>
                {i > 0 ? (
                  <li
                    aria-hidden
                    className={cn(
                      'h-[2px] w-6 lg:w-10 rounded-full transition-colors duration-500',
                      connectorActive ? 'bg-emerald-500' : 'bg-gray-200',
                    )}
                  />
                ) : null}
                <li>
                  <StepItem
                    index={i + 1}
                    label={step.label}
                    isActive={isActive}
                    isComplete={isComplete}
                    href={isComplete ? step.href : undefined}
                  />
                </li>
              </Fragment>
            )
          })}
        </ol>
      </div>

      {/* Progress bar — bottom edge of header */}
      <div className="h-1 w-full bg-gray-100 relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
          aria-hidden
        />
      </div>
    </header>
  )
}

function StepItem({
  index,
  label,
  isActive,
  isComplete,
  href,
}: {
  index: number
  label: string
  isActive: boolean
  isComplete: boolean
  href?: string
}) {
  const circle = (
    <span
      className={cn(
        'shrink-0 inline-flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-full text-xs font-bold transition-all duration-300',
        isActive && 'bg-gray-900 text-white shadow-md scale-105',
        isComplete && 'bg-emerald-500 text-white',
        !isActive && !isComplete && 'bg-white border-2 border-gray-300 text-gray-400',
      )}
      aria-hidden
    >
      {isComplete ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : index}
    </span>
  )

  const text = (
    <span
      className={cn(
        'whitespace-nowrap transition-colors duration-200',
        isActive && 'text-gray-900 font-semibold',
        isComplete && 'text-emerald-700 font-semibold',
        !isActive && !isComplete && 'text-gray-400 font-medium',
      )}
    >
      {label}
    </span>
  )

  const inner = (
    <>
      {circle}
      {text}
    </>
  )

  const baseClasses =
    'inline-flex items-center gap-2 lg:gap-2.5 px-2 lg:px-2.5 py-1.5 rounded-full transition-colors'

  if (href && !isActive) {
    return (
      <Link
        href={href}
        className={cn(baseClasses, 'hover:bg-gray-50 group cursor-pointer')}
        aria-current={isActive ? 'step' : undefined}
      >
        {inner}
      </Link>
    )
  }

  return (
    <span
      className={baseClasses}
      aria-current={isActive ? 'step' : undefined}
    >
      {inner}
    </span>
  )
}
