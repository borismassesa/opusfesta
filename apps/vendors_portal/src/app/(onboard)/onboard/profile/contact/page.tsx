'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())

export default function ContactPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
    else if (!draft.phone) router.replace('/onboard/profile/location')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, draft.phone, router])

  const useBusinessPhone = !draft.whatsapp || draft.whatsapp === draft.phone

  const setUseBusinessPhone = (use: boolean) => {
    update({ whatsapp: use ? draft.phone : '' })
  }

  const canContinue = isValidEmail(draft.email) && Boolean(draft.whatsapp.trim())

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/profile/socials')
  }

  return (
    <OnboardShell
      step="profile"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/profile/location"
    >
      <OnboardHeading
        title="How should couples reach you?"
        description="We send inquiry alerts to your email and your WhatsApp — most Tanzanian couples message vendors on WhatsApp first."
      />

      <div className="space-y-6 max-w-xl">
        <div>
          <FieldLabel required>Business email</FieldLabel>
          <TextInput
            type="email"
            inputMode="email"
            placeholder="hello@yourstudio.co.tz"
            value={draft.email}
            onChange={(e) => update({ email: e.target.value })}
            autoComplete="email"
          />
          <p className="mt-2 text-xs text-gray-500">
            We use this for inquiry alerts, payouts, and account recovery — never shown publicly.
          </p>
        </div>

        <div>
          <FieldLabel required>WhatsApp number</FieldLabel>
          <TextInput
            prefix="+255"
            placeholder="754 123 456"
            value={draft.whatsapp}
            onChange={(e) => update({ whatsapp: e.target.value.replace(/[^\d\s]/g, '') })}
            inputMode="tel"
            autoComplete="tel-national"
          />
          <label className="mt-3 flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
            <input
              type="checkbox"
              checked={useBusinessPhone}
              onChange={(e) => setUseBusinessPhone(e.target.checked)}
              className="w-4 h-4 accent-gray-900"
            />
            Same as my business phone (+255 {draft.phone || '—'})
          </label>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-6 flex-wrap">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Next step
        </PrimaryButton>
        <WhyWeAsk title="Why we ask for email and WhatsApp">
          <p>
            Inquiries arrive at <strong>both</strong> your email and your WhatsApp so you never miss
            a couple — and so couples get a fast first response, which is the single biggest driver
            of bookings on OpusFesta.
          </p>
          <p>
            Your WhatsApp number is only shared with couples after they send you an inquiry. Email
            is never shown publicly.
          </p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
