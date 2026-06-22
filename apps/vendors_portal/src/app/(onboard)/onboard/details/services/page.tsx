'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { OptionCard } from '@/components/onboard/OptionCard'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { getServicesForCategory } from '@/lib/onboarding/services'
import { useOnboardT } from '@/lib/onboarding/strings'

export default function ServicesPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const { t } = useOnboardT()
  const category = findCategory(draft.categoryId)
  const services = useMemo(() => getServicesForCategory(draft.categoryId), [draft.categoryId])

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, router])

  const toggle = (id: string) => {
    const set = new Set(draft.specialServices)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    update({ specialServices: Array.from(set) })
  }

  const onNext = () => router.push('/onboard/details/style')

  return (
    <OnboardShell
      step="details"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/details/about"
    >
      <OnboardHeading
        title={t('details.services.title')}
        description={t('common.select_all_that_apply')}
      />

      <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
        {services.map((s) => (
          <OptionCard
            key={s.id}
            variant="checkbox"
            label={s.label}
            selected={draft.specialServices.includes(s.id)}
            onToggle={() => toggle(s.id)}
          />
        ))}
      </div>

      <div className="mt-10">
        <PrimaryButton onClick={onNext}>{t('common.next_step')}</PrimaryButton>
      </div>
    </OnboardShell>
  )
}
