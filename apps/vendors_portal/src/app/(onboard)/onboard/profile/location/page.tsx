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
    draft.houseNumber.trim() &&
    draft.street.trim() &&
    draft.ward.trim() &&
    draft.district.trim() &&
    Boolean(draft.region)

  const onNext = () => {
    if (!canContinue) return
    router.push('/onboard/profile/contact')
  }

  return (
    <OnboardShell
      step="profile"
      profileLabel={category?.profileLabel ?? 'Vendor'}
      backHref="/onboard/profile/name"
      primaryAction={
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          {t('common.next_step')}
        </PrimaryButton>
      }
    >
      <OnboardHeading title={t('profile.location.title')} />

      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>{t('profile.location.house.label')}</FieldLabel>
            <TextInput
              placeholder={t('profile.location.house.placeholder')}
              value={draft.houseNumber}
              onChange={(e) => update({ houseNumber: e.target.value })}
              autoComplete="address-line1"
            />
          </div>
          <div>
            <FieldLabel required>{t('profile.location.street.label')}</FieldLabel>
            <TextInput
              placeholder={t('profile.location.street.placeholder')}
              value={draft.street}
              onChange={(e) => update({ street: e.target.value })}
              autoComplete="address-line2"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>{t('profile.location.ward.label')}</FieldLabel>
            <TextInput
              placeholder={t('profile.location.ward.placeholder')}
              value={draft.ward}
              onChange={(e) => update({ ward: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel required>{t('profile.location.district.label')}</FieldLabel>
            <TextInput
              placeholder={t('profile.location.district.placeholder')}
              value={draft.district}
              onChange={(e) => update({ district: e.target.value })}
              autoComplete="address-level2"
            />
          </div>
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
          <FieldLabel>{t('profile.location.landmark.label')}</FieldLabel>
          <TextInput
            placeholder={t('profile.location.landmark.placeholder')}
            value={draft.landmark}
            onChange={(e) => update({ landmark: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-10">
        <WhyWeAsk title={t('profile.location.why.title')}>
          <p>{t('profile.location.why.body1')}</p>
          <p>{t('profile.location.why.body2')}</p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
