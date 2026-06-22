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
import { useOnboardT } from '@/lib/onboarding/strings'

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())

export default function ContactPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const { t } = useOnboardT()
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
        title={t('profile.contact.title')}
        description={t('profile.contact.subtitle')}
      />

      <div className="space-y-6 max-w-xl">
        <div>
          <FieldLabel required>{t('profile.contact.email.label')}</FieldLabel>
          <TextInput
            type="email"
            inputMode="email"
            placeholder={t('profile.contact.email.placeholder')}
            value={draft.email}
            onChange={(e) => update({ email: e.target.value })}
            autoComplete="email"
          />
          <p className="mt-2 text-xs text-gray-500">
            {t('profile.contact.email.hint')}
          </p>
        </div>

        <div>
          <FieldLabel required>{t('profile.contact.whatsapp.label')}</FieldLabel>
          <TextInput
            prefix="+255"
            placeholder={t('profile.contact.whatsapp.placeholder')}
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
            {t('profile.contact.same_as_phone')}
          </label>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-6 flex-wrap">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          {t('common.next_step')}
        </PrimaryButton>
        <WhyWeAsk title={t('profile.contact.why.title')}>
          <p>{t('profile.contact.why.body1')}</p>
          <p>{t('profile.contact.why.body2')}</p>
        </WhyWeAsk>
      </div>
    </OnboardShell>
  )
}
