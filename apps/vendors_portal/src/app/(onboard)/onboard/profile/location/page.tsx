'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { WhyWeAsk } from '@/components/onboard/WhyWeAsk'
import { FieldLabel, SelectInput, TextInput } from '@/components/onboard/FormField'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { TZ_REGIONS } from '@/lib/onboarding/regions'
import { useOnboardT } from '@/lib/onboarding/strings'

export default function LocationPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const { t } = useOnboardT()
  const category = findCategory(draft.categoryId)

  useEffect(() => {
    if (!hydrated) return
    if (!draft.categoryId) router.replace('/onboard/category')
    else if (!draft.vowsAccepted) router.replace('/onboard/vows')
  }, [hydrated, draft.categoryId, draft.vowsAccepted, router])

  const canContinue =
    draft.street.trim() && draft.city.trim() && draft.region && draft.phone.trim().length >= 9

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/profile/contact')
  }

  return (
    <OnboardShell
      step="profile"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/profile/name"
    >
      <OnboardHeading title={t('profile.location.title')} />

      <div className="space-y-6 max-w-2xl">
        <div>
          <FieldLabel required>{t('profile.location.street.label')}</FieldLabel>
          <div className="space-y-3">
            <TextInput
              placeholder={t('profile.location.street.placeholder')}
              value={draft.street}
              onChange={(e) => update({ street: e.target.value })}
              autoComplete="address-line1"
            />
            <TextInput
              placeholder={t('profile.location.street2.placeholder')}
              value={draft.street2}
              onChange={(e) => update({ street2: e.target.value })}
              autoComplete="address-line2"
            />
          </div>
        </div>

        <div>
          <FieldLabel required>{t('profile.location.city.label')}</FieldLabel>
          <TextInput
            placeholder={t('profile.location.city.placeholder')}
            value={draft.city}
            onChange={(e) => update({ city: e.target.value })}
            autoComplete="address-level2"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>{t('profile.location.region.label')}</FieldLabel>
            <SelectInput
              placeholder={t('profile.location.region.placeholder')}
              value={draft.region}
              onChange={(e) => update({ region: e.target.value })}
            >
              {TZ_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>{t('profile.location.postal.label')}</FieldLabel>
            <TextInput
              placeholder={t('profile.location.postal.placeholder')}
              value={draft.postalCode}
              onChange={(e) => update({ postalCode: e.target.value })}
              autoComplete="postal-code"
            />
          </div>
        </div>

        <div>
          <FieldLabel required>{t('profile.location.phone.label')}</FieldLabel>
          <TextInput
            prefix="+255"
            placeholder={t('profile.location.phone.placeholder')}
            value={draft.phone}
            onChange={(e) => update({ phone: e.target.value.replace(/[^\d\s]/g, '') })}
            inputMode="tel"
            autoComplete="tel-national"
          />
        </div>
      </div>

      <div className="mt-10 flex items-center gap-6 flex-wrap">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          {t('common.next_step')}
        </PrimaryButton>
        <WhyWeAsk title={t('profile.location.why.title')}>
          <p>{t('profile.location.why.body1')}</p>
          <p>{t('profile.location.why.body2')}</p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
