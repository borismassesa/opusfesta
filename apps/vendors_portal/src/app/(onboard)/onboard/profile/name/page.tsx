'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'

export default function NamePage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, router])

  const canContinue = draft.firstName.trim() && draft.lastName.trim()

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/profile/location')
  }

  return (
    <OnboardShell
      step="profile"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/vows"
    >
      <OnboardHeading title="What is your name?" />
      <div className="space-y-5 max-w-xl">
        <div>
          <FieldLabel required>First name</FieldLabel>
          <TextInput
            placeholder="First name"
            value={draft.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            autoComplete="given-name"
          />
        </div>
        <div>
          <FieldLabel required>Last name</FieldLabel>
          <TextInput
            placeholder="Last name"
            value={draft.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            autoComplete="family-name"
          />
        </div>
        <div>
          <FieldLabel>Business name</FieldLabel>
          <TextInput
            placeholder="e.g. Festa Films"
            value={draft.businessName}
            onChange={(e) => update({ businessName: e.target.value })}
            autoComplete="organization"
          />
        </div>
      </div>

      <div className="mt-10">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Next step
        </PrimaryButton>
      </div>
    </OnboardShell>
  )
}
