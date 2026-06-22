'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { OptionCard } from '@/components/onboard/OptionCard'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { PERSONALITY_OPTIONS } from '@/lib/onboarding/personality'
import { useOnboardT } from '@/lib/onboarding/strings'

export default function PersonalityPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const { t } = useOnboardT()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, router])

  const onNext = () => {
    if (!draft.personality) return
    router.push('/onboard/pricing')
  }

  return (
    <OnboardShell
      step="details"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/details/style"
    >
      <OnboardHeading
        title={t('details.personality.title')}
        description={t('details.personality.subtitle')}
      />

      <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
        {PERSONALITY_OPTIONS.map((p) => (
          <OptionCard
            key={p.id}
            variant="radio"
            label={p.label}
            description={p.body}
            selected={draft.personality === p.id}
            onToggle={() => update({ personality: p.id })}
          />
        ))}
      </div>

      <div className="mt-10">
        <PrimaryButton onClick={onNext} disabled={!draft.personality}>
          {t('common.next_step')}
        </PrimaryButton>
      </div>
    </OnboardShell>
  )
}
