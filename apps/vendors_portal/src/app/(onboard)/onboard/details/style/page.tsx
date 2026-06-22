'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { OptionCard } from '@/components/onboard/OptionCard'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { getStylesForCategory } from '@/lib/onboarding/styles'
import { useOnboardT } from '@/lib/onboarding/strings'

export default function StylePage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const { t } = useOnboardT()
  const category = findCategory(draft.categoryId)
  const styles = useMemo(() => getStylesForCategory(draft.categoryId), [draft.categoryId])

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, router])

  const onNext = () => {
    if (!draft.style) return
    router.push('/onboard/details/personality')
  }

  return (
    <OnboardShell
      step="details"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/details/services"
    >
      <OnboardHeading
        title={t('details.style.title')}
        description={t('details.style.subtitle')}
      />

      <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
        {styles.map((s) => (
          <OptionCard
            key={s.id}
            variant="radio"
            label={s.label}
            description={s.body}
            selected={draft.style === s.id}
            onToggle={() => update({ style: s.id })}
          />
        ))}
      </div>

      <div className="mt-10">
        <PrimaryButton onClick={onNext} disabled={!draft.style}>
          {t('common.next_step')}
        </PrimaryButton>
      </div>
    </OnboardShell>
  )
}
