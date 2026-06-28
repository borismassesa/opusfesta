'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardShell } from '@/components/onboard/OnboardShell'
import { OnboardHeading } from '@/components/onboard/OnboardHeading'
import { PrimaryButton } from '@/components/onboard/PrimaryButton'
import { FieldLabel, TextInput } from '@/components/onboard/FormField'
import { LogoUpload } from '@/components/onboard/LogoUpload'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { findCategory } from '@/lib/onboarding/categories'
import { uploadOnboardingLogo } from '@/lib/onboarding/logo-upload'
import { useOnboardT } from '@/lib/onboarding/strings'

export default function NamePage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const { t } = useOnboardT()
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
      primaryAction={
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          {t('common.next_step')}
        </PrimaryButton>
      }
    >
      <OnboardHeading title={t('profile.name.title')} />
      <div className="space-y-5">
        <div>
          <FieldLabel required>{t('profile.name.first.label')}</FieldLabel>
          <TextInput
            placeholder={t('profile.name.first.label')}
            value={draft.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            autoComplete="given-name"
          />
        </div>
        <div>
          <FieldLabel required>{t('profile.name.last.label')}</FieldLabel>
          <TextInput
            placeholder={t('profile.name.last.label')}
            value={draft.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            autoComplete="family-name"
          />
        </div>
        <div>
          <FieldLabel>{t('profile.name.business.label')}</FieldLabel>
          <TextInput
            placeholder={t('profile.name.business.placeholder')}
            value={draft.businessName}
            onChange={(e) => update({ businessName: e.target.value })}
            autoComplete="organization"
          />
        </div>
        <div>
          <FieldLabel>Logo or profile picture</FieldLabel>
          <div className="mt-1">
            <LogoUpload
              value={draft.logo}
              onChange={(url) => update({ logo: url })}
              upload={async (file) => {
                const fd = new FormData()
                fd.append('file', file)
                return uploadOnboardingLogo(fd)
              }}
              hint="Optional. Square works best. Shown on your storefront."
            />
          </div>
        </div>
      </div>
    </OnboardShell>
  )
}
