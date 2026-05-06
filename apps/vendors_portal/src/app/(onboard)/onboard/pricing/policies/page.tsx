'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Check } from 'lucide-react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import { OptionCard } from '@/components/onboard/OptionCard'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import {
  CANCELLATION_OPTIONS,
  DEPOSIT_PRESETS,
  RESCHEDULE_OPTIONS,
} from '@/lib/onboarding/policies'
import { cn } from '@/lib/utils'

export default function PoliciesPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
    else if (draft.packages.length === 0) router.replace('/onboard/pricing')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, draft.packages.length, router])

  const depositNum = Number(draft.depositPercent)
  const validDeposit =
    Number.isFinite(depositNum) && depositNum >= 5 && depositNum <= 100
  const canContinue = validDeposit && draft.cancellationLevel && draft.reschedulePolicy

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/pricing/payout')
  }

  return (
    <OnboardShell
      step="pricing"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/pricing"
    >
      <OnboardHeading
        title="Booking policies"
        description="These show up at checkout so couples know exactly what they’re agreeing to. You can change them anytime. Existing bookings keep the policy that was active when they confirmed."
      />

      <div className="space-y-12 max-w-3xl">
        {/* Deposit */}
        <section>
          <h2 className="text-base font-semibold tracking-tight text-gray-900">
            Deposit to confirm a booking
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            How much of the package price couples pay upfront to lock in their date.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 mb-4">
            {DEPOSIT_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => update({ depositPercent: p })}
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  draft.depositPercent === p
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400',
                )}
              >
                {p}%
              </button>
            ))}
          </div>

          <div className="max-w-xs">
            <FieldLabel>Custom percentage</FieldLabel>
            <TextInput
              inputMode="numeric"
              placeholder="e.g. 25"
              value={draft.depositPercent}
              onChange={(e) =>
                update({ depositPercent: e.target.value.replace(/[^\d]/g, '').slice(0, 3) })
              }
            />
            {!validDeposit && draft.depositPercent ? (
              <p className="mt-2 text-xs text-rose-600">Enter a value between 5 and 100.</p>
            ) : null}
          </div>
        </section>

        {/* Cancellation */}
        <section>
          <h2 className="text-base font-semibold tracking-tight text-gray-900">
            Cancellation policy
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            What couples get back if they cancel before the event.
          </p>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            {CANCELLATION_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                variant="radio"
                label={opt.label}
                description={
                  <>
                    <span className="block">{opt.body}</span>
                    <ul className="mt-2 space-y-1 text-xs text-gray-700">
                      {opt.schedule.map((line) => (
                        <li key={line} className="flex items-start gap-1.5">
                          <Check
                            className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0"
                            strokeWidth={3}
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                }
                selected={draft.cancellationLevel === opt.id}
                onToggle={() => update({ cancellationLevel: opt.id })}
              />
            ))}
          </div>
        </section>

        {/* Reschedule */}
        <section>
          <h2 className="text-base font-semibold tracking-tight text-gray-900">
            Reschedule policy
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            What happens when a couple needs to move their date.
          </p>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            {RESCHEDULE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                variant="radio"
                label={opt.label}
                description={opt.body}
                selected={draft.reschedulePolicy === opt.id}
                onToggle={() => update({ reschedulePolicy: opt.id })}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-12 flex items-center gap-6 flex-wrap">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Next step
        </PrimaryButton>
        <WhyWeAsk title="Why we ask about policies">
          <p>
            Couples want to know the rules before they pay a deposit. Vendors with clear, fair
            policies convert significantly better, and OpusFesta uses your policies to handle
            cancellations and refunds automatically. So you don’t have to argue.
          </p>
          <p>
            Pick the level that matches your real cancellation costs. You can always update these
            for new bookings, and existing bookings keep the policy they were created under.
          </p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
